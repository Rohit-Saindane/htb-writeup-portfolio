"use client";

import { useEffect, useState } from "react";

interface HeadingItem {
  text: string;
  id: string;
}

interface TableOfContentsProps {
  headings: HeadingItem[];
}

export default function TableOfContents({ headings }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Find entries intersecting the screen
        const visibleEntry = entries.find((entry) => entry.isIntersecting);
        if (visibleEntry) {
          setActiveId(visibleEntry.target.id);
        }
      },
      {
        rootMargin: "-20% 0px -60% 0px", // Trigger active when header is in the upper part of the viewport
      }
    );

    headings.forEach((heading) => {
      const el = document.getElementById(heading.id);
      if (el) observer.observe(el);
    });

    return () => {
      headings.forEach((heading) => {
        const el = document.getElementById(heading.id);
        if (el) observer.unobserve(el);
      });
    };
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <div className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto">
      <h4 className="text-xs font-mono font-bold tracking-wider text-muted-foreground uppercase mb-4">
        On This Page
      </h4>
      <ul className="space-y-3 border-l border-border pl-0">
        {headings.map((heading) => {
          const isActive = activeId === heading.id;
          return (
            <li key={heading.id} className="relative pl-4">
              {/* Highlight active green vertical border indicator */}
              {isActive && (
                <span className="absolute left-[-1px] top-0 bottom-0 w-[2px] bg-accent shadow-glow" />
              )}
              <a
                href={`#${heading.id}`}
                className={`block text-sm font-sans theme-transition hover:text-accent ${
                  isActive
                    ? "text-accent font-semibold"
                    : "text-muted-foreground"
                }`}
              >
                {heading.text}
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
