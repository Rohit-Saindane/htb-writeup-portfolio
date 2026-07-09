import Link from "next/link";
import { ArrowRight, Terminal, Cpu, Radar, Shield, Zap, Code2, GitBranch, Activity, Key, Network } from "lucide-react";
import HtbStatsCard from "@/components/HtbStatsCard";
import WriteupCard from "@/components/WriteupCard";
import { getAllWriteups } from "@/lib/mdx";

const toolsList = [
  {
    name: "Nmap",
    category: "Network Recon",
    description: "Host discovery, port scanning, OS detection, and custom vulnerability scripting (NSE).",
    icon: Radar,
    colorClass: "text-blue-400 group-hover:text-blue-500",
    hoverBorder: "hover:border-blue-500/40"
  },
  {
    name: "Burp Suite",
    category: "Web App Proxy",
    description: "Proxy intercept, web request tampering, repeater, intruder, and automated scanner tests.",
    icon: Shield,
    colorClass: "text-orange-400 group-hover:text-orange-500",
    hoverBorder: "hover:border-orange-500/40"
  },
  {
    name: "Metasploit",
    category: "Exploitation",
    description: "Modular framework for writing, testing, and executing exploit payloads against targets.",
    icon: Zap,
    colorClass: "text-red-400 group-hover:text-red-500",
    hoverBorder: "hover:border-red-500/40"
  },
  {
    name: "Python & Bash",
    category: "Exploit Dev",
    description: "Writing custom scripts, automating payload delivery, and modifying proof-of-concepts.",
    icon: Code2,
    colorClass: "text-yellow-400 group-hover:text-yellow-500",
    hoverBorder: "hover:border-yellow-500/40"
  },
  {
    name: "BloodHound",
    category: "Active Directory",
    description: "Mapping complex trust relationships, domain paths, and privilege escalation routes.",
    icon: GitBranch,
    colorClass: "text-purple-400 group-hover:text-purple-500",
    hoverBorder: "hover:border-purple-500/40"
  },
  {
    name: "Wireshark",
    category: "Packet Analysis",
    description: "Deep inspection of network protocols, packet capturing, analysis, and forensics.",
    icon: Activity,
    colorClass: "text-cyan-400 group-hover:text-cyan-500",
    hoverBorder: "hover:border-cyan-500/40"
  },
  {
    name: "Mimikatz & Rubeus",
    category: "AD Exploitation",
    description: "LSASS dumping, ticket extraction, Pass-the-Hash (PtH), and Kerberos ticket attacks.",
    icon: Key,
    colorClass: "text-emerald-400 group-hover:text-emerald-500",
    hoverBorder: "hover:border-emerald-500/40"
  },
  {
    name: "Chisel & Proxychains",
    category: "Pivoting & Tunneling",
    description: "Local/remote port forwarding, SOCKS proxy tunneling, and traversing firewall barriers.",
    icon: Network,
    colorClass: "text-pink-400 group-hover:text-pink-500",
    hoverBorder: "hover:border-pink-500/40"
  },
  {
    name: "Hashcat & John",
    category: "Password Cracking",
    description: "GPU-accelerated hash cracking, custom rule file creation, and credential recovery.",
    icon: Cpu,
    colorClass: "text-rose-400 group-hover:text-rose-500",
    hoverBorder: "hover:border-rose-500/40"
  }
];

export default function Home() {
  const allWriteups = getAllWriteups();
  const featuredWriteups = allWriteups.slice(0, 3); // Get the 3 most recent writeups

  return (
    <div className="w-full min-h-screen bg-background text-foreground font-sans selection:bg-accent/30 selection:text-accent">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-16 sm:pt-28 sm:pb-20">
        {/* Subtle decorative grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.05)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          {/* Green terminal tagline */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-mono font-bold tracking-widest uppercase mb-6 animate-pulse">
            <Cpu className="w-3.5 h-3.5" />
            Security Research • Offensive Security
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-foreground font-mono mb-6 max-w-4xl mx-auto">
            Breaking things, then writing about how I did it
          </h1>

          {/* Description */}
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto mb-10 font-sans leading-relaxed">
            B.Tech CS student and HTB enthusiast. Documenting detailed walkthroughs for active labs, with a core focus on Active Directory exploits and web vulnerability chaining.
          </p>

          {/* Call-to-actions */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link
              href="/writeups"
              className="flex items-center gap-2 w-full sm:w-auto justify-center px-6 py-3 rounded-lg bg-accent text-background font-mono font-semibold hover:bg-accent-hover theme-transition cursor-pointer"
              id="hero-browse-btn"
            >
              <span>Browse writeups</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/about"
              className="flex items-center gap-2 w-full sm:w-auto justify-center px-6 py-3 rounded-lg bg-card border border-border text-foreground font-mono font-semibold hover:border-accent/40 hover:shadow-glow theme-transition cursor-pointer"
              id="hero-about-btn"
            >
              <span>Get in touch</span>
            </Link>
          </div>
          
          <div className="mt-8 text-xs font-mono text-muted-foreground">
            {allWriteups.length} machines owned · Rank #1,420 · Season 10 active
          </div>
        </div>
      </section>

      {/* HTB stats card section */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 mb-20 relative z-10">
        <HtbStatsCard />
      </section>

      {/* Featured writeups section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <div className="flex items-end justify-between mb-8">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-accent" />
            <h2 className="text-2xl font-bold font-mono text-foreground tracking-tight">
              Featured writeups
            </h2>
          </div>
          <Link
            href="/writeups"
            className="text-xs font-mono font-bold text-accent hover:text-accent-hover flex items-center gap-1.5 hover:underline underline-offset-4 theme-transition cursor-pointer"
            id="view-all-writeups-link"
          >
            <span>View all {allWriteups.length} writeups</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Writeups grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredWriteups.map((writeup, index) => (
            <WriteupCard key={writeup.slug} writeup={writeup} index={index} />
          ))}
        </div>
      </section>

      {/* Tools & Tech section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="text-center mb-10">
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-accent mb-2">
            Arsenal & Skills
          </h2>
          <p className="text-2xl font-bold font-mono text-foreground tracking-tight">
            Tools & Technologies
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {toolsList.map((tool) => {
            const Icon = tool.icon;
            return (
              <div
                key={tool.name}
                className={`flex flex-col gap-3 p-5 rounded-xl bg-card border border-border ${tool.hoverBorder} hover:scale-[1.02] hover:shadow-glow theme-transition duration-300 relative overflow-hidden group cursor-default`}
              >
                {/* Visual Accent glow line */}
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-accent/20 to-transparent group-hover:via-accent/60 theme-transition" />
                
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-black/10 dark:bg-white/5 border border-border group-hover:border-accent/30 theme-transition">
                    <Icon className={`w-5 h-5 ${tool.colorClass} theme-transition`} />
                  </div>
                  <div>
                    <h3 className="font-mono font-bold text-foreground group-hover:text-accent theme-transition text-base leading-tight">
                      {tool.name}
                    </h3>
                    <span className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground">
                      {tool.category}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground font-sans leading-relaxed mt-1">
                  {tool.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
