import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { getAllWriteups, WriteupMetadata } from "@/lib/mdx";
import { generateCyberConceptCard, CyberConceptCard } from "@/lib/gemini";
import { isVulnerabilityOrTechnicalQuery } from "@/lib/searchGrounding";

export const runtime = "nodejs";

// In-memory cache for CyberConceptCards to avoid repeated Gemini calls
const conceptCache = new Map<string, CyberConceptCard>();

// In-memory cache for writeup full texts
let writeupContentCache: { metadata: WriteupMetadata; content: string }[] | null = null;

function loadAllWriteupContents() {
  if (process.env.NODE_ENV === "production" && writeupContentCache) return writeupContentCache;

  const contentDir = path.join(process.cwd(), "content", "writeups");
  if (!fs.existsSync(contentDir)) {
    writeupContentCache = [];
    return writeupContentCache;
  }

  const allMetadata = getAllWriteups();
  writeupContentCache = allMetadata.map((meta) => {
    try {
      const fullPath = path.join(process.cwd(), meta.filePath);
      if (fs.existsSync(fullPath)) {
        const raw = fs.readFileSync(fullPath, "utf8");
        const { content } = matter(raw);
        return { metadata: meta, content };
      }
    } catch {
      // fallback
    }
    return { metadata: meta, content: meta.summary };
  });

  return writeupContentCache;
}

export interface SearchResultItem {
  slug: string;
  title: string;
  machineName: string;
  os: "linux" | "windows";
  difficulty: string;
  season: string;
  tags: string[];
  snippet?: string;
  matchType: "title" | "tag" | "content";
  headingId?: string;
  headingText?: string;
  score?: number;
}

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function findEnclosingHeading(
  content: string,
  matchIndex: number
): { headingText: string; headingId: string } | null {
  if (matchIndex < 0) return null;
  const textBefore = content.substring(0, matchIndex);
  const lines = textBefore.split(/\r?\n/);
  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i].trim();
    if (line.startsWith("## ") || line.startsWith("### ")) {
      const rawText = line.replace(/^#{2,3}\s+/, "").trim();
      // Remove leading emojis/icons e.g. 🔴 or 🛡️
      const cleanText = rawText.replace(/^[^\w\s-]+\s*/, "").trim();
      const headingId = cleanText
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
      return { headingText: cleanText, headingId };
    }
  }
  return null;
}

function findBestContentMatch(
  content: string,
  query: string
): { snippet: string; index: number; headingId?: string; headingText?: string } {
  const lowerContent = content.toLowerCase();
  const lowerQuery = query.toLowerCase();

  // Find all indices of query in content
  const indices: number[] = [];
  let pos = lowerContent.indexOf(lowerQuery);
  while (pos !== -1 && indices.length < 50) {
    indices.push(pos);
    pos = lowerContent.indexOf(lowerQuery, pos + lowerQuery.length);
  }

  if (indices.length === 0) {
    return { snippet: "", index: -1 };
  }

  // Score each occurrence by its heading quality (prioritize actual exploitation steps over Target Information)
  let bestIndex = indices[0];
  let bestHeading: { headingText: string; headingId: string } | null = null;
  let bestHeadingPriority = -1;

  for (const idx of indices) {
    const heading = findEnclosingHeading(content, idx);
    let priority = 0;
    if (heading) {
      const hText = heading.headingText.toLowerCase();
      // Highest priority: heading directly names the vulnerability or tool
      if (hText.includes(lowerQuery)) {
        priority = 50;
      } else if (
        hText.includes("escalation") ||
        hText.includes("foothold") ||
        hText.includes("exploit") ||
        hText.includes("step 2") ||
        hText.includes("step 3") ||
        hText.includes("step 4")
      ) {
        priority = 10;
      } else if (!hText.includes("target information") && !hText.includes("reconnaissance")) {
        priority = 5;
      } else {
        priority = 1;
      }
    }

    if (priority > bestHeadingPriority) {
      bestHeadingPriority = priority;
      bestHeading = heading;
      bestIndex = idx;
    }
  }

  // Fallback to first heading if no high-priority was found
  if (!bestHeading && indices.length > 0) {
    bestHeading = findEnclosingHeading(content, bestIndex);
  }

  const start = Math.max(0, bestIndex - 50);
  const end = Math.min(content.length, bestIndex + query.length + 80);
  let snippet = content.slice(start, end).replace(/\r?\n/g, " ").trim();
  snippet = snippet.replace(/[`#*_\[\]]/g, "");
  const fullSnippet = `${start > 0 ? "..." : ""}${snippet}${end < content.length ? "..." : ""}`;

  return {
    snippet: fullSnippet,
    index: bestIndex,
    headingId: bestHeading?.headingId,
    headingText: bestHeading?.headingText,
  };
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = (searchParams.get("q") || "").trim();

  if (!query || query.length < 2) {
    return NextResponse.json({
      query,
      writeups: [],
      cyberConcept: null,
    });
  }

  const lowerQ = query.toLowerCase();
  const writeupsData = loadAllWriteupContents();
  const allScoredMatches: SearchResultItem[] = [];

  const isWindowsCentric =
    /active\s*d|adcs|kerberos|kerberoast|smb|gpo|rpc|mimikatz|bloodhound|zerologon|ntlm|winrm|esc\d+/i.test(
      query
    );
  const isLinuxCentric =
    /\blinux\b|suid|sudo|cron|linpeas|nfs|ssh|gtfobins/i.test(query);

  // Strict CVE gate: If the user searches a specific CVE, only match writeups that contain that exact CVE
  const isCveQuery = /\bCVE-\d{4}-\d{4,7}\b/i.test(query);

  const STOP_WORDS = new Set(["the", "and", "for", "with", "this", "that", "from", "cve", "http", "step", "vulnerability"]);
  const tokens = lowerQ
    .split(/[\s_-]+/)
    .filter((t) => t.length >= 3 && !STOP_WORDS.has(t) && !/^\d{4}$/.test(t));

  // 1. Search and score all writeups
  for (const item of writeupsData) {
    const meta = item.metadata;

    // If query is an exact CVE, only allow writeups that explicitly mention this exact CVE
    let isCveMatch = false;
    if (isCveQuery) {
      const hasExactCveInTags = meta.tags.some((t) => t.toLowerCase() === lowerQ);
      const hasExactCveInSummary = meta.summary.toLowerCase().includes(lowerQ);
      const hasExactCveInContent = item.content.toLowerCase().includes(lowerQ);

      if (!hasExactCveInTags && !hasExactCveInSummary && !hasExactCveInContent) {
        continue;
      }
      isCveMatch = true;
    }

    const cleanQuery = lowerQ
      .replace(/\b(htb|hack\s*the\s*box|hackthebox|machine|box|writeup|walkthrough|analysis)\b/gi, "")
      .trim();

    const titleExact =
      meta.title.toLowerCase() === lowerQ ||
      meta.machineName.toLowerCase() === lowerQ ||
      (cleanQuery.length >= 2 &&
        (meta.title.toLowerCase() === cleanQuery ||
          meta.machineName.toLowerCase() === cleanQuery));

    const titlePartial =
      meta.title.toLowerCase().includes(lowerQ) ||
      meta.machineName.toLowerCase().includes(lowerQ) ||
      (cleanQuery.length >= 3 &&
        (meta.title.toLowerCase().includes(cleanQuery) ||
          meta.machineName.toLowerCase().includes(cleanQuery))) ||
      (meta.machineName.length >= 3 && lowerQ.includes(meta.machineName.toLowerCase()));

    const exactTag = meta.tags.some((t) => t.toLowerCase() === lowerQ);
    const partialTag = meta.tags.some((t) => t.toLowerCase().includes(lowerQ));
    const tokenTagMatch =
      tokens.length > 1 &&
      meta.tags.some((tag) => {
        const tagLower = tag.toLowerCase();
        return tokens.some((t) => tagLower.includes(t) && t.length >= 4);
      });
    const summaryMatch = meta.summary.toLowerCase().includes(lowerQ);

    const { snippet, index, headingId, headingText } = findBestContentMatch(
      item.content,
      lowerQ
    );
    const contentMatch = index !== -1;

    if (
      isCveMatch ||
      titleExact ||
      titlePartial ||
      exactTag ||
      partialTag ||
      tokenTagMatch ||
      summaryMatch ||
      contentMatch
    ) {
      let score = 0;
      let matchType: "title" | "tag" | "content" = "content";
      let displaySnippet = snippet;

      if (isCveMatch) {
        score += 180;
      }

      if (titleExact) {
        score += 220;
        matchType = "title";
        displaySnippet = meta.summary;
      } else if (titlePartial) {
        score += 140;
        matchType = "title";
        displaySnippet = meta.summary;
      }

      if (exactTag) {
        score += 120;
        if (matchType !== "title") {
          matchType = "tag";
          displaySnippet = `Tagged under: ${meta.tags.filter((t) => t.toLowerCase() === lowerQ).join(", ")}. ${meta.summary}`;
        }
      } else if (partialTag) {
        score += 70;
        if (matchType !== "title") {
          matchType = "tag";
          displaySnippet = `Tagged under: ${meta.tags.filter((t) => t.toLowerCase().includes(lowerQ)).join(", ")}. ${meta.summary}`;
        }
      } else if (tokenTagMatch) {
        score += 55;
        if (matchType !== "title") {
          matchType = "tag";
          const matchedTags = meta.tags.filter((tag) =>
            tokens.some((t) => tag.toLowerCase().includes(t) && t.length >= 4)
          );
          displaySnippet = `Tagged under: ${matchedTags.join(", ")}. ${meta.summary}`;
        }
      }

      if (summaryMatch) {
        score += 35;
      }

      if (contentMatch) {
        const regex = new RegExp(`\\b${escapeRegExp(lowerQ)}\\b`, "gi");
        const occurrences = (item.content.match(regex) || []).length;
        if (occurrences > 0) {
          score += Math.min(occurrences * 8, 45);
        } else {
          score += 25; // Substring match in credentials, parameters, flags, or commands
        }
      }

      // Domain-specific OS alignment bonuses and penalties
      if (isWindowsCentric) {
        if (meta.os === "windows") {
          score += 50;
        } else if (meta.os === "linux" && !exactTag && !partialTag) {
          // Heavily penalize casual Linux mentions of Windows AD concepts (e.g. PEAP notes)
          score -= 90;
        }
      }

      if (isLinuxCentric) {
        if (meta.os === "linux") {
          score += 50;
        } else if (meta.os === "windows" && !exactTag && !partialTag) {
          score -= 50;
        }
      }

      // Only add candidates with positive relevance
      if (score >= 20) {
        allScoredMatches.push({
          slug: meta.slug,
          title: meta.title,
          machineName: meta.machineName,
          os: meta.os,
          difficulty: meta.difficulty,
          season: meta.season,
          tags: meta.tags,
          snippet: displaySnippet,
          matchType,
          headingId,
          headingText,
          score,
        });
      }
    }
  }

  // Sort by highest score first
  allScoredMatches.sort((a, b) => (b.score || 0) - (a.score || 0));

  // If high-confidence matches (score >= 80) exist, prune out low-scoring noise (score < 40)
  const hasHighConfidenceMatches = allScoredMatches.some((m) => (m.score || 0) >= 80);
  const filteredMatches = hasHighConfidenceMatches
    ? allScoredMatches.filter((m) => (m.score || 0) >= 40)
    : allScoredMatches;

  const matchedWriteups = filteredMatches.slice(0, 6);

  // 2. Cyber Concept Card (Intelligence Dossier or Mr. Robot Signal Deviation)
  let cyberConcept: CyberConceptCard | null = null;
  const cacheKey = lowerQ.trim();
  const cached = conceptCache.get(cacheKey);

  if (cached) {
    cyberConcept = cached;
  } else if (cacheKey.length >= 2) {
    try {
      const card = await generateCyberConceptCard(query, {
        matchedWriteups,
      });
      if (card) {
        const isTechQuery = isVulnerabilityOrTechnicalQuery(query) || matchedWriteups.length > 0;
        if (isTechQuery && (card.isOffTopic || card.title.includes("Signal Deviation") || card.category.includes("Real-World Noise"))) {
          card.isOffTopic = false;
          // If title or definition was hallucinated as off-topic, rebuild cleanly from the matching writeup
          if (card.title.includes("Signal Deviation") && matchedWriteups.length > 0) {
            const firstW = matchedWriteups[0];
            card.title = `${firstW.machineName}: ${query} Technical Analysis`;
            card.category = firstW.os === "windows" ? "Active Directory / Windows Security" : "Linux / Web Security";
            card.cveOrStandard = firstW.tags.find((t) => t.toLowerCase().startsWith("cve-")) || "Security Standard";
            card.definition = `Technical parameter or command verified in Rohit's ${firstW.machineName} writeup. ${firstW.snippet || ""}`;
            card.attackMechanics = `Demonstrated on ${firstW.machineName} (${firstW.title}) during the ${firstW.headingText || "exploitation phase"}.`;
            card.defenseMitigation = "Enforce least-privilege service configurations, apply relevant security updates, and monitor authentication telemetry.";
            card.labPractice = `Review the complete walkthrough in /writeups/${firstW.slug}.`;
            card.tags = ["Hack The Box", firstW.machineName, query, ...firstW.tags.slice(0, 3)];
          }
        }
        conceptCache.set(cacheKey, card);
        cyberConcept = card;
      }
    } catch (err) {
      console.error("Concept generation failed:", err);
    }
  }

  return NextResponse.json({
    query,
    writeups: matchedWriteups,
    cyberConcept,
  });
}
