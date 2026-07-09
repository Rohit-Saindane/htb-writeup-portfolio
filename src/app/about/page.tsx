import { Shield, FileText, Code2, GraduationCap, Server, Contact } from "lucide-react";

export const metadata = {
  title: "About Me | Rohit Saindane",
  description:
    "Biography, technical certifications, penetration testing tools, and cybersecurity skills of Rohit Saindane, 2nd-year B.Tech CSE Cyber Security student.",
};

export default function AboutPage() {
  const tools = [
    { name: "Nmap", category: "Recon & Scanning" },
    { name: "Burp Suite", category: "Web Interception" },
    { name: "Metasploit", category: "Exploitation Framework" },
    { name: "BloodHound", category: "AD Path Auditing" },
    { name: "Wireshark", category: "Packet & Protocol Analysis" },
    { name: "Mimikatz", category: "Credential Dumping" },
    { name: "Rubeus", category: "Kerberos Attacks" },
    { name: "Python / Bash", category: "Automation & Scripting" },
  ];

  return (
    <div className="w-full min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8 text-foreground">
      <div className="max-w-4xl mx-auto">
        
        {/* About Header */}
        <div className="mb-10 text-center md:text-left">
          <h1 className="text-3xl sm:text-4xl font-bold font-mono tracking-tight text-foreground flex items-center justify-center md:justify-start gap-2">
            <span className="text-accent">&gt;_</span>
            <span>About Me</span>
          </h1>
          <p className="text-sm font-sans text-muted-foreground mt-2 max-w-xl leading-relaxed">
            Hacker, CS student, and cybersecurity researcher based in India. Documenting the journey of securing systems by breaking them.
          </p>
        </div>

        {/* Bio Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start mb-12">
          
          {/* Main Info */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-bold font-mono text-foreground mb-3 flex items-center gap-2">
                <Shield className="w-5 h-5 text-accent" />
                <span>Biography</span>
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed font-sans mb-4">
                I am a 2nd-year B.Tech student in Computer Science & Engineering with a specialization in **Cybersecurity**. I am passionate about offensive security, penetration testing, and security engineering.
              </p>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed font-sans">
                My hacking journey centers around active learning on platforms like **Hack The Box (HTB)**, where I focus on mastering Active Directory exploitation vectors (such as RBCD, Kerberoasting, and ACL abuse) and chaining web vulnerabilities (such as SQLi, XSS, and SSRF) into Remote Code Execution (RCE).
              </p>
            </div>

            {/* Education section */}
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-bold font-mono text-foreground mb-4 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-accent" />
                <span>Education</span>
              </h2>
              <div className="space-y-4">
                <div className="border-l-2 border-accent pl-4">
                  <h3 className="text-base font-bold font-mono text-foreground">
                    B.Tech in Computer Science & Engineering (Cybersecurity)
                  </h3>
                  <p className="text-xs font-mono text-accent">2024 - Present | 2nd Year</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Specialized coursework covering network architecture, cryptography, operating systems internals, and security analysis.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats / Sidebar */}
          <div className="md:col-span-1 space-y-6">
            {/* Resume Callout */}
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm flex flex-col justify-center text-center">
              <FileText className="w-8 h-8 text-accent mx-auto mb-3" />
              <h3 className="text-md font-bold font-mono text-foreground mb-1">
                Recruiter Hub
              </h3>
              <p className="text-xs text-muted-foreground mb-4 font-sans">
                Download my latest CV and detailed technical profile.
              </p>
              <a
                href="/resume.pdf"
                download
                className="w-full py-2.5 rounded-lg bg-accent text-background font-mono text-sm font-semibold hover:bg-accent-hover theme-transition cursor-pointer block text-center"
                id="about-resume-download"
              >
                Download CV
              </a>
            </div>

            {/* Socials Connection */}
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
              <h3 className="text-sm font-bold font-mono text-foreground mb-4 flex items-center gap-2">
                <Contact className="w-4 h-4 text-accent" />
                <span>Connect</span>
              </h3>
              <div className="space-y-3 font-mono text-xs">
                {/* Github */}
                <a
                  href="https://github.com/Rohit-Saindane"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 text-muted-foreground hover:text-accent theme-transition cursor-pointer"
                  id="about-github-link"
                >
                  <svg
                    viewBox="0 0 24 24"
                    width="16"
                    height="16"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-4 h-4"
                  >
                    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                    <path d="M9 18c-4.51 2-5-2-7-2" />
                  </svg>
                  <span>@Rohit-Saindane</span>
                </a>

                {/* LinkedIn */}
                <a
                  href="https://www.linkedin.com/in/rohit-saindane/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 text-muted-foreground hover:text-accent theme-transition cursor-pointer"
                  id="about-linkedin-link"
                >
                  <svg
                    viewBox="0 0 24 24"
                    width="16"
                    height="16"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-4 h-4"
                  >
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                    <rect x="2" y="9" width="4" height="12" />
                    <circle cx="4" cy="4" r="2" />
                  </svg>
                  <span>@rohit-saindane</span>
                </a>

                {/* Email */}
                <a
                  href="mailto:rohitsaindane@example.com"
                  className="flex items-center gap-2.5 text-muted-foreground hover:text-accent theme-transition cursor-pointer"
                  id="about-email-link"
                >
                  <svg
                    viewBox="0 0 24 24"
                    width="16"
                    height="16"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-4 h-4"
                  >
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                  <span>rohitsaindane@example.com</span>
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* Tools & Environment */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm mb-12">
          <h2 className="text-xl font-bold font-mono text-foreground mb-6 flex items-center gap-2">
            <Server className="w-5 h-5 text-accent" />
            <span>Offensive Toolkit & Environment</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {tools.map((tool) => (
              <div
                key={tool.name}
                className="flex items-center justify-between p-3 rounded-lg bg-background border border-border hover:border-accent/20 theme-transition"
              >
                <div className="flex items-center gap-2.5">
                  <Code2 className="w-4 h-4 text-accent" />
                  <span className="text-sm font-bold font-mono text-foreground">{tool.name}</span>
                </div>
                <span className="text-[10px] font-mono text-muted-foreground uppercase bg-black/10 px-2 py-0.5 rounded border border-border">
                  {tool.category}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
