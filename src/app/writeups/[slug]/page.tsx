import fs from "fs";
import path from "path";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Monitor, Calendar, Award, ArrowRight } from "lucide-react";
import MdxContent from "@/components/MdxContent";
import TableOfContents from "./TableOfContents";
import { getWriteupBySlug, getAllWriteups } from "@/lib/mdx";

interface PageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: PageProps) {
  const writeup = getWriteupBySlug(params.slug);
  if (!writeup) return {};

  return {
    title: `${writeup.metadata.title} HTB Writeup | Rohit Saindane`,
    description: writeup.metadata.summary,
  };
}

export default function WriteupDetailPage({ params }: PageProps) {
  const writeup = getWriteupBySlug(params.slug);
  if (!writeup) {
    notFound();
  }

  const { metadata, content } = writeup;

  // Check if a custom machine logo exists locally
  const logoUrl = `/images/machines/${metadata.slug}.png`;
  const logoAbsolutePath = path.join(process.cwd(), "public", "images", "machines", `${metadata.slug}.png`);
  const hasLogo = fs.existsSync(logoAbsolutePath);

  // Parse headings (##) for Table of Contents
  const headings = content
    .split("\n")
    .filter((line) => line.startsWith("## "))
    .map((line) => {
      const text = line.substring(3).trim();
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "") || "";
      return { text, id };
    });

  // Calculate Previous and Next writeups in list
  const allWriteups = getAllWriteups();
  const currentIndex = allWriteups.findIndex((w) => w.slug === metadata.slug);
  const prevWriteup = currentIndex > 0 ? allWriteups[currentIndex - 1] : null;
  const nextWriteup = currentIndex < allWriteups.length - 1 ? allWriteups[currentIndex + 1] : null;

  // OS Style Badge
  const isWindows = metadata.os === "windows";

  // Difficulty CSS Colors
  const difficultyColors = {
    easy: "bg-green-500/10 text-green-500 border-green-500/20",
    medium: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    hard: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    insane: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  };
  const difficultyColor = difficultyColors[metadata.difficulty] || difficultyColors.easy;

  return (
    <div className="w-full min-h-screen bg-background py-12 text-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back Link Header */}
        <div className="flex items-center justify-between border-b border-border/80 pb-6 mb-8">
          <Link
            href="/writeups"
            className="inline-flex items-center gap-2 text-sm font-mono text-muted-foreground hover:text-accent theme-transition cursor-pointer"
            id="back-to-writeups-link"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>All writeups</span>
          </Link>
          
          <a
            href={`https://github.com/Rohit-Saindane/HTB-Writeups/blob/main/${metadata.githubPath}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-mono font-bold text-muted-foreground hover:text-accent flex items-center gap-1.5 theme-transition cursor-pointer"
            id="detail-github-link"
          >
            {/* Inline SVG GitHub */}
            <svg
              viewBox="0 0 24 24"
              width="20"
              height="20"
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
            <span className="hidden sm:inline">GH</span>
          </a>
        </div>

        {/* Writeup Title Block */}
        <div className="mb-10">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className={`inline-flex items-center gap-1 text-xs font-mono font-bold tracking-wider px-2.5 py-0.5 rounded border ${
              isWindows 
                ? "bg-blue-500/10 text-blue-400 border-blue-500/20" 
                : "bg-orange-500/10 text-orange-400 border-orange-500/20"
            }`}>
              <Monitor className="w-3.5 h-3.5" />
              {metadata.os.toUpperCase()}
            </span>
            <span className={`inline-flex items-center text-xs font-mono font-bold tracking-wider px-2.5 py-0.5 rounded border uppercase ${difficultyColor}`}>
              {metadata.difficulty}
            </span>
            <span className="inline-flex items-center text-xs font-mono font-bold tracking-wider px-2.5 py-0.5 rounded border bg-card border-border text-muted-foreground">
              {metadata.season}
            </span>
          </div>

          <div className="flex items-center gap-4 mb-6">
            {hasLogo ? (
              <img
                src={logoUrl}
                alt={`${metadata.title} logo`}
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-contain flex-shrink-0"
              />
            ) : (
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border border-border bg-card flex items-center justify-center text-accent shadow-sm flex-shrink-0">
                <Monitor className="w-7 h-7 sm:w-8 sm:h-8" />
              </div>
            )}
            <h1 className="text-3xl sm:text-5xl font-bold font-mono text-foreground tracking-tight">
              {metadata.title}
            </h1>
          </div>

          <p className="text-base sm:text-lg text-muted-foreground font-sans leading-relaxed max-w-4xl mb-6">
            {metadata.summary}
          </p>

          <div className="flex flex-wrap gap-4 text-xs font-mono text-muted-foreground border-t border-border pt-4">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-accent" />
              {metadata.date}
            </span>

            <span className="flex items-center gap-1.5">
              <Award className="w-4 h-4 text-accent" />
              {metadata.pointsAwarded} points
            </span>
            {metadata.machineIP && (
              <span className="font-mono text-accent">
                Target IP: {metadata.machineIP}
              </span>
            )}
          </div>
        </div>

        {/* 2-Column Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          {/* Main MDX Content Column */}
          <div className="lg:col-span-3">
            <div className="mb-12">
              <MdxContent source={content} />
            </div>

            {/* Tags section at the bottom */}
            <div className="flex flex-wrap gap-1.5 mb-12">
              {metadata.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs font-mono px-3 py-1 rounded bg-black/20 border border-border text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Prev/Next Navigation Box */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-border/80 pt-8 mb-10">
              {/* Previous Link Box */}
              {prevWriteup ? (
                <Link
                  href={`/writeups/${prevWriteup.slug}`}
                  className="p-5 rounded-xl border border-border bg-card hover:border-accent/30 hover:shadow-glow theme-transition text-left flex flex-col justify-between cursor-pointer"
                  id={`prev-link-${prevWriteup.slug}`}
                >
                  <div>
                    <span className="text-[10px] font-mono font-bold tracking-wider text-muted-foreground uppercase flex items-center gap-1.5 mb-2">
                      <ArrowLeft className="w-3.5 h-3.5" />
                      Previous Machine
                    </span>
                    <h4 className="text-lg font-bold font-mono text-foreground">
                      {prevWriteup.title}
                    </h4>
                  </div>
                  <span className="text-xs font-mono text-muted-foreground mt-4">
                    {prevWriteup.season}
                  </span>
                </Link>
              ) : (
                <div className="hidden sm:block" />
              )}

              {/* Next Link Box */}
              {nextWriteup ? (
                <Link
                  href={`/writeups/${nextWriteup.slug}`}
                  className="p-5 rounded-xl border border-border bg-card hover:border-accent/30 hover:shadow-glow theme-transition text-right flex flex-col justify-between items-end cursor-pointer"
                  id={`next-link-${nextWriteup.slug}`}
                >
                  <div>
                    <span className="text-[10px] font-mono font-bold tracking-wider text-muted-foreground uppercase flex items-center gap-1.5 mb-2 justify-end">
                      Next Machine
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                    <h4 className="text-lg font-bold font-mono text-foreground">
                      {nextWriteup.title}
                    </h4>
                  </div>
                  <span className="text-xs font-mono text-muted-foreground mt-4">
                    {nextWriteup.season}
                  </span>
                </Link>
              ) : (
                <div className="hidden sm:block" />
              )}
            </div>
          </div>

          {/* Right Sidebar Table Of Contents Column */}
          <div className="hidden lg:block lg:col-span-1">
            <TableOfContents headings={headings} />
          </div>
        </div>

      </div>
    </div>
  );
}
