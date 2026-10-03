const fs = require('fs');
const path = require('path');

const writeupConfigs = {
  // Season 10
  'season-10/pirate/writeup.mdx': [
    { target: "- 🔍 *We check BloodHound and notice that the `Pre-Windows 2000 Compatible Access`", heading: "### Pre2k Computer Account & BloodHound Enumeration" },
    { target: "- 🔍 *This is the clear path to get the initial foothold: we can read the NTLM hash", heading: "### gMSA Password & NTLM Hash Extraction" },
    { target: "- 🔍 *Let's set up `ntlmrelayx.py` to relay authentication to LDAPS", heading: "### NTLM Relay via ntlmrelayx to LDAPS" },
    { target: "- 🔍 *With the newly created computer account, we request a service ticket (S4U)", heading: "### S4U2Self Service Ticket Request & Secretsdump" },
    { target: "- 🔍 *This should be the clear attack path towards gaining access to the domain.", heading: "### Fluxion Credential Extraction & SPN Delegation Hunting" },
    { target: "- 🔍 *Now we know that the HTTP service is only accessible via `WEB01`", heading: "### Resource-Based Constrained Delegation (RBCD) Configuration" },
    { target: "- 🔍 *Now that we have everything, let's request for a TGS of `Administrator`:", heading: "### S4U2Proxy Ticket Request & Domain Admin Takeover" }
  ],
  'season-10/garfield/writeup.mdx': [
    { target: "- 🔍 *Lets First check what are the writeables for the current user!*", heading: "### Enumerating Writable AD Attributes (scriptPath)" },
    { target: "- 🔍 *first i have tried creating a Reverse shell payload for windows", heading: "### Insecure scriptPath Abuse via SYSVOL Reverse Shell" },
    { target: "- 🔍 *First thing i took was the bloodhound:*", heading: "### BloodHound Graph Analysis & RODC Architecture" },
    { target: "- 🔍 *After Searching for a while, we have WriteAccountRestriction over RODC01", heading: "### bloodyAD addSelf to RODC Administrators" },
    { target: "- 🔍 *So now that we are in RODC administrators lets abuse RBCD*", heading: "### Resource-Based Constrained Delegation (RBCD) Abuse" },
    { target: "- 🔍 *Now to Get the signing ticket for RODC krbtgt_1234 account", heading: "### Dumping RODC Signing Key via Mimikatz" },
    { target: "- 🔍 *Now Before asking for real krbtgt password hash from DC01", heading: "### RODC Password Replication Policy (PRP) Manipulation" },
    { target: "- 🔍 *We got the golden ticket, now lets ask for real krbtgt password hash!*", heading: "### RODC Key List Attack & Domain Controller Sync" }
  ],
  'season-10/cctv/writeup.mdx': [
    { target: "## Step 2 - Initial Foothold", nextLine: true, heading: "### Authenticated ZoneMinder SQL Injection (CVE-2024-51428)" },
    { target: "## Step 3 - Privilege Escalation", nextLine: true, heading: "### motionEye Configuration Command Injection (CVE-2025-60787)" }
  ],
  'season-10/devarea/writeup.mdx': [
    { target: "## Step 3 - Initial Foothold", nextLine: true, heading: "### Apache CXF XOP XML Injection & LFI (CVE-2022-46364)" },
    { target: "## Step 4 - Privilege Escalation", nextLine: true, heading: "### Hoverfly Middleware OS Command Injection (CVE-2025-54123)" }
  ],
  'season-10/facts/writeup.mdx': [
    { target: "## Step 2 - Initial Foothold", nextLine: true, heading: "### Camaleon CMS Path Traversal (CVE-2024-46987)" },
    { target: "## Step 3 - Privilege Escalation", nextLine: true, heading: "### Insecure Puppet Facter Sudo Privilege Escalation" }
  ],
  'season-10/interpreter/writeup.mdx': [
    { target: "## Step 2 - Initial Foothold", nextLine: true, heading: "### Mirth Connect Deserialization RCE (CVE-2023-43208)" },
    { target: "## Step 3 - Privilege Escalation", nextLine: true, heading: "### Server-Side Template Injection (SSTI) in /addPatient" }
  ],
  'season-10/kobold/writeup.mdx': [
    { target: "## Step 2 - Initial Foothold", nextLine: true, heading: "### MCPJam Inspector Command Execution (CVE-2026-23744)" },
    { target: "## Step 3 - Privilege Escalation", nextLine: true, heading: "### Insecure Docker Group Socket Privilege Escalation" }
  ],
  'season-10/silentium/writeup.mdx': [
    { target: "## Step 2 - Initial Foothold", nextLine: true, heading: "### Flowise CustomMCP Arbitrary Code Execution (CVE-2025-59528)" },
    { target: "## Step 3 - Privilege Escalation", nextLine: true, heading: "### Gogs Symlink Validation Bypass to Root (CVE-2025-8110)" }
  ],
  'season-10/variatype/writeup.mdx': [
    { target: "## Step 2 - Initial Foothold", nextLine: true, heading: "### Web Application Authentication Bypass & Foothold" },
    { target: "## Step 3 - Privilege Escalation", nextLine: true, heading: "### Internal Privilege Escalation & Root Access" }
  ],
  'season-10/wingdata/writeup.mdx': [
    { target: "## Step 3 - Initial Foothold", nextLine: true, heading: "### Wing FTP Server Unauthenticated RCE (CVE-2025-47812)" },
    { target: "## Step 4 - Privilege Escalation", nextLine: true, heading: "### Python tarfile Filter Bypass via symlinks (CVE-2025-4517)" }
  ],
  // Season 9
  'season-9-release-arena/airtouch/writeup.mdx': [
    { target: "## Step 2 - Initial Foothold", nextLine: true, heading: "### WPA2-Enterprise Rogue AP PEAP-MSCHAPv2 Hash Harvest" },
    { target: "## Step 3 - Lateral Movement to AirTouch-Internet", nextLine: true, heading: "### Hashcat Net-NTLMv1 Cracking & Network Pivot" },
    { target: "## Step 5 - Root Access", nextLine: true, heading: "### RADIUS User Database Extraction & Root Takeover" }
  ],
  'season-9-release-arena/browsed/writeup.mdx': [
    { target: "## Step 3 - Initial Foothold", nextLine: true, heading: "### Headless Chrome SSRF via --no-sandbox" },
    { target: "## Step 4 - Privilege Escalation", nextLine: true, heading: "### Python __pycache__ Bytecode Poisoning Escalation" }
  ],
  'season-9-release-arena/eloquia/writeup.mdx': [
    { target: "## Step 2 - Initial Foothold", nextLine: true, heading: "### SQLite load_extension() Arbitrary DLL Execution" },
    { target: "## Step 6 - Dumping the Credentials", nextLine: true, heading: "### DPAPI Saved Browser Credential Extraction" },
    { target: "## Step 7 - Privilege Escalation", nextLine: true, heading: "### Writable Failure2Ban Service Binary Hijack" }
  ],
  'season-9-release-arena/overwatch/writeup.mdx': [
    { target: "## Step 2 - Enumeration", nextLine: true, heading: "### Anonymous SMB NULL Session & Hardcoded Database Credentials" },
    { target: "## Step 3 - Initial Foothold", nextLine: true, heading: "### MSSQL Linked Server Dynamic DNS Poisoning" },
    { target: "## Step 4 - Privilege Escalation", nextLine: true, heading: "### Privileged SOAP Service Command Injection to SYSTEM" }
  ]
};

let totalAdded = 0;

for (const [relPath, insertions] of Object.entries(writeupConfigs)) {
  const fullPath = path.join(process.cwd(), 'content', 'writeups', relPath);
  if (!fs.existsSync(fullPath)) {
    console.warn(`File not found: ${fullPath}`);
    continue;
  }

  let content = fs.readFileSync(fullPath, 'utf8');
  let fileAdded = 0;

  for (const item of insertions) {
    if (content.includes(item.heading)) {
      console.log(`Already has heading "${item.heading}" in ${relPath}`);
      continue;
    }

    if (item.nextLine) {
      const targetPattern = item.target;
      const idx = content.indexOf(targetPattern);
      if (idx !== -1) {
        const afterTarget = idx + targetPattern.length;
        content = content.slice(0, afterTarget) + '\n\n' + item.heading + content.slice(afterTarget);
        fileAdded++;
        totalAdded++;
      } else {
        console.warn(`Target not found in ${relPath}: ${item.target}`);
      }
    } else {
      const idx = content.indexOf(item.target);
      if (idx !== -1) {
        content = content.slice(0, idx) + item.heading + '\n\n' + content.slice(idx);
        fileAdded++;
        totalAdded++;
      } else {
        console.warn(`Target not found in ${relPath}: ${item.target}`);
      }
    }
  }

  fs.writeFileSync(fullPath, content, 'utf8');
  console.log(`Updated ${relPath}: added ${fileAdded} headings.`);
}

console.log(`Total headings added across writeups: ${totalAdded}`);
