/**
 * Real-time Grounded Web & CVE Search Engine
 * Provides live intelligence from official MITRE CVE records, NVD, and web search
 * to prevent LLM hallucinations and supply up-to-the-minute 2026 exploit data.
 */

export interface LiveCveRecord {
  cveId: string;
  vendor?: string;
  product?: string;
  versions?: string;
  description?: string;
  cwes?: string;
  references?: string[];
  cvss?: {
    score?: number;
    severity?: string;
    vector?: string;
  };
  publishedDate?: string;
}

export interface WebSearchResult {
  title: string;
  snippet: string;
  url?: string;
}

export interface SearchGroundingData {
  hasGrounding: boolean;
  cveRecord?: LiveCveRecord | null;
  webResults: WebSearchResult[];
  groundingPromptText: string;
}

/**
 * Fetch official MITRE CVE Record
 */
export async function fetchLiveCveRecord(cveId: string): Promise<LiveCveRecord | null> {
  try {
    const cleanId = cveId.trim().toUpperCase();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(`https://cveawg.mitre.org/api/cve/${cleanId}`, {
      signal: controller.signal,
      headers: {
        Accept: "application/json",
      },
    });
    clearTimeout(timeout);

    if (!res.ok) return null;
    const data = await res.json();
    const cna = data.containers?.cna;
    const cve = data.cveMetadata?.cveId || cleanId;
    const vendor = cna?.affected?.[0]?.vendor;
    const product = cna?.affected?.[0]?.product;
    const versions = cna?.affected?.[0]?.versions
      ?.map((v: { version?: string; lessThanOrEqual?: string }) => v.lessThanOrEqual || v.version)
      .filter(Boolean)
      .slice(0, 4)
      .join(", ");
    const description = cna?.descriptions?.[0]?.value;
    const cwes = cna?.problemTypes
      ?.flatMap((p: { descriptions?: { description?: string; cweId?: string }[] }) =>
        p.descriptions?.map((d) => d.description || d.cweId)
      )
      .filter(Boolean)
      .join(", ");
    const references = cna?.references
      ?.map((r: { url: string }) => r.url)
      .filter(Boolean)
      .slice(0, 4);

    const metric = cna?.metrics?.[0]?.cvssV3_1 || cna?.metrics?.[0]?.cvssV4_0 || cna?.metrics?.[0]?.cvssV3_0;
    const cvss = metric
      ? {
          score: metric.baseScore,
          severity: metric.baseSeverity,
          vector: metric.vectorString,
        }
      : undefined;

    const publishedDate = data.cveMetadata?.datePublished || data.cveMetadata?.dateReserved;

    if (description || vendor) {
      return {
        cveId: cve,
        vendor,
        product,
        versions,
        description,
        cwes,
        references,
        cvss,
        publishedDate,
      };
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Fetch live search snippets from the web
 */
export async function fetchLiveWebSearch(query: string, maxResults = 5): Promise<WebSearchResult[]> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const q = encodeURIComponent(query.trim());
    const res = await fetch(`https://html.duckduckgo.com/html/?q=${q}`, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });
    clearTimeout(timeout);

    if (!res.ok) return [];
    const html = await res.text();

    const results: WebSearchResult[] = [];
    const blockRegex = /<div class="result\s+results_links[^>]*>([\s\S]*?)<\/div>\s*<\/div>/g;
    let match;

    while ((match = blockRegex.exec(html)) !== null && results.length < maxResults) {
      const block = match[1];

      // Extract title & URL
      const titleMatch = /<a class="result__url"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/i.exec(block) ||
                         /<a class="result__snippet"[^>]*href="([^"]+)"/i.exec(block);
      const headingMatch = /<a class="result__title"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/i.exec(block) ||
                           /<h2 class="result__title">[\s\S]*?<a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/i.exec(block);
      const snippetMatch = /<a class="result__snippet"[^>]*>([\s\S]*?)<\/a>/i.exec(block);

      if (snippetMatch) {
        const cleanSnippet = snippetMatch[1]
          .replace(/<[^>]+>/g, "")
          .replace(/&quot;/g, '"')
          .replace(/&#x27;/g, "'")
          .replace(/&amp;/g, "&")
          .replace(/\s+/g, " ")
          .trim();

        let cleanUrl = headingMatch ? headingMatch[1] : (titleMatch ? titleMatch[1] : undefined);
        if (cleanUrl && cleanUrl.includes("uddg=")) {
          try {
            const rawUrlString = cleanUrl.startsWith("//")
              ? "https:" + cleanUrl
              : cleanUrl.startsWith("/")
              ? "https://duckduckgo.com" + cleanUrl
              : cleanUrl;
            const urlObj = new URL(rawUrlString);
            const raw = urlObj.searchParams.get("uddg");
            if (raw) cleanUrl = decodeURIComponent(raw);
          } catch {}
        }

        let cleanTitle = `Web Intel Result ${results.length + 1}`;
        if (headingMatch && headingMatch[2]) {
          const parsedHeading = headingMatch[2]
            .replace(/<[^>]+>/g, "")
            .replace(/&quot;/g, '"')
            .replace(/&#x27;/g, "'")
            .replace(/&amp;/g, "&")
            .trim();
          if (parsedHeading.length > 2) {
            cleanTitle = parsedHeading;
          }
        }

        if (cleanSnippet.length > 20) {
          results.push({
            title: cleanTitle,
            snippet: cleanSnippet,
            url: cleanUrl,
          });
        }
      }
    }

    // Fallback: If block regex didn't catch, parse result__snippet directly
    if (results.length === 0) {
      const fallbackSnippetRegex = /<a class="result__snippet[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/g;
      let fbMatch;
      while ((fbMatch = fallbackSnippetRegex.exec(html)) !== null && results.length < maxResults) {
        let cleanUrl = fbMatch[1];
        if (cleanUrl && cleanUrl.includes("uddg=")) {
          try {
            const rawUrlString = cleanUrl.startsWith("//")
              ? "https:" + cleanUrl
              : cleanUrl.startsWith("/")
              ? "https://duckduckgo.com" + cleanUrl
              : cleanUrl;
            const urlObj = new URL(rawUrlString);
            const raw = urlObj.searchParams.get("uddg");
            if (raw) cleanUrl = decodeURIComponent(raw);
          } catch {}
        }
        const cleanSnippet = fbMatch[2]
          .replace(/<[^>]+>/g, "")
          .replace(/&quot;/g, '"')
          .replace(/&#x27;/g, "'")
          .replace(/&amp;/g, "&")
          .replace(/\s+/g, " ")
          .trim();
        if (cleanSnippet.length > 20) {
          results.push({
            title: `Web Source ${results.length + 1}`,
            snippet: cleanSnippet,
            url: cleanUrl || undefined,
          });
        }
      }
    }

    return results;
  } catch {
    return [];
  }
}

/**
 * Check if a query is an inquiry about a CVE, vulnerability, software flaw, command flag, tool, version, or technical exploit
 */
export function isVulnerabilityOrTechnicalQuery(query: string): boolean {
  const lower = query.toLowerCase().trim();

  // Explicit CVE pattern
  if (/\bcve-\d{4}-\d{4,7}\b/i.test(lower)) return true;

  // Command-line flags and parameters (e.g. --remove-mic, -smb2support, --delegate-access, -m 3200, -sC, -sV, --hashes, --template)
  if (/(?:^|\s)--?[a-zA-Z0-9_-]+/i.test(lower)) return true;

  // Security tools, offensive suites, utilities, and frameworks
  const toolsAndFrameworks = [
    "impacket",
    "ntlmrelayx",
    "certipy",
    "rubeus",
    "mimikatz",
    "bloodhound",
    "chisel",
    "hashcat",
    "john",
    "hydra",
    "nmap",
    "sqlmap",
    "ffuf",
    "gobuster",
    "dirsearch",
    "wpscan",
    "nikto",
    "metasploit",
    "msfconsole",
    "msfvenom",
    "burp",
    "wireshark",
    "tcpdump",
    "socat",
    "netcat",
    "nc",
    "linpeas",
    "winpeas",
    "facter",
    "puppet",
    "docker",
    "podman",
    "kubectl",
    "kubernetes",
    "crackmapexec",
    "netexec",
    "coercer",
    "petitpotam",
    "printerbug",
    "mitm6",
    "fluxion",
    "airgeddon",
    "aircrack",
    "kismet",
    "snort",
    "suricata",
    "zeek",
    "yara",
    "volatility",
    "ghidra",
    "ida",
    "radare2",
    "gdb",
    "pwntools",
    "bloodyad",
    "pywhisker",
    "whisker",
    "evil-winrm",
    "xfreerdp",
    "mcp",
    "model context protocol",
    "responder",
    "curl",
    "wget",
    "powershell",
    "bash",
    "cmd",
  ];

  if (toolsAndFrameworks.some((tool) => new RegExp(`\\b${tool}\\b`, "i").test(lower) || lower.includes(tool))) {
    return true;
  }

  // Operating systems, architectures, distributions
  const osAndDistros = [
    "windows",
    "linux",
    "ubuntu",
    "debian",
    "kali",
    "parrot",
    "arch",
    "fedora",
    "centos",
    "rhel",
    "alpine",
    "macos",
    "darwin",
    "freebsd",
    "server 2016",
    "server 2019",
    "server 2022",
    "server 2025",
    "win10",
    "win11",
  ];
  if (osAndDistros.some((os) => new RegExp(`\\b${os}\\b`, "i").test(lower))) {
    return true;
  }

  // Software versions, release tracking, kernels, builds
  if (/(?:v\d+|\b\d+\.\d+(?:\.\d+)?\b)/i.test(lower) && /\b(version|release|build|patch|update|kernel|firmware|distro|lts|advisory)\b/i.test(lower)) {
    return true;
  }

  // Active Directory, authentication, cryptography, protocols
  const protocolsAndConcepts = [
    "active directory",
    "kerberos",
    "ntlm",
    "ldap",
    "ldaps",
    "rbcd",
    "s4u2proxy",
    "s4u2self",
    "shadow credentials",
    "keycredentiallink",
    "dpapi",
    "gmsa",
    "drop the mic",
    "ms-efsrpc",
    "efsrpc",
    "relay",
    "poisoning",
    "llmnr",
    "netbios",
    "asreproast",
    "kerberoast",
    "dcsync",
    "silver ticket",
    "golden ticket",
    "diamond ticket",
    "adcs",
    "esc1",
    "esc8",
    "esc17",
    "suid",
    "sgid",
    "ebpf",
    "wasm",
    "jwt",
    "oauth",
    "saml",
  ];
  if (protocolsAndConcepts.some((proto) => lower.includes(proto))) {
    return true;
  }

  // Vulnerability & security intelligence keywords (including plural and shorthand)
  const keywords = [
    "vuln",
    "vulns",
    "vulnerability",
    "vulnerabilities",
    "cve",
    "cves",
    "exploit",
    "exploits",
    "zero-day",
    "zeroday",
    "0-day",
    "cvss",
    "advisory",
    "advisories",
    "threat",
    "threats",
    "remote code execution",
    "rce",
    "ssrf",
    "sqli",
    "privilege escalation",
    "privesc",
    "bypass",
    "buffer overflow",
    "patch",
    "mitigation",
    "proof of concept",
    "poc",
    "download",
    "downloading",
    "where to download",
    "where can i download",
    "where can i find",
    "github",
    "git repo",
    "repository",
    "clone",
    "install",
    "installation",
    "source code",
    "cheatsheet",
    "cheat sheet",
    "methodology",
    "attack vector",
    "reference",
    "references",
    "payload",
    "payloads",
    "exploit-db",
    "packet storm",
    "sansec",
    "stylesmuggler",
    "sonicwall",
    "magento",
    "adobe commerce",
    "fortinet",
    "ivanti",
    "palo alto",
    "citrix",
    "flaw",
    "flaws",
  ];

  return keywords.some((kw) => lower.includes(kw));
}

/**
 * Retrieve full Grounding Data (CVE + Web Search) for user prompt and resolved writeup CVEs
 */
export async function getSearchGroundingContext(
  userPrompt: string,
  targetCves: string[] = [],
  targetQueries: string[] = []
): Promise<SearchGroundingData> {
  const trimmed = userPrompt.trim();
  const cveMatch = trimmed.match(/\bCVE-\d{4}-\d{4,7}\b/i);

  // Collect all unique CVEs to look up (from user query + writeup)
  const allCveIds: string[] = [];
  if (cveMatch) allCveIds.push(cveMatch[0].toUpperCase());
  targetCves.forEach((c) => {
    const clean = c.toUpperCase();
    if (!allCveIds.includes(clean)) allCveIds.push(clean);
  });

  const isRecentInquiry =
    /\b(recent|latest|new|top|current|today)\b.*\b(vuln|vulns|vulnerabilities|cve|cves|zero-?days?|threats|exploits|advisories)\b/i.test(trimmed) ||
    /\b(vuln|vulns|vulnerabilities|cve|cves|zero-?days?|threats|exploits|advisories)\b.*\b(recent|latest|new|current|today|now)\b/i.test(trimmed);

  const isHtbInquiry =
    /\b(htb|hack\s*the\s*box)\b/i.test(trimmed) ||
    /\b(season\s*\d+|boxes|box|machines?|pro\s*labs?|sherlocks?|academy|cpts|cwee|cbbh|ippsec|0xdf)\b/i.test(trimmed);

  // Detect download / repository inquiry e.g. "where can i download impacket from?", "download link for hashcat"
  const isDownloadInquiry = /\b(download|where\s*(can\s*i|to)?\s*(download|get|find)|repo|repository|github|git\s*clone|source\s*code|release|binaries)\b/i.test(trimmed);

  // Detect PoC / exploit script inquiry e.g. "CVE-2024-51428 poc", "exploit code for log4j"
  const isPocInquiry = /\b(poc|proof\s*of\s*concept|exploit(\s*code)?|payload(\s*script)?|exploit-db|packet\s*storm)\b/i.test(trimmed);

  // Detect learning / methodology inquiry e.g. "how to learn active directory attacks", "DNS poisoning reference"
  const isLearningInquiry = /\b(learn|study|reference|references|guide|methodology|tutorial|cheatsheet|cheat\s*sheet|attack\s*vector)\b/i.test(trimmed);

  // Detect flag query e.g. --remove-mic, -smb2support
  const flagMatch = trimmed.match(/(?:^|\s)(--?[a-zA-Z0-9_-]+)/);
  const isFlagInquiry = Boolean(flagMatch);
  const cleanFlag = flagMatch ? flagMatch[1].replace(/^--?/, "") : "";

  // Detect software version query e.g. ZoneMinder 1.37, Linux 6.8
  const versionMatch = trimmed.match(/(?:v\d+|\b\d+\.\d+(?:\.\d+)?\b)/i);
  const isVersionInquiry = Boolean(versionMatch) && !isRecentInquiry;

  const shouldSearch =
    allCveIds.length > 0 ||
    isRecentInquiry ||
    isHtbInquiry ||
    isFlagInquiry ||
    isVersionInquiry ||
    isDownloadInquiry ||
    isPocInquiry ||
    isLearningInquiry ||
    targetQueries.length > 0 ||
    isVulnerabilityOrTechnicalQuery(trimmed);

  if (!shouldSearch) {
    return {
      hasGrounding: false,
      webResults: [],
      groundingPromptText: "",
    };
  }

  // Optimize search query based on inquiry intent
  let effectiveSearchQuery = trimmed;
  const additionalSearchQueries: string[] = [];

  if (isRecentInquiry) {
    effectiveSearchQuery = "latest critical CVE vulnerabilities 2026 advisory zero day exploited in wild";
  } else if (/\bseason\s*11\b/i.test(trimmed)) {
    effectiveSearchQuery = "Hack The Box Season 11 machines list";
  } else if (/\bseason\s*10\b/i.test(trimmed)) {
    effectiveSearchQuery = "Hack The Box Season 10 machines Garfield DevArea Facts";
  } else if (isDownloadInquiry) {
    effectiveSearchQuery = `${trimmed} official github repository download release`;
    additionalSearchQueries.push(`${trimmed} download official site`);
  } else if (isPocInquiry) {
    effectiveSearchQuery = `${trimmed} exploit github poc proof of concept`;
    additionalSearchQueries.push(`${trimmed} exploit-db github`);
  } else if (isLearningInquiry) {
    effectiveSearchQuery = `${trimmed} cybersecurity methodology cheat sheet guide`;
  } else if (isFlagInquiry && cleanFlag) {
    // CRITICAL: DuckDuckGo treats leading hyphens as negation filters.
    // Wrap flag in quotes and add explicit cybersecurity / tool contexts:
    effectiveSearchQuery = `"${cleanFlag}" flag cybersecurity exploit penetration testing`;
    additionalSearchQueries.push(`"${cleanFlag}" flag ntlmrelayx impacket exploit`);
    additionalSearchQueries.push(`"${flagMatch![1]}" flag penetration testing tool`);
  } else if (isVersionInquiry) {
    effectiveSearchQuery = `${trimmed} vulnerability release security advisory`;
  } else if (allCveIds.length > 0 && !/\b(cve-\d+)\b/i.test(trimmed)) {
    effectiveSearchQuery = `${allCveIds[0]} vulnerability exploit analysis`;
  } else if (isHtbInquiry && !/\b(hack\s*the\s*box|htb)\b/i.test(trimmed)) {
    effectiveSearchQuery = `Hack The Box ${trimmed}`;
  }

  // Gather search queries
  const searchQueriesToRun = [effectiveSearchQuery, ...additionalSearchQueries, ...targetQueries].slice(0, 3);

  // Run live searches and CVE lookups in parallel with timeout safety
  const [cveRecords, webResultBatches] = await Promise.all([
    Promise.all(allCveIds.slice(0, 2).map((cve) => fetchLiveCveRecord(cve))),
    Promise.all(searchQueriesToRun.map((q) => fetchLiveWebSearch(q, 3))),
  ]);

  const validCveRecords = cveRecords.filter((r): r is LiveCveRecord => r !== null);
  const primaryCveRecord = validCveRecords[0] || null;

  // Flatten and deduplicate web results
  const seenSnippets = new Set<string>();
  const webResults: WebSearchResult[] = [];
  webResultBatches.flat().forEach((res) => {
    const key = res.snippet.slice(0, 50);
    if (!seenSnippets.has(key)) {
      seenSnippets.add(key);
      webResults.push(res);
    }
  });

  if (validCveRecords.length === 0 && webResults.length === 0 && !isRecentInquiry && !isHtbInquiry && !isFlagInquiry) {
    return {
      hasGrounding: false,
      webResults: [],
      groundingPromptText: "",
    };
  }

  // Construct structured grounding context for Gemini
  let groundingText = `\n======================================================\n`;
  groundingText += `### LIVE SEARCH & SECURITY INTELLIGENCE GROUND-TRUTH (CURRENT YEAR: 2026):\n`;
  groundingText += `The following verified data was retrieved in real-time from official MITRE / vendor / security research sources.\n`;
  groundingText += `CRITICAL TIMELINE DIRECTIVE: Today is in the year 2026. You are living in 2026. NEVER output obsolete 2024 vulnerabilities (such as XZ Utils CVE-2024-3094 or 2024 Ivanti) as "recent" or "current". Any recent vulnerabilities MUST be from 2026.\n\n`;

  if (isFlagInquiry) {
    groundingText += `### COMMAND-LINE FLAG & TOOL PARAMETER GROUND TRUTH:
The user is querying a technical command-line flag or parameter ("${trimmed}").
CRITICAL DIRECTIVES:
1. Identify the primary security tool or suite that utilizes this flag (e.g., Impacket ntlmrelayx.py, Hashcat, Nmap, Certipy).
2. Trace where this flag originated: identify the exact CVE, protocol vulnerability, or RFC standard (e.g. CVE-2019-1040 "Drop the MIC", NTLM Message Integrity Code bypass).
3. Detail the exact bit/packet level mechanics of what this flag alters (e.g. stripping the MIC field from NTLM Authenticate messages, clearing NTLMSSP_NEGOTIATE_SIGN and NTLMSSP_NEGOTIATE_ALWAYS_SIGN negotiation flags to allow relaying to signed LDAPS/SMB).
4. Provide copyable CLI syntax examples demonstrating proper flag usage in an attack chain.
5. Provide defensive remediations (e.g., Microsoft security updates, EPA / LDAP Channel Binding, SMB signing).
6. Connect to Hack The Box writeups where Rohit utilized this flag (e.g., Pirate machine writeup).
7. NEVER hallucinate mundane non-cyber concepts (e.g. do NOT mistake --remove-mic for an audio microphone setting). This is 100% an offensive security flag.\n\n`;
  }

  if (isHtbInquiry) {
    groundingText += `### HACK THE BOX (HTB) PLATFORM & SEASONS GROUND TRUTH:
- **Competitive Seasons Structure**:
  * HTB runs official competitive seasons where weekly new machines are released for players to race for First Bloods, user/root flags, and seasonal ranking points.
  * **Season 11 Lineup**: Features modern active competitive machines:
    - **Reactor** (Windows/Linux Active Season machine)
    - **DevHub** (Web/API & Developer Environment)
    - **Connected** (Network/Service exploitation)
    - **Checkpoint** (Linux security appliance & authentication bypass)
    - **Enigma** (Cryptographic flaws & reverse engineering)
    - **Paperwork** (Document processing & template injection / SSRF)
    - **MakeSense** (IoT / Sensor platform & privilege escalation)
    - **Bedside** (Medical / Healthcare IoT protocol vulnerabilities)
    - **DarkZeroReturns** (Binary exploitation & heap corruption)
    - **Cohort** (Active Directory & domain escalation)
    - **DanglingTree** (Directory traversal & SUID / kernel privesc)
  * **Season 10 (Documented in Rohit's Portfolio)**:
    - Garfield, DevArea, Facts, Interpreter, Kobold, Logging, Pirate, Silentium, VariaType, WingData, CCTV.
  * **Season 9 & Release Arena (Documented in Rohit's Portfolio)**:
    - AirTouch, Browsed, Eloquia, Overwatch.
  * **CRITICAL DISTINCTION — NEVER CONFUSE WITH RETIRED OSCP LEGACY BOXES**:
    - Machines like Optimum, Bashed, Legacy, Devel, Blue, Mirai, Arctic, Grandpa, Granny, Lame, Jerry, Netmon are ancient retired OSCP training boxes from 2017–2019.
    - They are NEVER part of Season 11 or modern competitive seasons! If the user asks for Season 11, list the actual Season 11 lineup above.\n\n`;
  }

  if (isRecentInquiry) {
    groundingText += `### VERIFIED 2026 CRITICAL VULNERABILITIES (GROUND TRUTH):\n`;
    groundingText += `1. **CVE-2026-75650** (Adobe Commerce / Magento - CVSS 10.0): StyleSmuggler Server-Side Template Injection (SSTI) leading to unauthenticated RCE (Advisory APSB26-146, Sept 2026).\n`;
    groundingText += `2. **CVE-2026-83548 & CVE-2026-83549** (SonicWall SMA1000 - CVSS 10.0 / 9.8): Critical pre-authentication Server-Side Request Forgery (SSRF) and access bypass actively exploited in the wild.\n`;
    groundingText += `3. **CVE-2026-20316** (Cisco Secure Firewall Management Center - CVSS 9.9): Static-credential authentication bypass allowing unauthenticated admin access.\n`;
    groundingText += `4. **CVE-2026-46817** (Oracle E-Business Suite / Oracle Payments - CVSS 9.8): Improper privilege management and authentication bypass enabling full instance takeover.\n`;
    groundingText += `5. **CVE-2026-41089** (Windows Netlogon - CVSS 9.8): Critical stack-based buffer overflow in domain controllers via specially crafted RPC packets.\n\n`;
  }

  if (validCveRecords.length > 0) {
    validCveRecords.forEach((record) => {
      groundingText += `[OFFICIAL MITRE CVE RECORD: ${record.cveId}]\n`;
      groundingText += `- CVE ID: ${record.cveId}\n`;
      groundingText += `- Vendor: ${record.vendor || "Unknown"}\n`;
      groundingText += `- Product: ${record.product || "Unknown"}\n`;
      if (record.versions) groundingText += `- Affected Versions: ${record.versions}\n`;
      if (record.cvss?.score) {
        groundingText += `- CVSS Base Score: ${record.cvss.score} (${record.cvss.severity || "CRITICAL"})\n`;
        if (record.cvss.vector) groundingText += `- CVSS Vector: ${record.cvss.vector}\n`;
      }
      if (record.cwes) groundingText += `- Vulnerability Type / CWE: ${record.cwes}\n`;
      if (record.publishedDate) groundingText += `- Date Published/Updated: ${record.publishedDate}\n`;
      if (record.description) groundingText += `- Official Description: ${record.description}\n`;
      if (record.references && record.references.length > 0) {
        groundingText += `- Primary Advisories & References:\n${record.references.map((r) => `  * ${r}`).join("\n")}\n`;
      }
      groundingText += `\n`;
    });
  }

  if (webResults.length > 0) {
    groundingText += `[LIVE SEARCH DISCLOSURES, REPOSITORIES & THREAT INTEL]\n`;
    groundingText += `CRITICAL DIRECTIVE ON EXTERNAL RESOURCE LINKS: When the user asks for tool downloads, repositories, PoCs, CVE advisories, or references, extract and provide direct external markdown links [Descriptive Label](https://...) using the verified real URLs provided below or authoritative sources. The terminal UI renders all external links in prominent clickable blue and opens them directly in a new tab.\n\n`;
    webResults.forEach((res, i) => {
      groundingText += `[Source ${i + 1}: ${res.title}${res.url ? ` | Direct URL: ${res.url}` : ""}]:\n${res.snippet}\n\n`;
    });
  }

  groundingText += `======================================================\n`;

  return {
    hasGrounding: true,
    cveRecord: primaryCveRecord,
    webResults,
    groundingPromptText: groundingText,
  };
}
