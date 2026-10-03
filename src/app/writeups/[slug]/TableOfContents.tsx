"use client";

import { useEffect, useState } from "react";
import { ArrowUp, AlignLeft } from "lucide-react";

interface HeadingItem {
  text: string;
  id: string;
  level?: number;
}

interface TableOfContentsProps {
  headings: HeadingItem[];
}

export default function TableOfContents({ headings }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>("");
  const [scrollProgress, setScrollProgress] = useState<number>(0);

  // Track live reading scroll percentage
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = Math.min(
          100,
          Math.max(0, Math.round((window.scrollY / totalHeight) * 100))
        );
        setScrollProgress(progress);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Track active heading based on viewport scroll position
  useEffect(() => {
    if (headings.length === 0) return;

    const handleScrollActive = () => {
      const offset = 140; // Account for navbar height + top margin
      const headingElements = headings
        .map((h) => ({ id: h.id, el: document.getElementById(h.id) }))
        .filter((h): h is { id: string; el: HTMLElement } => h.el !== null);

      if (headingElements.length === 0) return;

      let currentId = headingElements[0].id;
      for (const item of headingElements) {
        const top = item.el.getBoundingClientRect().top;
        if (top <= offset) {
          currentId = item.id;
        } else {
          break;
        }
      }

      setActiveId(currentId);
    };

    window.addEventListener("scroll", handleScrollActive, { passive: true });
    handleScrollActive();
    return () => window.removeEventListener("scroll", handleScrollActive);
  }, [headings]);

  const scrollToHeading = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
      setActiveId(id);
      window.history.pushState(null, "", `#${id}`);
    }
  };

  if (headings.length === 0) return null;

  return (
    <nav
      aria-label="Table of contents"
      className="sticky top-24 max-h-[calc(100vh-7rem)] flex flex-col rounded-xl border border-border bg-card/70 backdrop-blur-md p-4 text-foreground shadow-sm theme-transition select-none"
    >
      {/* 1. Header with Title & Live Progress */}
      <div className="pb-3 border-b border-border/70 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono font-semibold tracking-wider text-foreground/90 uppercase">
            <AlignLeft className="w-3.5 h-3.5 text-accent" />
            <span>On This Page</span>
          </div>
          <span className="text-[11px] font-mono text-muted-foreground">
            {scrollProgress}%
          </span>
        </div>

        {/* Minimal progress bar */}
        <div className="w-full h-1 bg-border/60 rounded-full overflow-hidden">
          <div
            className="h-full bg-accent transition-all duration-150 rounded-full"
            style={{ width: `${scrollProgress}%` }}
          />
        </div>
      </div>

      {/* 2. Clean, Minimal Headings List */}
      <div className="flex-1 overflow-y-auto pr-1 py-2 my-1 space-y-0.5 scrollbar-thin">
        {headings.map((heading) => {
          const isActive = activeId === heading.id;
          const isH3 = heading.level === 3;

          if (!isH3) {
            // Level 2 Heading (Major Section / Step)
            return (
              <div key={heading.id} className="pt-2 first:pt-1">
                <button
                  type="button"
                  onClick={() => scrollToHeading(heading.id)}
                  className={`w-full text-left group flex items-baseline gap-2 px-2 py-1.5 rounded-md text-xs font-mono transition-colors duration-150 cursor-pointer ${
                    isActive
                      ? "text-accent bg-accent/10 font-semibold"
                      : "text-foreground/80 hover:text-foreground hover:bg-muted/10 font-medium"
                  }`}
                >
                  <span
                    className={`text-[10px] select-none transition-colors ${
                      isActive
                        ? "text-accent"
                        : "text-muted-foreground/60 group-hover:text-muted-foreground"
                    }`}
                  >
                    ›
                  </span>
                  <span className="leading-snug break-words flex-1">
                    {heading.text}
                  </span>
                </button>
              </div>
            );
          }

          // Level 3 Heading (Subsection / Specific Attack Technique)
          return (
            <div
              key={heading.id}
              className={`ml-3.5 pl-3 py-0.5 border-l transition-colors duration-150 ${
                isActive ? "border-accent" : "border-border/60 hover:border-border"
              }`}
            >
              <button
                type="button"
                onClick={() => scrollToHeading(heading.id)}
                className={`w-full text-left block text-[12px] font-sans leading-snug transition-colors duration-150 cursor-pointer break-words ${
                  isActive
                    ? "text-accent font-medium"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {heading.text}
              </button>
            </div>
          );
        })}
      </div>

      {/* 3. Footer Stats & Back to Top */}
      <div className="pt-3 border-t border-border/70 flex items-center justify-between text-[11px] font-mono text-muted-foreground">
        <span>{headings.length} sections</span>

        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="flex items-center gap-1 text-[11px] hover:text-accent transition-colors cursor-pointer py-0.5 px-1.5 rounded hover:bg-muted/10"
        >
          <ArrowUp className="w-3 h-3" />
          <span>Top</span>
        </button>
      </div>
    </nav>
  );
}
