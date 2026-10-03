import Link from "next/link";
import { ArrowRight, Terminal, Shield, Cpu } from "lucide-react";
import HtbStatsCard from "@/components/HtbStatsCard";
import WriteupCard from "@/components/WriteupCard";
import ToolCard from "@/components/ToolCard";
import HeroHeadline from "@/components/HeroHeadline";
import { getAllWriteups } from "@/lib/mdx";
import { toolsData } from "@/lib/toolsData";

export default function Home() {
  const allWriteups = getAllWriteups();
  // User curated Homepage Hero writeups: DarkZero Returns, Bedside, and Nimbus
  const heroSlugs = ["darkzeroreturns", "bedside", "nimbus"];
  const featuredWriteups = heroSlugs
    .map((slug) => allWriteups.find((w) => w.slug === slug))
    .filter((w): w is NonNullable<typeof w> => Boolean(w));

  if (featuredWriteups.length < 3) {
    featuredWriteups.push(
      ...allWriteups
        .filter((w) => !featuredWriteups.some((f) => f.slug === w.slug))
        .slice(0, 3 - featuredWriteups.length)
    );
  }

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

          {/* Dynamic Wave-Lift Interactive Headline */}
          <HeroHeadline text="Breaking things, then writing about how I did it" />

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
          
          {/* Cyber Telemetry Status Bar */}
          <div className="mt-12 inline-flex flex-wrap items-center justify-center gap-3 sm:gap-6 px-5 py-2.5 rounded-xl bg-card/80 border border-border backdrop-blur-md shadow-glow theme-transition text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              <span className="text-emerald-400 font-bold tracking-wider uppercase">Active Security Operations</span>
            </div>
            <span className="hidden sm:inline text-border font-light">|</span>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Terminal className="w-4 h-4 text-purple-400" />
              <span>Root Shells: <strong className="text-foreground font-semibold">{allWriteups.length} Labs</strong></span>
            </div>
            <span className="hidden sm:inline text-border font-light">|</span>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Shield className="w-4 h-4 text-cyan-400" />
              <span>Specialty: <strong className="text-foreground font-semibold">Active Directory & Web Chaining</strong></span>
            </div>
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
          {toolsData.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      </section>
    </div>
  );
}
