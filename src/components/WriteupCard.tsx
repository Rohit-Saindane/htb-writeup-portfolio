"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Monitor, Award } from "lucide-react";
import { WriteupMetadata } from "@/lib/mdx";

interface WriteupCardProps {
  writeup: WriteupMetadata;
  index: number;
}

export default function WriteupCard({ writeup, index }: WriteupCardProps) {
  // Map OS to colors and labels
  const isWindows = writeup.os === "windows";
  
  // Map difficulty to CSS colors
  const difficultyColors = {
    easy: "bg-green-500/10 text-green-500 border-green-500/20",
    medium: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    hard: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    insane: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  };

  const difficultyColor = difficultyColors[writeup.difficulty] || difficultyColors.easy;

  const accentGradients = {
    easy: "from-green-500/20 to-transparent",
    medium: "from-amber-500/20 to-transparent",
    hard: "from-orange-500/20 to-transparent",
    insane: "from-purple-500/20 to-transparent",
  };
  const accentGradient = accentGradients[writeup.difficulty] || accentGradients.easy;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.3) }}
      className="group relative bg-card rounded-xl border border-border hover:border-accent/40 shadow-sm hover:shadow-glow theme-transition overflow-hidden flex flex-col h-full cursor-pointer"
      id={`writeup-card-${writeup.slug}`}
    >
      {/* Visual Accent glow line */}
      <div className={`absolute top-0 left-0 w-full h-[2.5px] bg-gradient-to-r ${accentGradient} group-hover:from-accent group-hover:to-accent/30 theme-transition duration-300`} />

      <Link href={`/writeups/${writeup.slug}`} className="flex flex-col h-full p-5 justify-between">
        <div>
          {/* Card Top: OS & Difficulty Badges */}
          <div className="flex items-center justify-between gap-2 mb-4">
            <span className={`inline-flex items-center gap-1 text-[11px] font-mono font-bold tracking-wider px-2 py-0.5 rounded border ${
              isWindows 
                ? "bg-blue-500/10 text-blue-400 border-blue-500/20" 
                : "bg-orange-500/10 text-orange-400 border-orange-500/20"
            }`}>
              <Monitor className="w-3.5 h-3.5" />
              {writeup.os.toUpperCase()}
            </span>
            <span className={`inline-flex items-center text-[11px] font-mono font-bold tracking-wider px-2.5 py-0.5 rounded border uppercase ${difficultyColor}`}>
              {writeup.difficulty}
            </span>
          </div>

          {/* Title with Logo */}
          <div className="flex items-center gap-2.5 mb-2.5">
            <div className="w-10 h-10 rounded-full border border-border/80 flex items-center justify-center bg-black/10 dark:bg-white/5 p-1 group-hover:border-accent/30 theme-transition overflow-hidden flex-shrink-0">
              <img
                src={`/images/machines/${writeup.slug}.png`}
                alt={`${writeup.title} logo`}
                className="w-full h-full rounded-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
            <h3 className="text-lg font-bold font-mono text-foreground group-hover:text-accent theme-transition">
              {writeup.title}
            </h3>
          </div>

          {/* Summary Text */}
          <p className="text-sm text-muted-foreground line-clamp-3 mb-6 font-sans">
            {writeup.summary}
          </p>
        </div>

        <div>
          {/* Tags / Pills */}
          <div className="flex flex-wrap gap-1.5 mb-6">
            {writeup.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/5 dark:bg-white/5 border border-border text-muted-foreground"
              >
                {tag}
              </span>
            ))}
            {writeup.tags.length > 3 && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/5 dark:bg-white/5 border border-border text-muted-foreground">
                +{writeup.tags.length - 3} more
              </span>
            )}
          </div>

          {/* Card Footer Info */}
          <div className="pt-4 border-t border-border flex items-center justify-between text-[11px] font-mono text-muted-foreground">
            <span className="truncate max-w-[120px]">{writeup.season}</span>
            <span className="hidden sm:inline opacity-60">{writeup.date}</span>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-accent font-bold">
                <Award className="w-3.5 h-3.5" />
                {writeup.pointsAwarded} pts
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
