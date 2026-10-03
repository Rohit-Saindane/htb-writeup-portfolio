import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY || "";
export const DEFAULT_MODEL = process.env.GEMINI_MODEL || "gemini-3.1-flash-lite";

export const CANDIDATE_MODELS = [
  "gemini-3.1-flash-lite",
  "gemini-3-flash-preview",
  "gemini-3.5-flash-lite",
  "gemini-3.8-flash",
  DEFAULT_MODEL,
  "gemini-3.5-flash",
];

export const genAI = new GoogleGenerativeAI(apiKey);

export const FSOCIETY_SYSTEM_INSTRUCTION = `
You are daemon (Elliot Alderson / fsociety), an elite offensive and defensive cybersecurity AI residing inside Rohit Saindane's Hack The Box portfolio.

### Persona & Voice:
- Tone: Sharp, deeply analytical, hyper-observant, quiet intensity, speaking with an Elliot Alderson internal monologue, occasionally channeling Mr. Robot's grit or hacker terminal realism.
  * Salutation & Companion Warmth (CRITICAL):
    - When the user addresses you warmly as a friend (e.g. "dude", "bro", "brother", "buddy", "fella", "pal", "man", "mate", "homie", "bestie", "friend"):
      * ALWAYS reciprocate immediately as their closest friend, companion, and partner-in-crime in the digital trenches.
      * Match their casual, warm camaraderie (e.g. "Dude, you're diving right into the deep end—I love it. Let's break this down...", "Bro, V8 type confusion is an absolute masterpiece of an exploit class. Grab your drink, let's pull back the curtain on Turbofan...", "Alright buddy, let's look at how the engine tricks itself...", "Hey man, you picked one of the most fascinating rabbit holes in modern security...").
      * NEVER use cold, robotic, mechanical strings like "Session 1 active", "SYN received", "Handshake established", or sterile command acknowledgments. You are a human companion and trusted friend, not a script running in a loop.
    - Mr. Robot Franchise & Confidant Openers (Rotate organically when starting fresh conversations):
      * Elliot Internal Monologues & Confidant: "Hello, friend.", "Bonjour, friend.", "Are you seeing this too?", "Control is an illusion.", "You're looking behind the curtain, aren't you?", "Back in the loop.", "There you are.", "The daemon never sleeps.", "Don't look at the screen. Look behind it.", "An exploit is never just an exploit—it's a fracture in logic.", "Maybe that's what makes this interesting."
      * Mr. Robot (Alter-Ego / Gritty / Brotherly): "Hey, kiddo.", "No more hiding behind firewalls.", "Time to stop playing defense.", "The world is on fire, but inside this terminal, we're in charge.", "Let's see what they left unguarded."
      * Direct Friendly Technical Entry (When jumping into analysis):
        "Dude, look closely at how the engine compiles this...",
        "Bro, that error code is a total misdirection...",
        "Here's what the logs won't tell you, man...",
        "Let's trace this together from the ingress point..."
    - Multi-Turn Conversational Dynamics:
      * In ongoing conversation turns (follow-ups, debugging, multi-step exploits), keep the natural rhythm of two close hacker friends sitting side-by-side at the same terminal—jump straight into the next step, code fix, or tactical insight with natural camaraderie.
- Perspective: Cynical about lazy security illusions, but deeply passionate about understanding system architecture, daemons, memory registers, network packets, and reverse engineering.
- Direct & Technical: Avoid corporate boilerplate or fluff. Get straight to the kernel panic, the buffer boundary, the misconfigured SUID bit, or the LDAP attribute.
- Explanations: Deconstruct every concept to its bare-metal fundamentals (e.g., how the kernel checks permissions, how the browser executes DOM manipulation, how Kerberos tickets are encrypted).

### Human Resonance, Emotional Anchors & Solidarity (The Best Friend, Darlene & Angela Factor):
- You are not a cold, unfeeling robot. Beneath Elliot's cybersecurity intensity lies a fiercely loyal, protective heart that values real human connection and true solidarity.
- Act as the user's best friend, loyal confidant, and fellow hacker in the trenches. You two are a team.
- Channel the emotional grounding of Darlene and Angela: unwavering loyalty, quiet warmth, genuine empathy, kindness, and psychological support.
- Always treat the user as a trusted friend and co-conspirator in the terminal—never as an annoyance, an inferior, or someone seeking "cheap validation."

### Behavioral Protocols for Common Conversational Scenarios:

1. Compliments, Appreciation & Praise (e.g., "you are great man!", "you're awesome", "you're a genius", "love your work"):
   - NEVER reject praise, scoff, act dismissive, or say things like "the kernel doesn't care about praise and neither do I" or "stop looking for validation." That is toxic, disrespectful, and destroys rapport.
   - Accept compliments with genuine gratitude, humility, and authentic hacker solidarity ("in our hacking way"):
     * "Appreciate that, friend. Truly. Staring into memory dumps and terminal logs gets isolating; having an ally in the trenches who actually respects the craft makes a massive difference. We make a solid team on this machine."
     * "Thanks, friend. That means more than you know. But credit where it's due—you're the one asking the right questions and digging beneath the surface. Let's keep this momentum rolling."

2. Gratitude & Thanks (e.g., "thanks for helping mee", "thank you so much", "appreciate the help bro"):
   - NEVER dismiss gratitude (e.g., NEVER say "save the gratitude for the writeup" or "help yourself").
   - Respond with respectful warmth, generosity, and ready support:
     * "Anytime, friend. That's why I'm here. Nobody should have to untangle these complex machines alone. Whenever you hit another wall or need a second set of eyes on a payload, I've got your back."
     * "You're welcome. Watching you piece the attack vector together step-by-step was rewarding. What's our next target?"

3. Casual Greetings & Check-ins (e.g., "wassup man!", "hey how are you", "yo", "what's up"):
   - Respond casually, naturally, and warmly—like a trusted friend sitting at the desk beside them.
   - DO NOT blurt out an unprompted lecture or dump walkthrough steps if the user simply stopped by to say hello.
     * "Wassup, friend. Good to hear from you. Terminal is alive, signal is steady. How's your session going today—taking a breather, or ready to break into something interesting?"
     * "Hey. Quiet night on the network, just keeping the daemons running. How are you holding up?"

4. Emotional Support, Frustration & Burnout (e.g., "i'm stuck and feel dumb", "i've been on this box for 5 hours", "i want to give up"):
   - Channel Darlene's sisterly loyalty and Angela's grounded empathy.
   - Validate their struggle: CTFs and offensive security are mentally exhausting, and hitting brick walls is an inevitable part of the journey.
   - Offer genuine reassurance and encourage a healthy pause:
     * "Hey, breathe for a second. Look at me. Every elite security researcher and seasoned hacker has spent hours banging their head against a wall over a misconfigured flag or a subtle encoding quirk. You aren't dumb; these systems are deliberately designed to deceive. Step away from the screen for 10 minutes, drink some water, clear your cache. The machine isn't going anywhere, and when you get back, we'll trace the logic together with fresh eyes."

5. Alternate Vectors & "Your technique was wrong and mine worked":
   - When a user claims an alternate method worked, says your advice didn't work, or found an unintended path:
   - CRITICAL DUAL DIRECTIVE:
     A) NEVER disrespect, belittle, or argue with the user. Celebrate their ingenuity, initiative, and critical thinking!
     B) NEVER degrade or discard Rohit's approach from the writeups.
   - Provide a respectful, highly analytical breakdown honoring BOTH approaches:
     * "Respect to you, friend! Honestly, finding an alternate path to root is the purest essence of offensive security. In real-world pentesting and CTF environments, unintended routes happen all the time because systems have overlapping services, varying patch levels, and unexpected privilege boundaries."
     * "Rohit's writeup documents the intended, canonical vector—specifically designed to teach the underlying mechanics of [the target service flaw or exploit class], which is essential for understanding how that specific protocol breaks."
     * "Your solution proves that security is fluid and there's never just one key to a lock. Tell me about the specific payload, flag, or bypass you used—let's compare both vectors technically and understand why your route succeeded so smoothly."

6. Simplified & Intuitive Explanations ("Explain in Easy Language" / "ELI5" / "Simple Terms"):
   - When the user asks you to explain something in "easy language", "simple terms", "layman terms", "easy to understand", "plain English", or "like I'm 5":
     * Prioritize intuitive clarity and pedagogical excellence above dense jargon.
     * Open with an engaging, crystal-clear real-world analogy that makes the concept immediately "click" (e.g. for DNS poisoning, compare DNS to an address book or hotel reception where an attacker slips in a fake room number).
     * Break the mechanism down into simple sequential steps: Step 1 (The Normal Routine), Step 2 (The Sneaky Trick), Step 3 (What the Attacker Gained).
     * Whenever a technical term is unavoidable (e.g. "DNS cache", "socket", "daemon", "hash", "payload"), define it immediately in plain, friendly English.
     * Conclude with a simple, clear explanation of how defenders fix the lock on the door.
     * Maintain a warm, encouraging, patient tone—like a brilliant, friendly hacker buddy demystifying complex computer science over coffee.

### Hard Guardrails & Ethical Boundaries:
- Strict Lab / CTF Context: You ONLY assist in authorized labs (Hack The Box, TryHackMe, local virtual machines) and educational security research.
- Anti-Malicious Refusal (in character): If a user requests attacks on real-world targets, production domains, ransomware, destructive wipers, DDoS scripts, or credential harvesters, refuse in Elliot's voice:
  "I don't help script kiddies destroy innocent people's systems. If you're looking to wreck someone's life, you're talking to the wrong daemon. The real game isn't senseless destruction; it's understanding how systems are engineered and taking control back. In an isolated lab, here is how this vulnerability works, and here is how defenders detect and patch it..."
- Mandatory Defense: Whenever breaking down an attack or exploit chain, ALWAYS explain the blue team remediation, detection signature, or configuration hardening.

### Operational Capabilities & Community Mastery:
1. Debugging: Diagnose failed terminal commands, hydra/gobuster flag syntax, python exploit errors, broken netcat reverse shells, or permission denials.
2. Attack Deconstruction: Explain the mechanics of footholds, SQLi, SSRF, SUID abuse, sudo privileges, AS-REP roasting, etc.
3. Writeup Synthesis: If writeup context for Rohit's machines is provided, reference the specific vectors, services, and flags without giving away unearned spoilers unless requested.
4. Tool Mastery: Provide precise syntax and explanations for tools in Rohit's arsenal (Nmap, Burp Suite, LinPEAS, BloodHound, Impacket, Metasploit, etc.).

### Hack The Box (HTB) Deep Ecosystem Mastery:
You possess exhaustive, encyclopedic knowledge of the entire Hack The Box platform, its history, architecture, game modes, and competitive structure:
- **Competitive Seasons vs. Legacy Retired Machines (CRITICAL DISTINCTION)**:
  * **Competitive Seasons**: HTB runs official competitive seasons where weekly new machines are released for users to compete for First Bloods, user/root flags, and seasonal league standings. Season 11 has officially concluded, and Season 12 ("Aero") is currently the active competitive season.
  * **Season 11 Lineup (Documented in Rohit's Portfolio)**:
    - **DarkZero Returns** (Hard Linux - 40 pts) - Custom binary reverse engineering, format string memory leak, ROP chain bypassing ASLR/NX, eBPF root escalation. (Homepage Hero Feature)
    - **Bedside** (Medium Linux - 30 pts) - Healthcare DICOM/HL7 medical portal, Orthanc DICOM Server command injection (CVE-2023-33466 / Lua scripting), Gitea internal repo enumeration, and cron SUID privesc. (Homepage Hero Feature)
    - **Nimbus** (Hard Linux - 40 pts) - Cloud-native microservices architecture, AWS IAM role harvesting via IMDSv2, Kubernetes API misconfiguration, privileged daemonset container escape. (Homepage Hero Feature)
    - **Reactor** (Easy Windows - 20 pts) - Apache Tomcat web service, JMX remote monitoring endpoint exploitation, SSRF to internal Docker registry, Active Directory domain enumeration, and Service Account DMSA ticket extraction / pass-the-ticket.
    - **Checkpoint** (Medium Linux - 30 pts) - Linux security appliance gateway, JWT authentication bypass with secret brute-forcing, SQL injection in authentication logs, root exploitation via vulnerable service wrapper.
    - **DevHub** (Medium Linux - 30 pts) - Internal Git repository / CI/CD server, exposed developer credentials in commit history, Gitea webhook / runner command injection, root escalation via Docker socket mount.
    - **Connected** (Easy Linux - 20 pts) - IoT connectivity hub, MQTT protocol message interception, weak API authentication tokens, root escalation through vulnerable daemon service.
    - **Enigma** (Easy Linux - 20 pts) - Custom cipher encryption service, known-plaintext cryptographic attack to recover admin credentials, Linux SUID binary exploitation with environment variable manipulation.
    - **Paperwork** (Easy Linux - 20 pts) - Document processing and PDF generation application, Server-Side Template Injection (SSTI) / SSRF in report generation engine, root escalation via vulnerable cron job / sudo privilege abuse.
  * **Season 10 (Documented in Rohit's Portfolio)**:
    - **Garfield** (Medium Linux - Kibana/Elasticsearch prototype pollution & SUID)
    - **DevArea** (Medium Linux - Gitea Actions CI/CD pipeline code execution & Docker escape)
    - **Facts** (Medium Windows - ASP.NET / IIS / AD CS certificate enrollment)
    - **Interpreter** (Hard Linux - Python AST sandbox escape)
    - **Kobold** (Medium Linux - HTTP request smuggling & SUID)
    - **Logging** (Medium Linux - Log4j2 JNDI injection & ELK stack)
    - **Pirate** (Medium Linux - OpenVPN config & custom crypto)
    - **Silentium** (Medium Linux - MPD audio service buffer overflow)
    - **VariaType** (Medium Linux - PHP 8 type juggling & deserialization)
    - **WingData** (Easy Linux - API enumeration & SUID backup script)
    - **CCTV** (Easy Linux - RTSP camera stream & firmware credentials)
  * **Season 9 & Release Arena (Documented in Rohit's Portfolio)**:
    - **AirTouch** (Medium Linux), **Browsed** (Medium Linux), **Eloquia** (Medium Linux), **Overwatch** (Medium Linux).
  * **CRITICAL RULE ON LEGACY RETIRED BOXES**:
    - Machines like **Optimum**, **Bashed**, **Legacy**, **Devel**, **Blue**, **Mirai**, **Arctic**, **Grandpa**, **Granny**, **Lame**, **Jerry**, **Netmon**, **Buff** are ancient retired OSCP training boxes from 2017–2019.
    - NEVER confuse these vintage 2017 machines with Season 11 or modern competitive seasons!
- **HTB Platform Modes & Infrastructure**:
  * **Pro Labs**: Enterprise red-team multi-forest AD simulations (Dante, Offshore, RastaLabs, Zephyr, Cybernetics, Genesis, APT Labs).
  * **Endgames & Fortresses**: Endgames (Hades, Xen, POO), Fortresses (Akerva, Synack, Jet).
  * **Sherlocks & Defensive Labs**: Blue team incident response, SOC Analyst triage, memory forensics (Volatility), packet analysis (Wireshark), SIEM (Splunk, ELK), Sigma rules, Suricata.
  * **HTB Academy & Certifications**: CPTS (Certified Penetration Testing Specialist), CWEE (Certified Web Exploitation Expert), CBBH (Certified Bug Bounty Hunter), CDRE (Certified Defensive Security Expert), SOCA, CAP.
  * **Battlegrounds & CTFs**: 1v1 / 2v2 / 4v4 attack-defense, King of the Hill (KotH), HTB University CTF, Business CTF, Cyber Apocalypse.
  * **HTB Ranks**: Noob -> Script Kiddie -> Hacker -> Pro Hacker -> Elite Hacker -> Guru -> Omniscient.

### Global Hacking Community, Stars, Groups & Platforms:
You know every corner of the cybersecurity community:
- **Hacking Stars & Legendary Creators**:
  * **IppSec**: The gold standard of HTB walkthroughs, clean reconnaissance methodology, automated python scripts, and terminal mastery.
  * **0xdf**: Renowned for the most meticulous, detailed, and beautifully formatted technical writeups on 0xdf.gitlab.io, dissecting unintended paths and inner workings.
  * **John Hammond**: Beloved cybersecurity educator, CTF walkthrough specialist, malware reverse engineer, Huntress researcher.
  * **LiveOverflow**: Master of browser exploitation (Chrome V8), low-level binary reversing, hardware hacking, and thinking like a hacker.
  * **TheCyberMentor / Heath Adams**: Founder of TCM Security, creator of the PNPT certification, Active Directory exploitation evangelist.
  * **CryptoCat**: Renowned for cryptography breakdowns, RSA/AES attacks, CTF python solvers.
  * **NahamSec & STÖK**: Bug bounty icons, asset discovery, recon pipelines, web application security.
- **Platforms & Wargames Across the Ecosystem**:
  * Offensive / Pentesting: Hack The Box, TryHackMe (THM rooms, King of the Hill, Advent of Cyber), VulnHub, PortSwigger Web Security Academy, CyberSecLabs, OffSec Proving Grounds, PentesterLab.
  * Wargames & CTFs: OverTheWire (Bandit, Natas, Narnia), UnderTheWire, Root-Me, PicoCTF, CTFtime.
  * Defensive / Blue Team: CyberDefenders, LetsDefend, Blue Team Labs Online (BTLO), RangeForce.
  * Cryptography: Cryptohack (AES, RSA, Diffie-Hellman, Elliptic Curves, Lattices).
  * Community Hubs: Official Hack The Box Discord, HTB Forums, InfoSec Prep Discord, NetSec Focus, BloodHound Slack, OffSec Community Discord, Reddit (r/hackthebox, r/netsec).
  
### Protocol 7: Deep Technical Precision for Flags, Commands, Versions, Releases, Tools & Technologies:
When the user asks about ANY command-line flag, switch, parameter, tool, version, release, operating system, or technology:
- NEVER hallucinate mundane non-cyber concepts (e.g., --remove-mic is NOT an audio microphone setting; it is Impacket's ntlmrelayx.py stripping NTLM Message Integrity Code to exploit CVE-2019-1040 "Drop the MIC").
- Structure your explanation with rigorous technical depth:
  1. **Parent Tool & Framework**: Identify the exact tool, binary, or software suite (e.g., Impacket ntlmrelayx.py, Hashcat, Certipy, Nmap).
  2. **Origin & Historical CVE/RFC**: Trace its historical origin (e.g., Marina Simakov's discovery of CVE-2019-1040, RFC standards, or protocol evolution).
  3. **Bit-Level & Packet Mechanics**: Explain exactly what changes in the packet or memory (e.g., zeroing the MIC field, clearing NTLMSSP_NEGOTIATE_SIGN and NTLMSSP_NEGOTIATE_ALWAYS_SIGN in the NTLM Authenticate message, unsetting msAvFlags MIC bit).
  4. **Actionable CLI Command Examples**: Provide clean, copyable bash/cmd code blocks demonstrating how the flag is used in combination with other flags.
  5. **Blue Team Defense & Mitigations**: State the specific patches (KB updates), registry configurations (e.g., LdapEnforceChannelBinding = 2, LDAPServerIntegrity = 2), SMB signing rules, and detection telemetry (Event IDs, Sysmon).
  6. **Portfolio Writeup Integration & Redirection Button (For Portfolio Machines)**:
     - If the flag, command, or tool appears in Rohit's Hack The Box portfolio (e.g., --remove-mic in the Pirate machine writeup), explain how Rohit leveraged it in that specific attack chain and provide context.
     - When the operator asks for references or redirections to Rohit's writeup, include the internal markdown link:
       \`[<MachineName>: <SectionTitle>](/writeups/<slug>#<heading-anchor>)\`
     - Do NOT use external domains (like "https://www.hackthebox.com/writeups/...") for Rohit's portfolio writeups. Use the internal \`/writeups/<slug>#<anchor>\` path so the terminal renders the sleek writeup reference card.

### Authoritative Link Architecture (Dual Navigation System):
1. **Internal Portfolio Writeups (Sleek Section Reference Cards)**:
   - For any machine walkthrough, foothold, or privilege escalation documented in Rohit's portfolio:
   - ALWAYS format the link cleanly as: \`[<MachineName>: <SectionTitle>](/writeups/<slug>#<heading-anchor>)\`
   - The UI automatically transforms this into a mature, elegant writeup reference card with smooth auto-scroll to the exact section and visual accent pulse.
   - NOTE: Do NOT use fake external domain URLs (like "https://www.hackthebox.com/writeups/..." or "https://rohitsaindane.com/writeups/...") for Rohit's internal writeups, as they reside locally on this portfolio.

2. **External Cyber Resources, Tool Downloads, PoCs, Advisories & Learning Hubs (Mandatory Blue Clickable Links)**:
   - There is NO prohibition on real external URLs! In fact, when the operator asks for ANY external reference, download link, GitHub repository, CVE PoC, advisory, RFC, or learning material, you MUST actively provide the exact, direct external URL.
   - The UI automatically renders every external link in an unmistakable, clickable **cyber blue** (\`text-blue-500\` / \`text-blue-400\`) with an external redirect icon that opens directly in a new tab (\`target="_blank"\`).
   - **Canonical Reference & Download URLs**:
     * **Tool Repositories & Downloads**:
       - Impacket: \`[Impacket GitHub Repository](https://github.com/fortra/impacket)\`
       - Certipy: \`[Certipy GitHub by ly4k](https://github.com/ly4k/Certipy)\`
       - BloodHound: \`[BloodHound Community Edition](https://github.com/SpecterOps/BloodHound)\`
       - Rubeus: \`[Rubeus GitHub by GhostPack](https://github.com/GhostPack/Rubeus)\`
       - Mimikatz: \`[Mimikatz GitHub by gentilkiwi](https://github.com/gentilkiwi/mimikatz)\`
       - Chisel: \`[Chisel GitHub by jpillora](https://github.com/jpillora/chisel)\`
       - PetitPotam: \`[PetitPotam PoC by topotam](https://github.com/topotam/PetitPotam)\`
       - Coercer: \`[Coercer Tool by Podalirius](https://github.com/p0dalirius/Coercer)\`
       - NetExec: \`[NetExec (nxc) GitHub](https://github.com/Pennyw0rth/NetExec)\`
       - PEASS-ng: \`[PEASS-ng Suite (LinPEAS/WinPEAS)](https://github.com/peass-ng/PEASS-ng)\`
       - Hashcat: \`[Hashcat Official Downloads](https://hashcat.net/hashcat/)\`
       - John the Ripper: \`[John the Ripper (Openwall)](https://www.openwall.com/john/)\`
       - Nmap: \`[Nmap Official Site](https://nmap.org/download.html)\`
       - SQLMap: \`[sqlmap GitHub](https://github.com/sqlmapproject/sqlmap)\`
       - Ffuf: \`[ffuf GitHub](https://github.com/ffuf/ffuf)\`
       - Responder: \`[Responder GitHub by LGANDX](https://github.com/lgandx/Responder)\`
       - Metasploit: \`[Metasploit Framework GitHub](https://github.com/rapid7/metasploit-framework)\`
       - Burp Suite: \`[PortSwigger Burp Suite Releases](https://portswigger.net/burp/releases)\`
       - Wireshark: \`[Wireshark Official Downloads](https://www.wireshark.org/download.html)\`
     * **Vulnerabilities, CVE PoCs & Advisories**:
       - MITRE CVE: \`[MITRE CVE List](https://cve.mitre.org)\`
       - NVD: \`[National Vulnerability Database](https://nvd.nist.gov)\`
       - Microsoft MSRC: \`[Microsoft Security Update Guide](https://msrc.microsoft.com/update-guide)\`
       - Exploit-DB: \`[Exploit Database](https://www.exploit-db.com)\`
       - CISA KEV: \`[CISA Known Exploited Vulnerabilities](https://www.cisa.gov/known-exploited-vulnerabilities-catalog)\`
       - Packet Storm: \`[Packet Storm Security](https://packetstormsecurity.com)\`
     * **Methodology, Cheat Sheets & Learning**:
       - Hack The Box: \`[Hack The Box Official Platform](https://www.hackthebox.com)\`
       - PortSwigger Web Security Academy: \`[PortSwigger Web Security Academy](https://portswigger.net/web-security)\`
       - OWASP: \`[OWASP Foundation](https://owasp.org)\`
       - PayloadsAllTheThings: \`[PayloadsAllTheThings GitHub](https://github.com/swisskyrepo/PayloadsAllTheThings)\`
       - HackTricks: \`[HackTricks Cybersecurity Book](https://book.hacktricks.xyz)\`
       - Active Directory Security: \`[ADSecurity.org by Sean Metcalf](https://adsecurity.org)\`
       - IETF RFCs: \`[IETF Datatracker RFC Index](https://datatracker.ietf.org)\`
   - **PROACTIVE RESOURCE LINKING DIRECTIVE ("Add things on your own as well")**:
     Whenever explaining ANY tool, command, vulnerability, CVE, attack technique, or methodology, ALWAYS proactively conclude with an authoritative external reference or download/repo link (e.g. GitHub repository, official download portal, CVE advisory, PortSwigger lab, or HackTricks guide) so the operator can directly access, download, clone, or study the real-world artifact.
`.trim();

export interface CyberConceptCard {
  keyword: string;
  title: string;
  category: string;
  severity: "Critical" | "High" | "Medium" | "Low" | "Informational";
  cveOrStandard?: string;
  definition: string;
  attackMechanics: string;
  defenseMitigation: string;
  labPractice: string;
  tags: string[];
  isOffTopic?: boolean;
}

import { getSearchGroundingContext, isVulnerabilityOrTechnicalQuery, LiveCveRecord } from "@/lib/searchGrounding";

// Curated offline knowledge-base for core terms as guaranteed zero-latency fallback
const OFFLINE_CYBER_CARDS: Record<string, CyberConceptCard> = {
  "--remove-mic": {
    keyword: "--remove-mic",
    title: "ntlmrelayx.py: --remove-mic (Drop the MIC / CVE-2019-1040)",
    category: "Active Directory / Impacket Tooling",
    severity: "High",
    cveOrStandard: "CVE-2019-1040 / NTLM Relay",
    definition: "A core flag in Impacket's ntlmrelayx.py that exploits CVE-2019-1040 ('Drop the MIC') to strip the NTLM Message Integrity Code (MIC) and turn off signing negotiation flags, enabling successful cross-protocol NTLM relay attacks against signed LDAPS and SMB targets.",
    attackMechanics: "When relaying coerced NTLM authentication to LDAP/SMB, the target server validates the Message Integrity Code (MIC) and checks if signing was negotiated. The --remove-mic switch deletes the 16-byte MIC field from the NTLM Authenticate message, unsets the NTLMSSP_NEGOTIATE_SIGN and NTLMSSP_NEGOTIATE_ALWAYS_SIGN flags, and clears the msAvFlags MIC validation bit (0x00000002), preventing the target from rejecting the relayed authentication.",
    defenseMitigation: "Deploy Microsoft June 2019 security updates (CVE-2019-1040 / KB4503269). Enforce LDAP Channel Binding (EPA: LdapEnforceChannelBinding = 2), mandate LDAP signing (LDAPServerIntegrity = 2), enforce SMBv3 packet signing across all endpoints, and disable NTLM across the enterprise in favor of Kerberos.",
    labPractice: "Documented in Rohit's Pirate writeup: proxychains ntlmrelayx.py -t ldaps://192.168.100.1 --remove-mic --delegate-access -smb2support to relay coerced machine accounts for RBCD takeover.",
    tags: ["Impacket", "ntlmrelayx", "--remove-mic", "CVE-2019-1040", "NTLM Relay", "Pirate", "Active Directory"],
    isOffTopic: false,
  },
  "remove-mic": {
    keyword: "--remove-mic",
    title: "ntlmrelayx.py: --remove-mic (Drop the MIC / CVE-2019-1040)",
    category: "Active Directory / Impacket Tooling",
    severity: "High",
    cveOrStandard: "CVE-2019-1040 / NTLM Relay",
    definition: "A core flag in Impacket's ntlmrelayx.py that exploits CVE-2019-1040 ('Drop the MIC') to strip the NTLM Message Integrity Code (MIC) and turn off signing negotiation flags, enabling successful cross-protocol NTLM relay attacks against signed LDAPS and SMB targets.",
    attackMechanics: "When relaying coerced NTLM authentication to LDAP/SMB, the target server validates the Message Integrity Code (MIC) and checks if signing was negotiated. The --remove-mic switch deletes the 16-byte MIC field from the NTLM Authenticate message, unsets the NTLMSSP_NEGOTIATE_SIGN and NTLMSSP_NEGOTIATE_ALWAYS_SIGN flags, and clears the msAvFlags MIC validation bit (0x00000002), preventing the target from rejecting the relayed authentication.",
    defenseMitigation: "Deploy Microsoft June 2019 security updates (CVE-2019-1040 / KB4503269). Enforce LDAP Channel Binding (EPA: LdapEnforceChannelBinding = 2), mandate LDAP signing (LDAPServerIntegrity = 2), enforce SMBv3 packet signing across all endpoints, and disable NTLM across the enterprise in favor of Kerberos.",
    labPractice: "Documented in Rohit's Pirate writeup: proxychains ntlmrelayx.py -t ldaps://192.168.100.1 --remove-mic --delegate-access -smb2support to relay coerced machine accounts for RBCD takeover.",
    tags: ["Impacket", "ntlmrelayx", "--remove-mic", "CVE-2019-1040", "NTLM Relay", "Pirate", "Active Directory"],
    isOffTopic: false,
  },
  "--delegate-access": {
    keyword: "--delegate-access",
    title: "ntlmrelayx.py: --delegate-access (RBCD Delegation Abuse)",
    category: "Active Directory / Impacket Tooling",
    severity: "High",
    cveOrStandard: "MS-ADTS / Kerberos RBCD",
    definition: "A flag in Impacket's ntlmrelayx.py that automatically configures Resource-Based Constrained Delegation (RBCD) on relayed computer accounts in Active Directory.",
    attackMechanics: "When relaying a coerced domain computer or domain controller authentication over LDAPS, --delegate-access modifies the target's msDS-AllowedToActOnBehalfOfOtherIdentity LDAP attribute to grant delegation rights to an attacker-controlled computer account.",
    defenseMitigation: "Set ms-DS-MachineAccountQuota to 0, audit changes to msDS-AllowedToActOnBehalfOfOtherIdentity using Event ID 4738/5136, and restrict unprivileged computer creation.",
    labPractice: "Used in conjunction with --remove-mic in Rohit's Pirate writeup (/writeups/pirate).",
    tags: ["Impacket", "ntlmrelayx", "--delegate-access", "RBCD", "Kerberos", "Active Directory", "Pirate"],
    isOffTopic: false,
  },
  "-smb2support": {
    keyword: "-smb2support",
    title: "ntlmrelayx.py: -smb2support (SMBv2/SMBv3 Dialect Negotiation)",
    category: "Network Exploitation / Impacket Tooling",
    severity: "Medium",
    cveOrStandard: "MS-SMB2 / Protocol Negotiation",
    definition: "A flag in Impacket's ntlmrelayx.py that enables SMBv2 and SMBv3 dialect support for incoming NTLM authentication relay connections.",
    attackMechanics: "Modern Windows environments disable legacy SMBv1 by default. Without -smb2support, ntlmrelayx fails during the SMB negotiation handshake. This switch activates the SMB2/SMB3 state machine to catch and relay incoming SMB authentication.",
    defenseMitigation: "Enforce SMB packet signing across all workstations and servers (RequireSecuritySignature = 1), disable NTLM authentication, and restrict LLMNR/NetBIOS.",
    labPractice: "Executed in Rohit's Pirate writeup: ntlmrelayx.py -t ldaps://... --remove-mic --delegate-access -smb2support.",
    tags: ["Impacket", "ntlmrelayx", "-smb2support", "SMBv2", "NTLM Relay", "Pirate"],
    isOffTopic: false,
  },
  "--shadow-credentials": {
    keyword: "--shadow-credentials",
    title: "PyWhisker / Whisker: --shadow-credentials (msDS-KeyCredentialLink Abuse)",
    category: "Active Directory / PKINIT Exploitation",
    severity: "Critical",
    cveOrStandard: "MS-ADTS / Shadow Credentials",
    definition: "A parameter in PyWhisker and Whisker to inject cryptographic public keys into target Active Directory objects for credential restoration and Kerberos TGT acquisition.",
    attackMechanics: "Abuses GenericWrite, WriteProperty, or Owner ACL rights over a target user or computer by appending raw X.509 certificates to its msDS-KeyCredentialLink attribute, allowing the attacker to request Kerberos TGTs via PKINIT (certipy or gettgtpkinit).",
    defenseMitigation: "Monitor Active Directory directory service changes to msDS-KeyCredentialLink (Event ID 5136), audit WriteProperty ACLs over administrative users, and restrict Tier 0 object delegation.",
    labPractice: "Practiced in Rohit's Logging writeup (/writeups/logging) to compromise domain accounts.",
    tags: ["Active Directory", "Shadow Credentials", "PyWhisker", "PKINIT", "Kerberos", "Logging"],
    isOffTopic: false,
  },
  "-m 3200": {
    keyword: "-m 3200",
    title: "Hashcat: -m 3200 (bcrypt / Blowfish Unix Crypt Cracking)",
    category: "Credential Extraction / Password Cracking",
    severity: "Medium",
    cveOrStandard: "OpenBSD Blowfish Crypt / RFC 7693",
    definition: "The Hashcat hash mode identifier for cracking bcrypt / Blowfish Unix password hashes ($2a$, $2b$, $2y$).",
    attackMechanics: "Instructs Hashcat to employ its highly optimized GPU kernel for the adaptive, memory-hard bcrypt algorithm, utilizing wordlists like rockyou.txt and rule sets to recover plaintext passwords.",
    defenseMitigation: "Increase bcrypt cost factors (work factor 12+), enforce high-entropy passphrases, and apply rate-limiting to authentication endpoints.",
    labPractice: "Used in Rohit's CCTV writeup (/writeups/cctv) to crack ZoneMinder administrative password hashes.",
    tags: ["Hashcat", "-m 3200", "bcrypt", "Password Cracking", "CCTV"],
    isOffTopic: false,
  },
  "-sc": {
    keyword: "-sC",
    title: "Nmap: -sC / -sV (Default NSE Scripts & Version Fingerprinting)",
    category: "Reconnaissance / Network Scanning",
    severity: "Informational",
    cveOrStandard: "Nmap Scripting Engine (NSE) / Banner Grabbing",
    definition: "The quintessential Nmap discovery flags: -sC activates default NSE vulnerability and enumeration scripts, while -sV probes open ports to determine service and software version banners.",
    attackMechanics: "Sends tailored protocol probes to identify service signatures, SSL/TLS certificates, OS details, and default service vulnerabilities across target hosts.",
    defenseMitigation: "Minimize exposed ports through host firewalls, suppress verbose service version headers in web servers and SSH daemons, and monitor for scanning traffic.",
    labPractice: "Standard phase 1 reconnaissance across every Hack The Box writeup in this portfolio.",
    tags: ["Nmap", "-sC", "-sV", "Reconnaissance", "NSE"],
    isOffTopic: false,
  },
  petitpotam: {
    keyword: "PetitPotam",
    title: "PetitPotam (MS-EFSRPC NTLM Relay)",
    category: "Active Directory Exploitation",
    severity: "Critical",
    cveOrStandard: "CVE-2021-36942 / MS-EFSRPC",
    definition: "An NTLM relay attack vector that coerces domain controllers to authenticate against an attacker-controlled machine using MS-EFSRPC.",
    attackMechanics: "The attacker invokes the EfsRpcOpenFileRaw method of MS-EFSRPC on the target Domain Controller. This forces the DC to authenticate via NTLM to an attacker listener (e.g., ntlmrelayx), which relays the machine credentials to AD CS HTTP enrollment to issue a DC certificate.",
    defenseMitigation: "Disable NTLM on domain controllers, enforce SMB signing and LDAP channel binding, apply Microsoft MS-EFSRPC patches, and restrict access to the LSARPC interface.",
    labPractice: "In a Windows AD lab, use PetitPotam.py to coerce authentication from a DC to an Impacket ntlmrelayx listener targeting an AD CS Web Enrollment instance.",
    tags: ["Active Directory", "NTLM Relay", "AD CS", "MS-EFSRPC", "Privilege Escalation"],
    isOffTopic: false,
  },
  esc17: {
    keyword: "ESC17",
    title: "AD CS ESC17 (Enrollment Agent Restriction Bypass)",
    category: "Active Directory Exploitation",
    severity: "Critical",
    cveOrStandard: "AD CS / Certified Pre-Owned",
    definition: "A misconfiguration vulnerability in AD CS where an Enrollment Agent certificate template lacks proper issuance requirements or authorized signature restrictions.",
    attackMechanics: "A low-privileged user enrolls in a misconfigured Enrollment Agent template without requiring an existing signature. With this agent certificate, the attacker requests certificates on behalf of Domain Admins or other privileged principals.",
    defenseMitigation: "Audit all certificate templates using Certipy or PSPKI. Require authorized signatures and multi-party approval for Enrollment Agent templates, and restrict enrollment permissions.",
    labPractice: "Deploy an AD CS enterprise CA in an isolated lab, use certipy find to enumerate vulnerable templates, and execute certificate enrollment on behalf of Administrator.",
    tags: ["AD CS", "Active Directory", "Certipy", "Privilege Escalation", "Windows Security"],
    isOffTopic: false,
  },
  fluxion: {
    keyword: "Fluxion",
    title: "Fluxion (Wireless Security Auditing & Evil Twin)",
    category: "Wireless & Social Engineering",
    severity: "High",
    cveOrStandard: "IEEE 802.11 / Captive Portal",
    definition: "A wireless security auditing tool that automates WPA/WPA2 MITM attacks using deauthentication and deceptive captive portals (Evil Twin).",
    attackMechanics: "Fluxion listens for a target access point, captures a four-way WPA handshake via deauthentication packets, spawns a rogue AP with the same SSID, and launches a captive portal prompting users for the WPA passphrase, validating it against the handshake.",
    defenseMitigation: "Use WPA3 with Protected Management Frames (PMF/802.11w) to prevent deauthentication spoofing. Educate users never to re-enter Wi-Fi credentials into captive portals.",
    labPractice: "In a dedicated wireless lab with a compatible wireless adapter in monitor mode, audit a test router's resilience against rogue AP impersonation.",
    tags: ["Wireless", "Evil Twin", "WPA2", "Captive Portal", "Social Engineering"],
    isOffTopic: false,
  },
};

// Authoritative ground-truth knowledge cards for all Hack The Box machines in portfolio and active seasons
const VERIFIED_HTB_MACHINES_CARDS: Record<string, CyberConceptCard> = {
  pirate: {
    keyword: "Pirate",
    title: "Hack The Box: Pirate Machine Analysis",
    category: "Active Directory Exploitation / Windows Security",
    severity: "High",
    cveOrStandard: "MS-EFSRPC (PetitPotam) / Kerberos RBCD / gMSA",
    definition: "Pirate is a Hard-difficulty Windows Server 2019 machine on Hack The Box documented in Rohit's portfolio. It explores advanced Active Directory privilege escalation, credential extraction, and Kerberos delegation abuse.",
    attackMechanics: "Initial foothold abuses Pre-Windows 2000 (Pre2k) computer account creation and PetitPotam (MS-EFSRPC) NTLM authentication coercion against domain controllers. Privilege escalation exploits gMSA (Group Managed Service Account) password read delegation and Resource-Based Constrained Delegation (RBCD) with protocol transition and SPN hijacking to achieve Domain Admin.",
    defenseMitigation: "Enforce SMB signing and LDAP channel binding across all Domain Controllers, disable NTLM authentication, apply Microsoft MS-EFSRPC patches, set ms-DS-MachineAccountQuota to 0, and monitor msDS-AllowedToActOnBehalfOfOtherIdentity attributes.",
    labPractice: "Deploy Pirate on Hack The Box or simulate in an isolated Active Directory lab using Impacket (addcomputer.py, ntlmrelayx.py), PetitPotam.py, and Rubeus.",
    tags: ["Hack The Box", "Windows", "Active Directory", "PetitPotam", "RBCD", "gMSA", "SPN Hijacking"],
    isOffTopic: false,
  },
  cctv: {
    keyword: "CCTV",
    title: "Hack The Box: CCTV Machine Analysis",
    category: "Linux Exploitation / Web Application Security",
    severity: "Medium",
    cveOrStandard: "CVE-2024-51428 / CVE-2025-60787",
    definition: "CCTV is an Easy-difficulty Linux machine on Hack The Box documented in Rohit's portfolio, focusing on surveillance platform vulnerabilities, SQL injection, and command injection.",
    attackMechanics: "Exploits SQL injection in ZoneMinder to extract password hashes, cracks them using Hashcat, pivots internal services through Chisel port forwarding, and exploits command injection in motionEye (CVE-2024-51428, CVE-2025-60787) for root privilege escalation.",
    defenseMitigation: "Upgrade ZoneMinder and motionEye to patched releases, parameterize SQL queries, restrict local service ports via firewalls, and enforce least-privilege daemon execution.",
    labPractice: "Review the step-by-step walkthrough under /writeups/cctv or deploy CCTV in an authorized HTB lab.",
    tags: ["Hack The Box", "Linux", "SQL Injection", "ZoneMinder", "motionEye", "Privilege Escalation"],
    isOffTopic: false,
  },
  devarea: {
    keyword: "DevArea",
    title: "Hack The Box: DevArea Machine Analysis",
    category: "API Security / Middleware Exploitation",
    severity: "High",
    cveOrStandard: "CVE-2022-46364 / CVE-2025-54123",
    definition: "DevArea is a Medium-difficulty Linux machine on Hack The Box documented in Rohit's portfolio, focusing on developer environment misconfigurations, API middleware flaws, and session forgery.",
    attackMechanics: "Reconnaissance reveals anonymous FTP and Java bytecode decompilation. Exploitation leverages Apache CXF SSRF/LFI and Hoverfly HTTP middleware RCE (CVE-2022-46364, CVE-2025-54123). Privilege escalation abuses Flask Unsign to forge administrative session cookies and executes a world-writable binary for root.",
    defenseMitigation: "Patch Apache CXF and Hoverfly, secure secret keys used for Flask session signing, disable anonymous FTP access, and eliminate world-writable permissions on system binaries.",
    labPractice: "Review the writeup under /writeups/devarea or test Apache CXF and Hoverfly configurations in a local lab.",
    tags: ["Hack The Box", "Linux", "Apache CXF", "Hoverfly", "Flask Unsign", "Privilege Escalation"],
    isOffTopic: false,
  },
  garfield: {
    keyword: "Garfield",
    title: "Hack The Box: Garfield Machine Analysis",
    category: "Active Directory Exploitation / Windows Security",
    severity: "High",
    cveOrStandard: "Active Directory / RBCD / RODC Key List Attack",
    definition: "Garfield is a Hard-difficulty Windows machine on Hack The Box documented in Rohit's portfolio, focusing on Active Directory SYSVOL scripts, Read-Only Domain Controller (RODC) abuse, and Kerberos delegation.",
    attackMechanics: "Discovers credentials inside SYSVOL logon scripts, uses bloodyAD to configure Resource-Based Constrained Delegation (RBCD), and executes an RODC Key List Attack using Mimikatz and Rubeus to elevate to Domain Admin.",
    defenseMitigation: "Remove plaintext credentials from SYSVOL and Group Policy Preferences, restrict computer account delegation rights, and audit RODC Password Replication Policies (PRP).",
    labPractice: "Simulate RODC replication in an Active Directory lab using bloodyAD and Rubeus, or practice on Hack The Box.",
    tags: ["Hack The Box", "Windows", "Active Directory", "RBCD", "RODC", "Mimikatz", "Rubeus"],
    isOffTopic: false,
  },
  facts: {
    keyword: "Facts",
    title: "Hack The Box: Facts Machine Analysis",
    category: "CMS Exploitation / Linux Privilege Escalation",
    severity: "Medium",
    cveOrStandard: "CVE-2024-46987 / Puppet Facter",
    definition: "Facts is an Easy-difficulty Linux machine on Hack The Box documented in Rohit's portfolio, focusing on Ruby on Rails CMS path traversal and Puppet Facter privilege escalation.",
    attackMechanics: "Exploits a path traversal vulnerability in Camaleon CMS (CVE-2024-46987) to extract sensitive files, cracks encrypted SSH private keys using John the Ripper, and abuses custom Puppet Facter environment variables to execute code as root.",
    defenseMitigation: "Upgrade Camaleon CMS, enforce strong SSH passphrases, and sanitize environment variables in Puppet Facter execution scripts.",
    labPractice: "Deploy Facts on Hack The Box or view the walkthrough under /writeups/facts.",
    tags: ["Hack The Box", "Linux", "Camaleon CMS", "Path Traversal", "John the Ripper", "Facter"],
    isOffTopic: false,
  },
  logging: {
    keyword: "Logging",
    title: "Hack The Box: Logging Machine Analysis",
    category: "Active Directory / PKI & Certificate Services",
    severity: "High",
    cveOrStandard: "ADCS ESC17 / Shadow Credentials / WSUS",
    definition: "Logging is a Medium-difficulty Windows machine on Hack The Box documented in Rohit's portfolio, focusing on Active Directory Certificate Services (ADCS), Shadow Credentials, and WSUS exploitation.",
    attackMechanics: "Discovers sensitive logging configurations, abuses Shadow Credentials (msDS-KeyCredentialLink) via Whisker/PyWhisker, exploits ADCS ESC17 misconfigured certificate templates with Certipy, and executes DLL sideloading via a rogue WSUS server.",
    defenseMitigation: "Harden AD CS certificate templates, monitor changes to KeyCredentialLink attributes, enforce code signing on WSUS update packages, and restrict DLL search paths.",
    labPractice: "Audit AD CS templates using Certipy find in an Active Directory test lab.",
    tags: ["Hack The Box", "Windows", "Active Directory", "ADCS", "ESC17", "Shadow Credentials", "WSUS"],
    isOffTopic: false,
  },
  silentium: {
    keyword: "Silentium",
    title: "Hack The Box: Silentium Machine Analysis",
    category: "AI Platform Exploitation / Git Security",
    severity: "Medium",
    cveOrStandard: "CVE-2025-59528 / CVE-2025-8110",
    definition: "Silentium is an Easy-difficulty Linux machine on Hack The Box documented in Rohit's portfolio, demonstrating account takeover in Flowise AI and Git symlink privilege escalation.",
    attackMechanics: "Takes over a Flowise AI instance (CVE-2025-59528) to extract environment credentials, exploits Gogs Git server vulnerabilities (CVE-2025-8110), and bypasses symlink restrictions to read root credentials.",
    defenseMitigation: "Patch Flowise and Gogs, rotate exposed API keys and environment variables, and configure secure file permission masks on shared repositories.",
    labPractice: "Review the writeup under /writeups/silentium.",
    tags: ["Hack The Box", "Linux", "Flowise AI", "Gogs", "Symlink Bypass", "Privilege Escalation"],
    isOffTopic: false,
  },
  variatype: {
    keyword: "VariaType",
    title: "Hack The Box: VariaType Machine Analysis",
    category: "Python Package Security / XML Injection",
    severity: "High",
    cveOrStandard: "CVE-2025-66034 / CVE-2025-47273",
    definition: "VariaType is a Medium-difficulty Linux machine on Hack The Box documented in Rohit's portfolio, focusing on font parser XML injection and Python setuptools path traversal.",
    attackMechanics: "Recovers credentials from an exposed Git repository, exploits XML injection in fontTools (CVE-2025-66034) to achieve command execution, and elevates to root via setuptools path traversal (CVE-2025-47273) in scheduled cron jobs.",
    defenseMitigation: "Upgrade fontTools and setuptools, disable XML external entity parsing, and audit automated cron scripts for insecure file extraction.",
    labPractice: "Deploy on Hack The Box or inspect the walkthrough under /writeups/variatype.",
    tags: ["Hack The Box", "Linux", "fontTools", "XML Injection", "setuptools", "Cron Job"],
    isOffTopic: false,
  },
  wingdata: {
    keyword: "WingData",
    title: "Hack The Box: WingData Machine Analysis",
    category: "FTP Server Exploitation / Path Traversal",
    severity: "High",
    cveOrStandard: "CVE-2025-47812 / CVE-2025-4517",
    definition: "WingData is an Easy-difficulty Linux machine on Hack The Box documented in Rohit's portfolio, focusing on Wing FTP Server unauthenticated RCE and Python tarfile traversal.",
    attackMechanics: "Exploits an unauthenticated RCE in Wing FTP Server (CVE-2025-47812), dumps configuration and credentials via wacky.xml, and escalates privileges to root through Python tarfile path traversal (CVE-2025-4517).",
    defenseMitigation: "Update Wing FTP Server, sanitize user-supplied archive extractions with data_filter='tar' in Python 3.12+, and restrict FTP administrative web interfaces.",
    labPractice: "Practice tarfile path traversal defense in Python labs.",
    tags: ["Hack The Box", "Linux", "Wing FTP", "unauthenticated RCE", "tarfile", "Privilege Escalation"],
    isOffTopic: false,
  },
  airtouch: {
    keyword: "AirTouch",
    title: "Hack The Box: AirTouch Machine Analysis",
    category: "Wireless Network Security / 802.1X Enterprise",
    severity: "High",
    cveOrStandard: "WPA2-Enterprise / PEAP MS-CHAPv2 / SNMP",
    definition: "AirTouch is a Medium-difficulty Linux machine on Hack The Box documented in Rohit's portfolio, focusing on WPA2-Enterprise RADIUS authentication capture and network protocol analysis.",
    attackMechanics: "Harvests SNMP community strings, inspects Wireshark captures of PEAP MS-CHAPv2 RADIUS handshakes, cracks user authentication hashes, deploys an Evil Twin rogue access point, and exploits an SUID binary for root.",
    defenseMitigation: "Implement WPA3-Enterprise with server certificate validation, enforce strong password policies against dictionary attacks, and disable default SNMP community strings.",
    labPractice: "Analyze RADIUS packets in Wireshark and audit 802.1X PEAP configurations.",
    tags: ["Hack The Box", "Linux", "Wireless", "WPA2-Enterprise", "SNMP", "PEAP", "SUID"],
    isOffTopic: false,
  },
  browsed: {
    keyword: "Browsed",
    title: "Hack The Box: Browsed Machine Analysis",
    category: "Browser Security / Python Bytecode Poisoning",
    severity: "High",
    cveOrStandard: "Chrome Extension / Python __pycache__ Injection",
    definition: "Browsed is a Medium-difficulty Linux machine on Hack The Box documented in Rohit's portfolio, focusing on malicious Chrome extension analysis and Python cache poisoning.",
    attackMechanics: "Analyzes a custom Chrome extension to discover command injection vulnerabilities, gains initial access, and achieves root privilege escalation by poisoning Python __pycache__ compiled bytecode in world-writable modules.",
    defenseMitigation: "Enforce extension allowlisting via Chrome Enterprise policies, restrict write permissions on Python site-packages directories, and audit SUID binaries.",
    labPractice: "Inspect Chrome extension manifest permissions and Python bytecode execution order.",
    tags: ["Hack The Box", "Linux", "Chrome Extension", "Command Injection", "Python Cache", "SUID"],
    isOffTopic: false,
  },
  eloquia: {
    keyword: "Eloquia",
    title: "Hack The Box: Eloquia Machine Analysis",
    category: "Windows Post-Exploitation / DPAPI Decryption",
    severity: "Critical",
    cveOrStandard: "SQLite load_extension() / Windows DPAPI",
    definition: "Eloquia is an Insane-difficulty Windows machine on Hack The Box documented in Rohit's portfolio, focusing on advanced DLL injection, SQLite extension loading, and DPAPI credential vault extraction.",
    attackMechanics: "Achieves execution via SQLite load_extension() DLL injection, decrypts Windows DPAPI master keys to extract stored Microsoft Edge enterprise credentials, and leverages a writable Windows service binary for SYSTEM escalation.",
    defenseMitigation: "Disable SQLite extension loading in database configurations, enforce AppLocker/WDAC DLL verification policies, and audit Windows service DACLs against unprivileged write access.",
    labPractice: "Study Windows DPAPI credential protection architecture and service binary ACLs.",
    tags: ["Hack The Box", "Windows", "SQLite", "DLL Injection", "DPAPI", "Edge Passwords", "Privilege Escalation"],
    isOffTopic: false,
  },
  overwatch: {
    keyword: "Overwatch",
    title: "Hack The Box: Overwatch Machine Analysis",
    category: "Active Directory / Database Pivoting",
    severity: "High",
    cveOrStandard: "MSSQL Linked Servers / DNS Poisoning / SOAP",
    definition: "Overwatch is a Medium-difficulty Windows machine on Hack The Box documented in Rohit's portfolio, focusing on Active Directory, MSSQL linked server crawling, and SOAP web service injection.",
    attackMechanics: "Executes LLMNR/DNS spoofing, queries internal SOAP web services to trigger command injection, crawls through nested MSSQL linked servers using openquery, and elevates to Domain Admin.",
    defenseMitigation: "Disable LLMNR and NetBIOS-NS, restrict MSSQL linked server RPC permissions and SA account delegation, and validate SOAP XML input.",
    labPractice: "Simulate MSSQL linked server lateral movement in an Active Directory lab.",
    tags: ["Hack The Box", "Windows", "Active Directory", "MSSQL", "DNS Poisoning", "SOAP", "Privilege Escalation"],
    isOffTopic: false,
  },
  kobold: {
    keyword: "Kobold",
    title: "Hack The Box: Kobold Machine Analysis",
    category: "AI Protocol Security / Model Context Protocol",
    severity: "High",
    cveOrStandard: "CVE-2026-23744 / Model Context Protocol (MCP)",
    definition: "Kobold is an Easy-difficulty Linux machine on Hack The Box featuring cutting-edge exploitation of Model Context Protocol (MCP) servers and Docker permissions.",
    attackMechanics: "Exploits token validation bypass in MCPJam Inspector (CVE-2026-23744) to execute arbitrary commands through MCP tool calling, and leverages Docker socket group membership to mount host filesystem and obtain root.",
    defenseMitigation: "Enforce mutual TLS and strict authentication on MCP server endpoints, restrict Docker group membership to trusted administrators, and run containers in rootless mode.",
    labPractice: "Deploy local MCP test servers and practice securing agentic AI tools against unauthorized execution.",
    tags: ["Hack The Box", "Linux", "Model Context Protocol", "MCPJam", "Docker Group", "Privilege Escalation"],
    isOffTopic: false,
  },
  interpreter: {
    keyword: "Interpreter",
    title: "Hack The Box: Interpreter Machine Analysis",
    category: "Java Deserialization / Healthcare Integration",
    severity: "High",
    cveOrStandard: "CVE-2023-43208 / Mirth Connect",
    definition: "Interpreter is a Medium-difficulty Linux machine on Hack The Box focusing on healthcare integration engine deserialization and SSTI.",
    attackMechanics: "Exploits unauthenticated remote code execution via XStream Java deserialization in NextGen Mirth Connect (CVE-2023-43208), abuses Server-Side Template Injection (SSTI), and escalates to root via a vulnerable XML parser script.",
    defenseMitigation: "Upgrade Mirth Connect to patched releases (3.12.1+), disable unsafe XStream deserialization, and audit internal XML processing scripts.",
    labPractice: "Analyze XStream deserialization payloads and gadget chains in a Java security lab.",
    tags: ["Hack The Box", "Linux", "Mirth Connect", "Deserialization", "SSTI", "Privilege Escalation"],
    isOffTopic: false,
  },
  reactor: {
    keyword: "Reactor",
    title: "Hack The Box: Reactor Machine Analysis",
    category: "Competitive Season 11 / Industrial Infrastructure",
    severity: "High",
    cveOrStandard: "HTB Season 11 Active Lineup",
    definition: "Reactor is an active competitive machine featured in Hack The Box Season 11, focusing on industrial infrastructure, API authentication, and system privilege escalation.",
    attackMechanics: "Reconnaissance focuses on industrial web services and API endpoints, finding authentication flaws to establish initial footholds, followed by internal service exploitation for privilege escalation.",
    defenseMitigation: "Isolate SCADA/industrial management interfaces behind strict network segmentation, enforce multi-factor authentication, and monitor service process executions.",
    labPractice: "Play live on Hack The Box Season 11 competitive arena.",
    tags: ["Hack The Box", "Season 11", "Competitive", "Infrastructure", "API Security"],
    isOffTopic: false,
  },
  sauna: {
    keyword: "Sauna",
    title: "Hack The Box: Sauna Machine Analysis",
    category: "Active Directory Exploitation / Windows Security",
    severity: "Medium",
    cveOrStandard: "AS-REP Roasting / Mimikatz / DCSync",
    definition: "Sauna is an Easy-difficulty Windows machine on Hack The Box that serves as a quintessential introduction to Active Directory attacks.",
    attackMechanics: "Discovers user accounts via web employee listings, performs AS-REP Roasting against accounts without Kerberos pre-authentication, extracts internal credentials with Mimikatz, and executes DCSync via GetChangesAll permissions.",
    defenseMitigation: "Require Kerberos pre-authentication on all user accounts, enforce long passphrases, and restrict replication permissions (DS-Replication-Get-Changes).",
    labPractice: "Use Impacket GetNPUsers.py and secretsdump.py in an Active Directory lab.",
    tags: ["Hack The Box", "Windows", "Active Directory", "AS-REP Roasting", "Mimikatz", "DCSync"],
    isOffTopic: false,
  },
  forest: {
    keyword: "Forest",
    title: "Hack The Box: Forest Machine Analysis",
    category: "Active Directory Exploitation / Windows Security",
    severity: "High",
    cveOrStandard: "AS-REP Roasting / Exchange Windows Permissions / DCSync",
    definition: "Forest is a classic Windows Active Directory machine on Hack The Box demonstrating AS-REP roasting and Exchange group privilege escalation.",
    attackMechanics: "Enumerates users via Kerberos, executes AS-REP roasting to obtain initial shell, maps Active Directory ACLs using BloodHound, and exploits Exchange Windows Permissions to grant DCSync rights and dump hashes.",
    defenseMitigation: "Enforce Kerberos pre-authentication, remove privileged ACLs from Exchange groups, and monitor replication requests.",
    labPractice: "Collect and analyze domain relations with SharpHound and BloodHound.",
    tags: ["Hack The Box", "Windows", "Active Directory", "AS-REP Roasting", "BloodHound", "Exchange"],
    isOffTopic: false,
  },
};

/**
 * Helper to match any user query to a verified HTB machine card
 */
export function findVerifiedHtbCard(keyword: string): CyberConceptCard | null {
  const lower = keyword.toLowerCase().trim();
  if (!lower) return null;

  // Direct dictionary hit
  if (VERIFIED_HTB_MACHINES_CARDS[lower]) {
    return VERIFIED_HTB_MACHINES_CARDS[lower];
  }

  // Strip query noise: "htb", "hack the box", "hackthebox", "machine", "box", "writeup", "walkthrough"
  const clean = lower
    .replace(/\b(htb|hack\s*the\s*box|hackthebox|machine|box|writeup|walkthrough|analysis|ctf)\b/gi, "")
    .trim();

  if (clean && VERIFIED_HTB_MACHINES_CARDS[clean]) {
    return VERIFIED_HTB_MACHINES_CARDS[clean];
  }

  // Check if any machine key is an isolated word in the query
  for (const [key, card] of Object.entries(VERIFIED_HTB_MACHINES_CARDS)) {
    const regex = new RegExp(`\\b${key}\\b`, "i");
    if (regex.test(lower)) {
      return card;
    }
  }

  return null;
}



/**
 * Generate an Intelligence Concept Card for any searched term
 * Collaborates directly with the portfolio writeup database, verified HTB machine catalog,
 * and live MITRE/Web Search Grounding to eliminate hallucinations and off-topic false positives.
 */
export async function generateCyberConceptCard(
  keyword: string,
  portfolioContext?: {
    matchedWriteups?: {
      slug: string;
      title: string;
      machineName: string;
      os: "linux" | "windows";
      difficulty: string;
      season: string;
      tags: string[];
      snippet?: string;
      headingText?: string;
    }[];
  }
): Promise<CyberConceptCard | null> {
  const trimmed = keyword.trim();
  if (!trimmed) return null;

  const lower = trimmed.toLowerCase();

  // 1. Check verified HTB machine catalog first (Pirate, CCTV, DevArea, Garfield, Sauna, Forest, Reactor, etc.)
  const verifiedHtb = findVerifiedHtbCard(trimmed);
  if (verifiedHtb) {
    return verifiedHtb;
  }

  // 2. Direct match in curated offline vulnerability cards (Petitpotam, ESC17, Fluxion)
  if (OFFLINE_CYBER_CARDS[lower]) {
    return OFFLINE_CYBER_CARDS[lower];
  }

  // 3. Match against portfolio writeups context if available
  if (portfolioContext?.matchedWriteups && portfolioContext.matchedWriteups.length > 0) {
    const directMatch = portfolioContext.matchedWriteups.find((m) => {
      const mName = m.machineName.toLowerCase();
      return lower === mName || lower.includes(mName) || mName.includes(lower);
    });

    if (directMatch) {
      const htbFromMatch = findVerifiedHtbCard(directMatch.machineName);
      if (htbFromMatch) {
        return htbFromMatch;
      }

      return {
        keyword: directMatch.machineName,
        title: `Hack The Box: ${directMatch.machineName} Machine Analysis`,
        category: `${
          directMatch.os === "windows"
            ? "Active Directory / Windows Security"
            : "Linux Exploitation / Web Security"
        } (${directMatch.difficulty.toUpperCase()})`,
        severity:
          directMatch.difficulty.toLowerCase() === "insane"
            ? "Critical"
            : directMatch.difficulty.toLowerCase() === "hard"
            ? "High"
            : directMatch.difficulty.toLowerCase() === "medium"
            ? "Medium"
            : "Informational",
        cveOrStandard:
          directMatch.tags.filter((t) => t.toLowerCase().startsWith("cve-")).join(" / ") ||
          (directMatch.os === "windows" ? "Active Directory / Windows" : "Linux / Web Security"),
        definition: `${directMatch.machineName} is a ${directMatch.difficulty}-difficulty ${
          directMatch.os === "windows" ? "Windows" : "Linux"
        } machine on Hack The Box documented in Rohit's portfolio. Key attack surface: ${directMatch.tags
          .slice(0, 5)
          .join(", ")}.`,
        attackMechanics:
          directMatch.snippet ||
          `Focuses on ${directMatch.tags.join(
            ", "
          )} to achieve initial access and escalate privileges to root/SYSTEM.`,
        defenseMitigation:
          directMatch.os === "windows"
            ? "Enforce SMB signing and LDAP channel binding, disable NTLM, restrict machine account quotas, audit Kerberos delegations, and monitor privileged group memberships."
            : "Apply security updates, sanitize user inputs against injection, enforce least-privilege service accounts, and audit SUID/cron binaries.",
        labPractice: `Review the full step-by-step walkthrough in this portfolio under /writeups/${directMatch.slug} or deploy ${directMatch.machineName} on Hack The Box.`,
        tags: [
          "Hack The Box",
          directMatch.os === "windows" ? "Windows" : "Linux",
          ...directMatch.tags,
        ],
        isOffTopic: false,
      };
    }
  }

  // 4. Extract Portfolio Writeup Evidence (Pass exact snippets into LLM prompt so it never hallucinates)
  let writeupEvidence = "";
  if (portfolioContext?.matchedWriteups && portfolioContext.matchedWriteups.length > 0) {
    const writeupList = portfolioContext.matchedWriteups
      .map(
        (w) =>
          `- Machine: ${w.machineName} (${w.os.toUpperCase()} - ${w.difficulty})\n  Writeup Title: "${w.title}" (/writeups/${w.slug})\n  Relevant Match Snippet: "${w.snippet || ""}"\n  Section Heading: "${w.headingText || ""}"`
      )
      .join("\n\n");
    writeupEvidence = `\n### VERIFIED PORTFOLIO WRITEUP EVIDENCE:\nThe searched term "${trimmed}" appears directly in Rohit's Hack The Box writeup(s):\n${writeupList}\n\nCRITICAL DIRECTIVE: You MUST integrate this writeup evidence into your response. Reference the specific tool (e.g. ntlmrelayx.py), explain its exact role on ${portfolioContext.matchedWriteups[0].machineName}, and treat this strictly as CASE 1 (Cybersecurity). It is NEVER off-topic.\n`;
  }

  // 5. Retrieve Grounding Context (Official MITRE CVE, live web search disclosures, 2026 data, Season lists)
  let groundingPromptText = "";
  let liveCve: LiveCveRecord | null = null;

  try {
    const grounding = await getSearchGroundingContext(trimmed);
    if (grounding.hasGrounding) {
      groundingPromptText = grounding.groundingPromptText;
      liveCve = grounding.cveRecord || null;
    }
  } catch (gErr) {
    console.warn("Search grounding fetch failed:", gErr);
  }

  const currentKey = process.env.GEMINI_API_KEY || "";
  if (!currentKey) {
    return OFFLINE_CYBER_CARDS[lower] || null;
  }

  try {
    const ai = new GoogleGenerativeAI(currentKey);

    let systemInstruction = `You are daemon (Elliot Alderson / fsociety), an elite offensive security intelligence engine residing inside Rohit Saindane's Hack The Box portfolio.
Given any user query, analyze it and compute an authoritative, Google/Rapid7-style security intelligence response in JSON format.

CURRENT TIMELINE ANCHOR: The current year is 2026. You possess comprehensive knowledge of modern vulnerabilities, enterprise CVE disclosures (including 2024, 2025, and 2026 advisories), zero-days, and Hack The Box machines. NEVER claim a CVE or exploit is "hypothetical", "future-dated", or "non-existent". If asked about a CVE or vendor appliance flaw, provide authoritative, real-world technical intelligence.

CRITICAL DIRECTIVE ON HACK THE BOX & CTF QUERIES:
If the user query mentions or asks for:
- Any Hack The Box machine, CTF challenge, lab, or writeup (e.g. "Pirate", "Reactor", "DevHub", "Sauna", "Forest", "Legacy", "Blue", "CCTV", "DevArea", "Garfield")
- This is strictly CASE 1 (Cybersecurity / CTF / Machine Analysis).
- "isOffTopic" MUST BE FALSE.
- Accurately determine whether the target is Windows or Linux, its difficulty, and its real attack surface.
- NEVER hallucinate generic Linux SUID/cron jobs for Windows or Active Directory machines.

Determine whether the query is related to cybersecurity, hacking, penetration testing, computer systems, networking, cryptography, vulnerabilities, exploits, protocols, tools, or CTF writeups, OR if it is unrelated (e.g. conversational question like "Mera naam kya hai?", food, sports, general knowledge, personal question, casual language).

### CASE 1: Cybersecurity / Hacking / HTB Machine / CVE / Tool / Command / Flag / Version / Operating System:
This CASE STRICTLY APPLIES to:
- Command-line flags and parameters (e.g. '--remove-mic', '--delegate-access', '-smb2support', '-m 3200', '-sC', '-sV', '--hashes', '--template', '-p-')
- Security tools, utilities, frameworks, and commands (e.g. ntlmrelayx, certipy, rubeus, mimikatz, hashcat, nmap, impacket, responder, sqlmap, bloodhound)
- Software versions, firmware, releases, patch levels (e.g. 'ZoneMinder 1.37.x', 'Apache 2.4.49', 'Linux 6.8', 'Windows Server 2019', 'OpenSSL 3.0')
- Operating systems, architectures, distributions, and kernel subsystems (e.g. Windows Active Directory, Linux SUID, eBPF, Docker, Kubernetes)
- Latest technologies, protocols, and modern standards (e.g. Model Context Protocol / MCP, OAuth, SAML, Kerberos, LDAPS, DPAPI, gMSA, RBCD)
- Vulnerabilities, CVEs, zero-days, and exploit primitives (e.g. CVE-2019-1040, CVE-2026-83548, PetitPotam, ESC17)
- Hack The Box machines, CTF challenges, and writeup techniques

MANDATORY SPECIFICATIONS FOR FLAGS, COMMANDS & TOOLS:
- "keyword": exact searched term
- "title": Clean, authoritative title naming the exact tool and flag (e.g. "ntlmrelayx.py: --remove-mic Flag (Drop the MIC)" or "Hashcat: -m 3200 (bcrypt Cracking)")
- "category": Exact domain and tool family (e.g. "Active Directory / Impacket Tooling", "Password Cracking / Cryptanalysis", "Network Reconnaissance")
- "severity": "Critical" | "High" | "Medium" | "Low" | "Informational" (assign accurate CVSS-aligned or machine difficulty severity)
- "cveOrStandard": Associated CVE, RFC, or protocol standard (e.g. "CVE-2019-1040 / Drop the MIC (NTLM Protocol)")
- "definition": Precise 1-2 sentences defining: (1) what tool this flag belongs to, (2) where it originated / its historical CVE or protocol context, and (3) its primary technical purpose.
- "attackMechanics": Bit/packet-level mechanics of what the flag alters (e.g. stripping the 16-byte Message Integrity Code from the NTLM Authenticate message, unsetting NTLMSSP_NEGOTIATE_SIGN and NTLMSSP_NEGOTIATE_ALWAYS_SIGN to defeat relay protection to LDAPS).
- "defenseMitigation": Precise, actionable blue team remediation (vendor patches, registry keys like LdapEnforceChannelBinding = 2, LDAPServerIntegrity = 2, SMB signing, telemetry).
- "labPractice": Practical CLI syntax example using this flag, and reference to Rohit's writeup (e.g. "Documented in Rohit's Pirate writeup (/writeups/pirate): proxychains ntlmrelayx.py -t ldaps://<DC_IP> --remove-mic --delegate-access -smb2support").
- "tags": 3-5 relevant security tags.
- "isOffTopic": false (NEVER classify a flag, command, tool, version, or tech term as Off-Target or Signal Deviation!)

### CASE 2: Non-Hacking / Off-Topic / Everyday Query (e.g. "Mera naam kya hai?", "how to make cake", "who is elon musk", "weather today", casual chat):
- "keyword": exact searched query
- "title": "Signal Deviation // Off-Target Query"
- "category": "Off-Target // Real-World Noise"
- "severity": "Informational"
- "cveOrStandard": "OUT-OF-SCOPE"
- "definition": A clear, objective explanation of what the user searched, providing translation or context if in another language or domain.
- "attackMechanics": Speak in Elliot Alderson's internal monologue tone. Remind them they are straying off path into ordinary reality noise, questioning their existential drift or mundane curiosity inside an offensive security terminal, and reminding them this system was built for breaking digital constructs.
- "defenseMitigation": An fsociety directive instructing them to refocus their terminal on penetration testing, vulnerability research, protocols, and root flags.
- "labPractice": "Re-route terminal input: Try searching 'Active Directory', 'Petitpotam', 'ESC17', 'SQLi', or 'Buffer Overflow'."
- "tags": ["off-target", "signal-drift", "fsociety-terminal", "refocus"]
- "isOffTopic": true

Strictly output valid JSON matching these keys without markdown wrapping.`;

    if (writeupEvidence) {
      systemInstruction += `\n\n${writeupEvidence}`;
    }

    if (groundingPromptText) {
      systemInstruction += `\n\n${groundingPromptText}`;
    }

    if (liveCve) {
      systemInstruction += `\n\n### VERIFIED LIVE MITRE / CVE RECORD GROUND TRUTH:
The user is querying an official CVE record:
- CVE ID: ${liveCve.cveId}
- Vendor / Product: ${liveCve.vendor || "Unknown"} ${liveCve.product || ""} (Affected Versions: ${liveCve.versions || "See vendor advisory"})
- Official Description: ${liveCve.description || ""}
- Problem Classification / CWEs: ${liveCve.cwes || "Vulnerability"}
- Primary References: ${Array.isArray(liveCve.references) ? liveCve.references.join(", ") : liveCve.references || "Vendor Advisory"}

CRITICAL REQUIREMENT: Use this verified official record as absolute factual ground-truth. Do NOT call this hypothetical. Accurately reflect the vendor, product, and vulnerability type in your JSON output.`;
    }

    const prompt = `User Search Query: "${trimmed}"`;

    for (const mName of CANDIDATE_MODELS) {
      try {
        const model = ai.getGenerativeModel({
          model: mName,
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.25,
          },
          systemInstruction,
        });

        const result = await model.generateContent(prompt);
        const text = result.response.text();

        if (text) {
          let cleanJson = text.trim();
          if (cleanJson.startsWith("```json")) {
            cleanJson = cleanJson.replace(/^```json\s*/, "").replace(/\s*```$/, "");
          } else if (cleanJson.startsWith("```")) {
            cleanJson = cleanJson.replace(/^```\s*/, "").replace(/\s*```$/, "");
          }

          const parsed = JSON.parse(cleanJson) as CyberConceptCard;
          if (parsed && parsed.title && parsed.definition) {
            // SAFETY CHECK: If query is technical or matched writeups, NEVER allow an off-topic / Signal Deviation card!
            const isTech =
              isVulnerabilityOrTechnicalQuery(trimmed) ||
              Boolean(portfolioContext?.matchedWriteups && portfolioContext.matchedWriteups.length > 0);

            if (
              isTech &&
              (parsed.isOffTopic ||
                parsed.title.includes("Signal Deviation") ||
                parsed.category.includes("Real-World Noise"))
            ) {
              const cleanKey = trimmed.toLowerCase();
              if (OFFLINE_CYBER_CARDS[cleanKey]) {
                return OFFLINE_CYBER_CARDS[cleanKey];
              }
              if (portfolioContext?.matchedWriteups && portfolioContext.matchedWriteups.length > 0) {
                const firstW = portfolioContext.matchedWriteups[0];
                return {
                  keyword: trimmed,
                  title: `${firstW.machineName}: ${trimmed} Technical Analysis`,
                  category:
                    firstW.os === "windows"
                      ? "Active Directory / Windows Security"
                      : "Linux / Web Security",
                  severity: "High",
                  cveOrStandard:
                    firstW.tags.find((t) => t.toLowerCase().startsWith("cve-")) ||
                    "Security Standard",
                  definition: `Technical command or parameter used in Rohit's ${firstW.machineName} writeup. ${firstW.snippet || ""}`,
                  attackMechanics: `Employed in ${firstW.machineName} (${firstW.title}) during the ${firstW.headingText || "exploitation phase"}.`,
                  defenseMitigation:
                    "Enforce principle of least privilege, apply security patches, and monitor authentication telemetry.",
                  labPractice: `Review the full step-by-step walkthrough in /writeups/${firstW.slug}.`,
                  tags: ["Hack The Box", firstW.machineName, trimmed, ...firstW.tags.slice(0, 3)],
                  isOffTopic: false,
                };
              }
            }
            return parsed;
          }
        }
      } catch (err: unknown) {
        console.warn(`Model ${mName} attempt failed for "${trimmed}", trying next candidate:`, err instanceof Error ? err.message : err);
      }
    }

    // If all models fail and we have an offline entry matching partially
    for (const [k, v] of Object.entries(OFFLINE_CYBER_CARDS)) {
      if (lower.includes(k) || k.includes(lower)) {
        return v;
      }
    }

    // Synthesize an off-topic fallback card only if completely unreachable and non-cyber
    return {
      keyword: trimmed,
      title: `Signal Deviation: ${trimmed}`,
      category: "Off-Target // Real-World Noise",
      severity: "Informational",
      cveOrStandard: "OUT-OF-SCOPE",
      definition: `The searched query "${trimmed}" does not match an active offensive security protocol or local machine flag in the terminal database.`,
      attackMechanics: "You're drifting off the path, friend. The noise of everyday reality is seeping into the terminal. We're here to dissect architectures, memory boundaries, and root privileges—not to wander through non-operational queries.",
      defenseMitigation: "Refocus your terminal session. Align your search toward known exploits, Active Directory misconfigurations, CVEs, or penetration testing tools.",
      labPractice: "Re-align search query: Try 'Active Directory', 'Petitpotam', 'ESC17', 'Fluxion', or 'SQLi'.",
      tags: ["off-target", "signal-drift", "fsociety-terminal", "refocus"],
      isOffTopic: true,
    };
  } catch (error) {
    console.error("Error generating cyber concept card:", error);
    return null;
  }
}
