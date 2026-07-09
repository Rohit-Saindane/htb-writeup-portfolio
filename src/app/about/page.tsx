import { Shield, FileText, Code2, GraduationCap, Server, Contact, Radar, Zap, GitBranch, Activity, Key, ShieldAlert, Terminal, Cpu } from "lucide-react";

export const metadata = {
  title: "About Me | Rohit Saindane",
  description:
    "Biography, technical certifications, penetration testing tools, and cybersecurity education of Rohit Saindane, 2nd-year B.Tech CSE Cyber Security student.",
};

const toolkitList = [
  { name: "Nmap", category: "Recon & Scanning", icon: Radar, color: "text-blue-400" },
  { name: "Burp Suite", category: "Web Interception", icon: Shield, color: "text-orange-400" },
  { name: "Metasploit", category: "Exploitation Framework", icon: Zap, color: "text-red-400" },
  { name: "BloodHound", category: "AD Path Auditing", icon: GitBranch, color: "text-purple-400" },
  { name: "Wireshark", category: "Packet & Protocol", icon: Activity, color: "text-cyan-400" },
  { name: "Mimikatz", category: "Credential Dumping", icon: Key, color: "text-emerald-400" },
  { name: "Rubeus", category: "Kerberos Attacks", icon: ShieldAlert, color: "text-rose-400" },
  { name: "Python / Bash", category: "Automation & Scripting", icon: Code2, color: "text-yellow-400" }
];

export default function AboutPage() {
  return (
    <div className="w-full min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8 text-foreground relative overflow-hidden">
      {/* Subtle background grid effect */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.03)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10">
        
        {/* About Header */}
        <div className="mb-12 text-center md:text-left border-b border-border/60 pb-8">
          <h1 className="text-3xl sm:text-4xl font-bold font-mono tracking-tight text-foreground flex items-center justify-center md:justify-start gap-2">
            <span className="text-accent">&gt;_</span>
            <span>About Me</span>
          </h1>
          <p className="text-sm font-sans text-muted-foreground mt-2 max-w-xl leading-relaxed">
            Offensive security enthusiast, developer, and B.Tech Cybersecurity student based in India. Focused on finding vulnerabilities by breaking and rebuilding systems.
          </p>
        </div>

        {/* Bio Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-12">
          
          {/* Left Column: Biography, Specialties, Projects & Education (8 cols) */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Biography */}
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-2 h-full bg-accent opacity-80" />
              <h2 className="text-lg font-bold font-mono text-foreground mb-3 flex items-center gap-2">
                <Shield className="w-5 h-5 text-accent" />
                <span>Biography</span>
              </h2>
              <div className="space-y-4 text-sm sm:text-base text-muted-foreground leading-relaxed font-sans">
                <p>
                  I am currently a 2nd-year B.Tech student in Computer Science & Engineering with a specialization in **Cybersecurity**. My technical path started with a solid foundation in computer engineering principles, driving me directly toward offensive security and security research.
                </p>
                <p>
                  My learning methodology centers around hands-on practice. On platforms like **Hack The Box (HTB)**, I work on mastering Active Directory exploitation (RBCD, Kerberoasting, ACL abuse, and trust relationships) and web application vulnerabilities (SQLi, SSRF, and prototype pollution) to chain them into Remote Code Execution (RCE).
                </p>
              </div>
            </div>

            {/* Specialties & Lab Areas */}
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-bold font-mono text-foreground mb-4 flex items-center gap-2">
                <Terminal className="w-5 h-5 text-accent" />
                <span>Specialized Lab Focus Areas</span>
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                Deep-diving into complex enterprise architectures, concentrating on the following offensive focus areas:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div className="p-3 rounded-lg bg-background border border-border flex flex-col gap-1">
                  <span className="font-mono font-bold text-foreground flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                    Windows Exploitation
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Token manipulation, UAC bypasses, DLL hijacking, and LSASS dumping.
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-background border border-border flex flex-col gap-1">
                  <span className="font-mono font-bold text-foreground flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                    Active Directory & LDAP
                  </span>
                  <span className="text-xs text-muted-foreground">
                    LDAP queries, Kerberoasting, Constrained Delegation, and ACL abuse.
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-background border border-border flex flex-col gap-1 col-span-1 sm:col-span-2">
                  <span className="font-mono font-bold text-foreground flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                    Offensive Infrastructure & AD Attacks
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Kerberos attack vectors, service principal names abuse, and lateral domain compromise paths.
                  </span>
                </div>
              </div>
            </div>

            {/* Academic Projects */}
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-bold font-mono text-foreground mb-4 flex items-center gap-2">
                <Cpu className="w-5 h-5 text-accent" />
                <span>Featured Projects</span>
              </h2>
              <div className="border border-border rounded-lg p-4 bg-background hover:border-accent/30 theme-transition">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <h3 className="font-mono font-bold text-sm text-foreground">
                    Man-in-the-Middle (MitM) Attack Simulation
                  </h3>
                  <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-muted border border-border text-muted-foreground">
                    DIPLOMA CAPSTONE
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Conducted a comprehensive research simulation auditing local area networks. Implemented ARP spoofing, DNS poisoning, and SSL stripping vectors, alongside analyzing active packet interception metrics on Wireshark to recommend cryptographic enforcement mitigations.
                </p>
              </div>
            </div>

            {/* Education Timeline */}
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-bold font-mono text-foreground mb-6 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-accent" />
                <span>Education Background</span>
              </h2>
              
              <div className="relative border-l border-border pl-6 ml-3 space-y-8">
                
                {/* Education Item 1: B.Tech */}
                <div className="relative">
                  <span className="absolute -left-[31px] top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent ring-4 ring-background">
                    <span className="h-1.5 w-1.5 rounded-full bg-background" />
                  </span>
                  
                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                    <h3 className="text-base font-bold font-mono text-foreground leading-tight">
                      B.Tech in Computer Science & Engineering (Cybersecurity)
                    </h3>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-accent/10 border border-accent/20 text-accent uppercase flex-shrink-0 sm:self-start">
                      2026 - Present
                    </span>
                  </div>
                  <p className="text-xs font-mono text-muted-foreground mt-0.5">
                    RNGPIT — R. N. G. Patel Institute of Technology
                  </p>
                  <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                    Advanced study focusing on systems security, cryptography, network defense protocols, and active directory infrastructure hardening.
                  </p>
                </div>

                {/* Education Item 2: Diploma */}
                <div className="relative">
                  <span className="absolute -left-[31px] top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-muted border border-border ring-4 ring-background">
                    <span className="h-1.5 w-1.5 rounded-full bg-background" />
                  </span>
                  
                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                    <h3 className="text-base font-bold font-mono text-foreground leading-tight">
                      Diploma in Computer Engineering
                    </h3>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-muted border border-border text-muted-foreground uppercase flex-shrink-0 sm:self-start">
                      2022 - 2025
                    </span>
                  </div>
                  <p className="text-xs font-mono text-muted-foreground mt-0.5 leading-normal">
                    Jayvantrai Harrai Desai Polytechnic, Palsana (Affiliated with GTU) · <strong className="text-accent font-semibold">8.86 CGPA</strong>
                  </p>
                  <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                    Completed formal technical education covering core computer systems architecture, local area network administration, databases, and structured programming methodologies.
                  </p>
                </div>

              </div>
            </div>

          </div>

          {/* Right Column: Resume & Sidebar Info (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Download CV Hub */}
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm text-center">
              <FileText className="w-8 h-8 text-accent mx-auto mb-3" />
              <h3 className="text-md font-bold font-mono text-foreground mb-1">
                Recruiter Hub
              </h3>
              <p className="text-xs text-muted-foreground mb-4 font-sans leading-relaxed">
                Download my latest CV and detailed technical cybersecurity profile.
              </p>
              <a
                href="/resume.pdf"
                download
                className="w-full py-2.5 rounded-lg bg-accent text-background font-mono text-sm font-semibold hover:bg-accent-hover hover:shadow-glow theme-transition cursor-pointer block text-center"
                id="about-resume-download"
              >
                Download CV
              </a>
            </div>

            {/* Social / Contact Links */}
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
              <h3 className="text-sm font-bold font-mono text-foreground mb-4 flex items-center gap-2">
                <Contact className="w-4 h-4 text-accent" />
                <span>Quick Connect</span>
              </h3>
              
              <div className="space-y-4 font-mono text-xs">
                {/* Github */}
                <a
                  href="https://github.com/Rohit-Saindane"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 text-muted-foreground hover:text-accent theme-transition cursor-pointer group"
                  id="about-github-link"
                >
                  <div className="p-1 rounded bg-black/10 dark:bg-white/5 border border-border group-hover:border-accent/40 theme-transition">
                    <svg
                      viewBox="0 0 24 24"
                      width="16"
                      height="16"
                      stroke="currentColor"
                      strokeWidth="2"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-3.5 h-3.5"
                    >
                      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                      <path d="M9 18c-4.51 2-5-2-7-2" />
                    </svg>
                  </div>
                  <span className="truncate">@Rohit-Saindane</span>
                </a>

                {/* LinkedIn */}
                <a
                  href="https://www.linkedin.com/in/rohit-saindane/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 text-muted-foreground hover:text-accent theme-transition cursor-pointer group"
                  id="about-linkedin-link"
                >
                  <div className="p-1 rounded bg-black/10 dark:bg-white/5 border border-border group-hover:border-accent/40 theme-transition">
                    <svg
                      viewBox="0 0 24 24"
                      width="16"
                      height="16"
                      stroke="currentColor"
                      strokeWidth="2"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-3.5 h-3.5"
                    >
                      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                      <rect x="2" y="9" width="4" height="12" />
                      <circle cx="4" cy="4" r="2" />
                    </svg>
                  </div>
                  <span className="truncate">rohit-saindane</span>
                </a>

                {/* Email */}
                <a
                  href="mailto:rohitsaindane36@gmail.com"
                  className="flex items-center gap-2.5 text-muted-foreground hover:text-accent theme-transition cursor-pointer group"
                  id="about-email-link"
                >
                  <div className="p-1 rounded bg-black/10 dark:bg-white/5 border border-border group-hover:border-accent/40 theme-transition">
                    <svg
                      viewBox="0 0 24 24"
                      width="16"
                      height="16"
                      stroke="currentColor"
                      strokeWidth="2"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-3.5 h-3.5"
                    >
                      <rect x="2" y="4" width="20" height="16" rx="2" />
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                    </svg>
                  </div>
                  <span className="truncate">rohitsaindane36@gmail.com</span>
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* Tools & Environment */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm mb-6">
          <h2 className="text-lg font-bold font-mono text-foreground mb-6 flex items-center gap-2">
            <Server className="w-5 h-5 text-accent" />
            <span>Offensive Toolkit & Environment</span>
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {toolkitList.map((tool) => {
              const Icon = tool.icon;
              return (
                <div
                  key={tool.name}
                  className="flex items-center justify-between p-3 rounded-lg bg-background border border-border hover:border-accent/30 hover:shadow-glow theme-transition duration-200 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded bg-black/5 dark:bg-white/5 border border-border group-hover:border-accent/20 theme-transition">
                      <Icon className={`w-4 h-4 ${tool.color} theme-transition`} />
                    </div>
                    <span className="text-sm font-bold font-mono text-foreground group-hover:text-accent theme-transition">
                      {tool.name}
                    </span>
                  </div>
                  <span className="text-[9px] font-mono text-muted-foreground uppercase bg-black/[0.04] dark:bg-white/[0.04] px-2 py-0.5 rounded border border-border/50">
                    {tool.category}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
