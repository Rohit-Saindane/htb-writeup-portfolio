/**
 * Authoritative Writeup Grounding & Portfolio Knowledge Engine
 * 
 * Deeply grounds the CyberAssistant chatbot with Rohit's exact, verified writeups,
 * eliminates LLM hallucinations, enables bit-by-bit cross-checking against online CVE sources,
 * and automatically provides clickable cross-references for repeating attack methodologies.
 */

import { getAllWriteups, getWriteupBySlug, Writeup } from "@/lib/mdx";

export interface ResolvedWriteupGrounding {
  writeup: Writeup;
  matchedSlug: string;
  matchedName: string;
  specificPhase?: "foothold" | "privesc" | "recon" | "general";
  groundingInstruction: string;
  relatedMethodologyLinks: string;
  detectedCves: string[];
  recommendedSearchQueries: string[];
}

// Canonical vulnerability classification across all 15 machines in the portfolio
export interface MethodologyTarget {
  machineName: string;
  slug: string;
  os: "windows" | "linux";
  headingAnchor: string;
  technique: string;
  summary: string;
}

export interface MethodologyEntry {
  category: string;
  os?: "windows" | "linux" | "cross_platform";
  keywords: string[];
  targets: MethodologyTarget[];
}

export const PORTFOLIO_METHODOLOGIES: MethodologyEntry[] = [
  {
    category: "Active Directory & Windows Domain Privilege Escalation",
    os: "windows",
    keywords: [
      "active directory",
      "ad",
      "kerberos",
      "domain controller",
      "dc",
      "rbcd",
      "petitpotam",
      "gmsa",
      "shadow credentials",
      "adcs",
      "esc17",
      "bloodhound",
      "mimikatz",
      "rubeus",
      "rodc",
      "key list attack",
      "tier1",
      "s4u2proxy",
      "domain admin",
      "privilege escalation",
      "privesc",
    ],
    targets: [
      {
        machineName: "Garfield",
        slug: "garfield",
        os: "windows",
        headingAnchor: "step-4-privilege-escalation",
        technique: "Tier1 addSelf ACL Abuse & RODC Key List Attack",
        summary: "Abusing Tier1 addSelf rights over the Administrators group to compromise the Read-Only Domain Controller and perform a Key List attack.",
      },
      {
        machineName: "Logging",
        slug: "logging",
        os: "windows",
        headingAnchor: "step-3-privilege-escalation",
        technique: "ADCS ESC17 Abuse & Rogue WSUS Update Sideloading",
        summary: "Abusing Active Directory Certificate Services ESC17 and sideloading fake WSUS updates to escalate to Domain Administrator.",
      },
      {
        machineName: "Pirate",
        slug: "pirate",
        os: "windows",
        headingAnchor: "step-3-privilege-escalation",
        technique: "Resource-Based Constrained Delegation (RBCD) & S4U2Proxy Takeover",
        summary: "Configuring msDS-AllowedToActOnBehalfOfOtherIdentity and requesting Kerberos S4U2Proxy tickets for Domain Controller takeover.",
      },
      {
        machineName: "Overwatch",
        slug: "overwatch",
        os: "windows",
        headingAnchor: "step-4-privilege-escalation",
        technique: "Active Directory Domain Escalation via Linked Database Servers",
        summary: "Bridging SQL server service accounts across chained database links into full Active Directory enterprise domain control.",
      },
    ],
  },
  {
    category: "Linux Local Privilege Escalation (SUID, Docker, Sudo & Crons)",
    os: "linux",
    keywords: [
      "privilege escalation",
      "privesc",
      "suid",
      "sudo",
      "docker",
      "docker socket",
      "docker group",
      "cron",
      "capabilities",
      "linpeas",
      "facter",
      "root",
    ],
    targets: [
      {
        machineName: "Kobold",
        slug: "kobold",
        os: "linux",
        headingAnchor: "step-3-privilege-escalation",
        technique: "Docker Socket Group Abuse (CVE-2026-23744)",
        summary: "Mounting the host filesystem inside a privileged Docker container to attain full root access.",
      },
      {
        machineName: "AirTouch",
        slug: "airtouch",
        os: "linux",
        headingAnchor: "step-5-root-access",
        technique: "Custom SUID Binary Reverse Engineering & SNMP Community Enumeration",
        summary: "Reverse engineering SUID binary logic flaws and command injection to spawn a root terminal.",
      },
      {
        machineName: "DevArea",
        slug: "devarea",
        os: "linux",
        headingAnchor: "step-4-privilege-escalation",
        technique: "World-Writable Cron Binary Hijacking",
        summary: "Replacing an unprotected binary executed by periodic root crontabs with a custom SUID bash spawner.",
      },
      {
        machineName: "Facts",
        slug: "facts",
        os: "linux",
        headingAnchor: "step-3-privilege-escalation",
        technique: "Facter Custom Ruby Facts Privilege Escalation",
        summary: "Dropping a malicious Ruby fact file executed automatically by root during Puppet/Facter runs.",
      },
      {
        machineName: "CCTV",
        slug: "cctv",
        os: "linux",
        headingAnchor: "step-3-privilege-escalation",
        technique: "Chisel Reverse Port Forwarding & motionEye Command Injection",
        summary: "Tunnelling internal port 8765 to attacker machine using chisel, then executing root commands via motionEye API.",
      },
      {
        machineName: "Silentium",
        slug: "silentium",
        os: "linux",
        headingAnchor: "step-3-privilege-escalation",
        technique: "MPD Audio Daemon Buffer Overflow",
        summary: "Corrupting stack memory in a local MPD service to gain root privileges.",
      },
      {
        machineName: "VariaType",
        slug: "variatype",
        os: "linux",
        headingAnchor: "step-3-privilege-escalation",
        technique: "Automated Cron Job Command Injection & setuptools Traversal",
        summary: "Tampering with system script arguments and traversing Python package directories to hijack root execution.",
      },
    ],
  },
  {
    category: "SQL Injection & Database Exploitation",
    os: "cross_platform",
    keywords: [
      "sqli",
      "sql injection",
      "sqlmap",
      "blind sql",
      "time-based sql",
      "union sql",
      "sql payload",
      "inject sql",
      "database injection",
      "sqlite injection",
      "mssql injection",
    ],
    targets: [
      {
        machineName: "CCTV",
        slug: "cctv",
        os: "linux",
        headingAnchor: "step-2-initial-foothold",
        technique: "Authenticated ZoneMinder SQLi in 'tid' parameter (CVE-2024-51428)",
        summary: "Time-based blind SQL injection in event removetag action used to dump database hashes and gain SSH access.",
      },
      {
        machineName: "Overwatch",
        slug: "overwatch",
        os: "windows",
        headingAnchor: "step-3-initial-foothold",
        technique: "MSSQL Linked Server Crawling & SQL Query Injection",
        summary: "Abusing SQL server links across chained databases to execute arbitrary SQL commands and privilege escalate.",
      },
      {
        machineName: "Eloquia",
        slug: "eloquia",
        os: "windows",
        headingAnchor: "step-2-initial-foothold",
        technique: "SQLite load_extension() Arbitrary DLL Execution",
        summary: "Leveraging SQLite extension loading queries to execute custom malicious DLLs and achieve initial code execution.",
      },
    ],
  },
  {
    category: "OS Command Injection & Remote Code Execution",
    os: "cross_platform",
    keywords: [
      "command injection",
      "os command injection",
      "cmd injection",
      "remote code execution",
      "rce via command",
    ],
    targets: [
      {
        machineName: "CCTV",
        slug: "cctv",
        os: "linux",
        headingAnchor: "step-3-privilege-escalation",
        technique: "motionEye OS Command Injection (CVE-2025-60787)",
        summary: "Unauthenticated local web service API abuse allowing arbitrary command execution to elevate to root.",
      },
      {
        machineName: "DevArea",
        slug: "devarea",
        os: "linux",
        headingAnchor: "step-3-initial-foothold",
        technique: "Apache CXF XOP Injection & Hoverfly Middleware RCE",
        summary: "Exploiting middleware API communication and XML message pipelines to trigger unauthenticated command execution.",
      },
      {
        machineName: "VariaType",
        slug: "variatype",
        os: "linux",
        headingAnchor: "step-3-privilege-escalation",
        technique: "Automated Cron Job Command Injection",
        summary: "Tampering with system script arguments executed by periodic root crontabs to execute arbitrary commands.",
      },
      {
        machineName: "Browsed",
        slug: "browsed",
        os: "linux",
        headingAnchor: "step-3-initial-foothold",
        technique: "Headless Chrome Extension Command Injection & Python Cache Poisoning",
        summary: "Exploiting Chrome sandbox escape via extension handlers and poisoning Python __pycache__ bytecode.",
      },
      {
        machineName: "Overwatch",
        slug: "overwatch",
        os: "windows",
        headingAnchor: "step-3-initial-foothold",
        technique: "SOAP Web Service Command Injection",
        summary: "Crafting malicious XML SOAP requests to execute system commands through the target web service daemon.",
      },
    ],
  },
  {
    category: "Path Traversal, LFI & Arbitrary File Read",
    os: "cross_platform",
    keywords: [
      "path traversal",
      "directory traversal",
      "lfi",
      "local file inclusion",
      "arbitrary file read",
      "file read",
      "tarfile",
    ],
    targets: [
      {
        machineName: "Facts",
        slug: "facts",
        os: "linux",
        headingAnchor: "step-2-initial-foothold",
        technique: "Camaleon CMS Path Traversal (CVE-2024-46987)",
        summary: "Exploiting CMS media upload path traversal to extract private SSH keys and administrative credentials.",
      },
      {
        machineName: "DevArea",
        slug: "devarea",
        os: "linux",
        headingAnchor: "step-3-initial-foothold",
        technique: "Apache CXF LFI (CVE-2022-46364)",
        summary: "Reading internal system files and configuration tokens through unvalidated XML file references.",
      },
      {
        machineName: "WingData",
        slug: "wingdata",
        os: "linux",
        headingAnchor: "step-3-initial-foothold",
        technique: "Python tarfile Path Traversal (CVE-2025-4517)",
        summary: "Overwriting arbitrary session files or extracting admin tokens through archive traversal extraction.",
      },
      {
        machineName: "VariaType",
        slug: "variatype",
        os: "linux",
        headingAnchor: "step-3-privilege-escalation",
        technique: "setuptools PackageIndex Path Traversal (CVE-2025-47273)",
        summary: "Traversing Python package directories to hijack module imports and execute privileged code.",
      },
    ],
  },
  {
    category: "Deserialization, XML & Template Injection (SSTI)",
    os: "cross_platform",
    keywords: [
      "deserialization",
      "ssti",
      "template injection",
      "xml",
      "xxe",
      "fonttools",
      "mirth connect",
      "jinja",
    ],
    targets: [
      {
        machineName: "Interpreter",
        slug: "interpreter",
        os: "linux",
        headingAnchor: "step-2-initial-foothold",
        technique: "Mirth Connect Deserialization RCE (CVE-2023-43208)",
        summary: "Unauthenticated Java object deserialization vulnerability leading to direct interactive shell access.",
      },
      {
        machineName: "VariaType",
        slug: "variatype",
        os: "linux",
        headingAnchor: "step-2-initial-foothold",
        technique: "fontTools CDATA XML Injection (CVE-2025-66034)",
        summary: "Injecting malicious XML entities into font metadata tables during compilation to read files and achieve execution.",
      },
      {
        machineName: "WingData",
        slug: "wingdata",
        os: "linux",
        headingAnchor: "step-3-initial-foothold",
        technique: "Wing FTP Server Unauthenticated RCE via XML Manipulation (CVE-2025-47812)",
        summary: "Manipulating wacky.xml configuration files on Wing FTP to execute unauthorized system commands.",
      },
    ],
  },
  {
    category: "Credential Extraction & Password Cracking",
    os: "cross_platform",
    keywords: [
      "hashcat",
      "john",
      "bcrypt",
      "crack",
      "hash",
      "dpapi",
      "credential dump",
      "password cracking",
      "ssh key",
      "rockyou",
    ],
    targets: [
      {
        machineName: "CCTV",
        slug: "cctv",
        os: "linux",
        headingAnchor: "step-2-initial-foothold",
        technique: "Hashcat Bcrypt Cracking (Mode 3200)",
        summary: "Cracking user 'mark' bcrypt hash ($2y$10$prZ...) with rockyou.txt to reveal 'opensesame' for SSH login.",
      },
      {
        machineName: "Facts",
        slug: "facts",
        os: "linux",
        headingAnchor: "step-2-initial-foothold",
        technique: "John the Ripper SSH Key Passphrase Cracking",
        summary: "Extracting id_rsa hash with ssh2john.py and cracking the passphrase using wordlist rules.",
      },
      {
        machineName: "Eloquia",
        slug: "eloquia",
        os: "windows",
        headingAnchor: "step-6-dumping-the-credentials",
        technique: "DPAPI Master Key Decryption & Microsoft Edge Password Extraction",
        summary: "Decrypting the Windows Data Protection API (DPAPI) vault to harvest stored browser credentials.",
      },
      {
        machineName: "Garfield",
        slug: "garfield",
        os: "windows",
        headingAnchor: "step-3-initial-foothold",
        technique: "SYSVOL Logon Script Cleartext Credential Extraction",
        summary: "Recovering embedded domain credentials from SYSVOL batch scripts to gain initial Active Directory access.",
      },
    ],
  },
];

/**
 * Match a target machine from user prompt, page context, or recent conversation messages.
 */
export function resolveTargetWriteup(
  prompt: string,
  contextMachineName?: string,
  conversationMessages?: Array<{ content?: string; role?: string }>
): { writeup: Writeup; matchedSlug: string; matchedName: string } | null {
  const allWriteups = getAllWriteups();
  if (allWriteups.length === 0) return null;

  const cleanPrompt = prompt.toLowerCase();

  // Helper: check if a string mentions a machine
  const checkMention = (text: string): { slug: string; name: string } | null => {
    const lower = text.toLowerCase();
    for (const w of allWriteups) {
      const slug = w.slug.toLowerCase();
      const title = w.title.toLowerCase();
      const mName = w.machineName.toLowerCase();

      // Check whole-word boundary matches
      const slugRegex = new RegExp(`\\b${escapeRegExp(slug)}\\b`, "i");
      const titleRegex = new RegExp(`\\b${escapeRegExp(title)}\\b`, "i");
      const mNameRegex = new RegExp(`\\b${escapeRegExp(mName)}\\b`, "i");

      // Handle split names like "dev area", "wing data", "air touch"
      const spacedSlug = slug.replace(/-/g, " ");
      const spacedRegex = new RegExp(`\\b${escapeRegExp(spacedSlug)}\\b`, "i");

      if (
        slugRegex.test(lower) ||
        titleRegex.test(lower) ||
        mNameRegex.test(lower) ||
        spacedRegex.test(lower)
      ) {
        return { slug: w.slug, name: w.machineName || w.title };
      }
    }
    return null;
  };

  // 1. Direct mention in the latest user prompt
  const directMatch = checkMention(cleanPrompt);
  if (directMatch) {
    const full = getWriteupBySlug(directMatch.slug);
    if (full) return { writeup: full, matchedSlug: directMatch.slug, matchedName: directMatch.name };
  }

  // 2. Client-provided context (e.g. user is actively viewing /writeups/cctv)
  if (contextMachineName) {
    const contextMatch = allWriteups.find(
      (w) =>
        w.machineName.toLowerCase() === contextMachineName.toLowerCase() ||
        w.title.toLowerCase() === contextMachineName.toLowerCase() ||
        w.slug.toLowerCase() === contextMachineName.toLowerCase()
    );
    if (contextMatch) {
      const full = getWriteupBySlug(contextMatch.slug);
      if (full) return { writeup: full, matchedSlug: contextMatch.slug, matchedName: contextMatch.machineName };
    }
  }

  // 3. Lookback in recent conversation turns (multi-turn conversation continuity)
  if (Array.isArray(conversationMessages) && conversationMessages.length > 0) {
    const recent = [...conversationMessages].reverse().slice(0, 5);
    for (const msg of recent) {
      if (typeof msg.content === "string") {
        const historyMatch = checkMention(msg.content);
        if (historyMatch) {
          const full = getWriteupBySlug(historyMatch.slug);
          if (full) return { writeup: full, matchedSlug: historyMatch.slug, matchedName: historyMatch.name };
        }
      }
    }
  }

  // 4. Content / Flag / Tool match in writeup corpus
  // If the user asks about a specific flag (e.g. --remove-mic, --delegate-access),
  // script (e.g. wacky.xml), parameter, or unique CVE that is documented in a writeup,
  // resolve that writeup directly!
  const flagOrToolMatch = cleanPrompt.match(/(?:^|\s)(--?[a-zA-Z0-9_-]{2,}|cve-\d{4}-\d{4,7}|[a-zA-Z0-9_-]+\.(?:xml|py|sh|rb|php|aspx))/i);
  if (flagOrToolMatch) {
    const term = flagOrToolMatch[1].toLowerCase();
    const candidateMatches: { slug: string; name: string; occurrences: number }[] = [];

    for (const w of allWriteups) {
      const full = getWriteupBySlug(w.slug);
      if (full) {
        const lowerContent = full.content.toLowerCase();
        let occurrences = 0;
        let pos = lowerContent.indexOf(term);
        while (pos !== -1 && occurrences < 10) {
          occurrences++;
          pos = lowerContent.indexOf(term, pos + term.length);
        }
        if (occurrences > 0) {
          candidateMatches.push({ slug: w.slug, name: w.machineName || w.title, occurrences });
        }
      }
    }

    if (candidateMatches.length > 0) {
      // Sort by highest occurrence
      candidateMatches.sort((a, b) => b.occurrences - a.occurrences);
      const best = candidateMatches[0];
      const full = getWriteupBySlug(best.slug);
      if (full) return { writeup: full, matchedSlug: best.slug, matchedName: best.name };
    }
  }

  return null;
}

/**
 * Detect which operational phase the user is asking about
 */
export function detectInquiryPhase(prompt: string): "foothold" | "privesc" | "recon" | "general" {
  const lower = prompt.toLowerCase();
  if (
    /\b(initial\s*foothold|foothold|entry|user\s*flag|user\.txt|initial\s*access|get\s*in|first\s*shell|user\s*shell)\b/i.test(
      lower
    )
  ) {
    return "foothold";
  }
  if (
    /\b(privesc|privilege\s*escalation|root|root\s*flag|root\.txt|root\s*shell|escalate|priv\s*esc|become\s*root)\b/i.test(
      lower
    )
  ) {
    return "privesc";
  }
  if (
    /\b(recon|reconnaissance|nmap|ports?|services?|enumeration|scan|scans|open\s*ports?)\b/i.test(
      lower
    )
  ) {
    return "recon";
  }
  return "general";
}

/**
 * Extract CVE identifiers mentioned in a writeup or prompt
 */
export function extractCvesFromText(text: string): string[] {
  const matches = text.match(/\bCVE-\d{4}-\d{4,7}\b/gi) || [];
  return Array.from(new Set(matches.map((c) => c.toUpperCase())));
}

/**
 * Find related methodologies across Rohit's portfolio to construct clickable markdown cross-references.
 * Strictly respects inquiry particularity and OS architecture:
 * - If target machine is Windows (or user inquires about Windows/AD), scan ONLY for Windows methodologies and Windows targets.
 * - If target machine is Linux (or user inquires about Linux), scan ONLY for Linux methodologies and Linux targets.
 * - If the technique does not repeat across 2+ writeups of the matching OS, return empty.
 */
export function findRelatedMethodologies(
  currentSlug: string,
  userPrompt: string,
  phaseSnippet?: string,
  explicitOs?: "windows" | "linux"
): { linksMarkdown: string; categoryName: string }[] {
  const cleanPrompt = userPrompt.toLowerCase();
  const results: { linksMarkdown: string; categoryName: string }[] = [];

  // Determine target machine OS
  let machineOs: "windows" | "linux" | undefined = explicitOs;
  if (!machineOs && currentSlug) {
    const currentWriteup = getWriteupBySlug(currentSlug);
    if (currentWriteup?.metadata.os === "windows" || currentWriteup?.metadata.os === "linux") {
      machineOs = currentWriteup.metadata.os;
    }
  }

  // Check if user prompt explicitly specifies or focuses on an OS
  if (/\b(windows|ad|active\s*directory|domain\s*controller|kerberos|bloodhound|mimikatz|rubeus)\b/i.test(cleanPrompt)) {
    machineOs = "windows";
  } else if (/\b(linux|unix|suid|sudo|docker\s*socket|linpeas|cron)\b/i.test(cleanPrompt) && !explicitOs) {
    machineOs = "linux";
  }

  // Check if the prompt explicitly focuses on a unique technique (e.g., DNS poisoning in Overwatch)
  const isDnsQuery = /\b(dns\s*poisoning|dns\s*spoofing|poisoning\s*dns)\b/i.test(cleanPrompt);
  if (isDnsQuery) {
    // DNS poisoning only exists in Overwatch; it does not repeat across multiple writeups
    return [];
  }

  for (const entry of PORTFOLIO_METHODOLOGIES) {
    // Strict OS matching: if category is OS-specific (e.g. Windows AD vs Linux privesc),
    // and machineOs is known, strictly skip mismatched categories!
    if (machineOs && entry.os && entry.os !== "cross_platform" && entry.os !== machineOs) {
      continue;
    }

    // 1. Direct match: user explicitly mentions this methodology in their prompt
    let isRelevant = entry.keywords.some((kw) => {
      const regex = new RegExp(`\\b${escapeRegExp(kw)}\\b`, "i");
      return regex.test(cleanPrompt);
    });

    // 2. Phase-based match: if user asks for a generic phase (e.g., "foothold" or "privesc") without naming the vulnerability,
    // check if the snippet of that specific phase in the target writeup matches this methodology
    if (!isRelevant && phaseSnippet && /\b(foothold|initial\s*foothold|privesc|privilege\s*escalation)\b/i.test(cleanPrompt)) {
      const lowerSnippet = phaseSnippet.toLowerCase();
      isRelevant = entry.keywords.some((kw) => {
        const regex = new RegExp(`\\b${escapeRegExp(kw)}\\b`, "i");
        return regex.test(lowerSnippet);
      });
    }

    if (!isRelevant) continue;

    // Filter targets: include other machines in the portfolio (excluding the current machine)
    // and strictly enforce OS matching
    const relatedTargets = entry.targets.filter((t) => {
      if (t.slug === currentSlug) return false;
      if (machineOs && entry.os !== "cross_platform" && t.os !== machineOs) return false;
      if (machineOs && entry.os === "cross_platform" && /\b(privesc|privilege\s*escalation)\b/i.test(cleanPrompt) && t.os !== machineOs) {
        return false;
      }
      return true;
    });

    // Strictly require that the methodology exists in more than one writeup
    if (relatedTargets.length > 0) {
      let md = `\n**${entry.category}**:\n`;
      relatedTargets.forEach((t) => {
        md += `- [${t.machineName} - ${t.technique}](/writeups/${t.slug}#${t.headingAnchor}): ${t.summary}\n`;
      });
      results.push({
        categoryName: entry.category,
        linksMarkdown: md,
      });
    }
  }

  return results;
}

/**
 * Build complete writeup grounding instruction for Gemini
 */
export function buildWriteupGrounding(
  writeup: Writeup,
  userPrompt: string
): {
  groundingInstruction: string;
  relatedMethodologyLinks: string;
  detectedCves: string[];
  recommendedSearchQueries: string[];
} {
  const { metadata, content } = writeup;
  const phase = detectInquiryPhase(userPrompt);
  const detectedCves = extractCvesFromText(`${userPrompt} ${content} ${(metadata.tags || []).join(" ")}`);

  // Extract snippet for the requested phase if applicable
  let phaseSnippet = "";
  if (phase === "foothold") {
    const fhMatch = content.match(/##\s*Step\s*\d+\s*-\s*Initial Foothold[\s\S]*?(?=##\s*Step|$)/i);
    phaseSnippet = fhMatch ? fhMatch[0].slice(0, 500) : "";
  } else if (phase === "privesc") {
    const peMatch = content.match(/##\s*Step\s*\d+\s*-\s*Privilege Escalation[\s\S]*?(?=##\s*Step|$)/i);
    phaseSnippet = peMatch ? peMatch[0].slice(0, 500) : "";
  }

  // Build targeted search queries for online verification
  const recommendedSearchQueries: string[] = [];
  if (detectedCves.length > 0) {
    detectedCves.forEach((cve) => {
      recommendedSearchQueries.push(`${cve} vulnerability exploit analysis advisory`);
    });
  }
  if (metadata.tags && metadata.tags.length > 0) {
    const topTags = metadata.tags.slice(0, 3).join(" ");
    recommendedSearchQueries.push(`${metadata.machineName} ${topTags} Hack The Box`);
  }

  // Build portfolio cross references with strict particularity and machine OS matching
  const machineOs = metadata.os === "windows" || metadata.os === "linux" ? metadata.os : undefined;
  const relatedMethodologies = findRelatedMethodologies(
    metadata.slug,
    userPrompt,
    phaseSnippet,
    machineOs
  );

  let crossRefMarkdown = "";
  if (relatedMethodologies.length > 0) {
    crossRefMarkdown += `### 🔗 Related Exploitations in Portfolio\n`;
    crossRefMarkdown += `If you want to study this vulnerability pattern or attack methodology across Rohit's other writeups:\n`;
    relatedMethodologies.forEach((rm) => {
      crossRefMarkdown += rm.linksMarkdown;
    });
  }

  // Detect if user prompt asks about a flag, command, or unique keyword in the writeup to supply exact redirection button
  const flagOrCommandMatch = userPrompt.match(/(?:^|\s)(--?[a-zA-Z0-9_-]{2,}|cve-\d{4}-\d{4,7}|[a-zA-Z0-9_-]+\.(?:xml|py|sh|rb|php|aspx))/i);
  let directFlagRedirectionNotice = "";

  if (flagOrCommandMatch) {
    const term = flagOrCommandMatch[1].toLowerCase();
    const termIdx = content.toLowerCase().indexOf(term);
    if (termIdx !== -1) {
      // Find enclosing heading before termIdx
      const beforeText = content.substring(0, termIdx);
      const lines = beforeText.split(/\r?\n/);
      let headingTitle = "";
      for (let i = lines.length - 1; i >= 0; i--) {
        const line = lines[i].trim();
        if (line.startsWith("## ") || line.startsWith("### ")) {
          headingTitle = line.replace(/^#{2,3}\s+/, "").trim();
          break;
        }
      }

      if (headingTitle) {
        const cleanHeadingText = headingTitle.replace(/^[^\w\s-]+\s*/, "").trim();
        const headingAnchor = cleanHeadingText
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)+/g, "");

        directFlagRedirectionNotice = `\n### 📖 DIRECT WRITEUP SECTION REFERENCE:\n` +
          `The term or flag "${flagOrCommandMatch[1]}" is documented in Rohit's writeup for ${metadata.machineName} under the section: "${cleanHeadingText}".\n` +
          `When confirming the reference or providing redirection to the user, you MUST include this clean markdown reference link:\n` +
          `[${metadata.machineName}: ${cleanHeadingText}](/writeups/${metadata.slug}#${headingAnchor})\n` +
          `CRITICAL RULE ON WRITEUP REDIRECTION: For Rohit's portfolio writeups, NEVER use external URLs like "https://www.hackthebox.com/writeups/..." or "https://rohitsaindane.com/...". ONLY use the internal relative link format above so the terminal renders a sleek reference card! (Note: Real external links to GitHub tool repos, CVE PoCs, and documentation are fully encouraged for external cyber resources.)\n`;
      }
    }
  }

  // Construct the authoritative grounding prompt
  let instruction = `\n=================================================================\n`;
  instruction += `### AUTHORITATIVE GROUND TRUTH WRITEUP FOR "${metadata.title}" (HTB ${metadata.difficulty.toUpperCase()} ${metadata.os.toUpperCase()}):\n`;
  instruction += `The user is inquiring about the target machine "${metadata.title}" documented in Rohit Saindane's portfolio.\n`;
  instruction += `You MUST adhere with 100% BIT-BY-BIT FIDELITY to Rohit's exact writeup below. NEVER HALLUCINATE OR SUBSTITUTE DETAILS.\n\n`;

  if (directFlagRedirectionNotice) {
    instruction += directFlagRedirectionNotice;
    instruction += `\n`;
  }

  instruction += `#### TARGET SPECIFICATIONS & DISCOVERIES:\n`;
  instruction += `- Machine Name: ${metadata.title} (Slug: /writeups/${metadata.slug})\n`;
  instruction += `- Operating System: ${metadata.os}\n`;
  instruction += `- Difficulty: ${metadata.difficulty}\n`;
  instruction += `- Season: ${metadata.season}\n`;
  instruction += `- Tags & Key Techniques: ${(metadata.tags || []).join(", ")}\n`;
  if (metadata.machineIP) instruction += `- Target IP: ${metadata.machineIP}\n`;
  if (phase !== "general") {
    instruction += `- Operator Inquiry Phase Focus: ${phase.toUpperCase()} (Deliver an exhaustive, step-by-step breakdown of this exact phase)\n`;
  }
  instruction += `\n`;

  instruction += `#### EXACT VERIFIED WRITEUP CONTENT:\n`;
  instruction += `\`\`\`markdown\n`;
  instruction += `${content}\n`;
  instruction += `\`\`\`\n\n`;

  instruction += `#### STRICT OPERATIONAL GROUNDING DIRECTIVES FOR THIS RESPONSE:\n`;
  instruction += `1. **Parameter & Endpoint Absolute Fidelity**:\n`;
  instruction += `   - Use the EXACT parameter names, URLs, and HTTP actions recorded in the writeup.\n`;
  instruction += `   - Example: On CCTV, the authenticated ZoneMinder SQL injection (CVE-2024-51428) is in the \`tid\` parameter of the \`removetag\` action. NEVER say \`mid\` or \`monitor\`.\n`;
  instruction += `2. **Exploitation Pathway Absolute Fidelity**:\n`;
  instruction += `   - Explain the EXACT steps Rohit performed to achieve the foothold or privilege escalation.\n`;
  instruction += `   - If the foothold was achieved by using sqlmap to dump database hashes, cracking user 'mark' bcrypt hash with Hashcat, and logging in via SSH, state THAT EXACT SEQUENCE step-by-step.\n`;
  instruction += `   - NEVER fabricate web reverse shells, netcat listeners, or web filters unless they are explicitly in Rohit's writeup.\n`;
  instruction += `3. **Command Reproducibility**:\n`;
  instruction += `   - Provide the EXACT commands (sqlmap, nmap, hashcat, chisel, python, etc.) directly from the writeup in copyable \`\`\`bash blocks.\n`;
  instruction += `4. **Credentials & Evidence Integrity**:\n`;
  instruction += `   - Use the exact usernames (e.g. \`mark\`, \`admin\`), dumped hashes (\`$2y$10$prZ...\`), and cracked passwords (e.g. \`opensesame\`) documented in the writeup.\n`;
  
  if (relatedMethodologies.length > 0) {
    instruction += `5. **Portfolio Cross-References (Repeating Methodology Detected)**:\n`;
    instruction += `   - The specific attack methodology requested by the user is also demonstrated in other machines in Rohit's portfolio.\n`;
    instruction += `   - Conclude your technical explanation with ONLY the matching section below:\n`;
    instruction += `${crossRefMarkdown}\n`;
    instruction += `   - DO NOT add unrelated categories (e.g., do not add SQL Injection if the user asked about Active Directory or DNS).\n`;
  } else {
    instruction += `5. **Portfolio Cross-References Directive (NO REPEATING METHODOLOGY)**:\n`;
    instruction += `   - The specific technique or concept asked by the operator is unique to this machine (or does not repeat in other writeups in Rohit's portfolio).\n`;
    instruction += `   - ABSOLUTELY DO NOT output any "### 🔗 Related Exploitations in Portfolio" section.\n`;
    instruction += `   - ABSOLUTELY DO NOT write "There was no reference found across the writeups." or any similar sentence.\n`;
    instruction += `   - Conclude your technical explanation naturally and directly without any reference section.\n`;
  }
  instruction += `=================================================================\n`;

  return {
    groundingInstruction: instruction,
    relatedMethodologyLinks: crossRefMarkdown,
    detectedCves,
    recommendedSearchQueries,
  };
}

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
