"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";

interface HeroHeadlineProps {
  text: string;
  className?: string;
}

export default function HeroHeadline({ text, className = "" }: HeroHeadlineProps) {
  const containerRef = useRef<HTMLHeadingElement>(null);
  const letterRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Check reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleChange);
    } else {
      mediaQuery.addListener(handleChange);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener("change", handleChange);
      } else {
        mediaQuery.removeListener(handleChange);
      }
    };
  }, []);

  const words = text.split(" ");
  let globalCharIndex = 0;

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLHeadingElement>) => {
      if (prefersReducedMotion || !containerRef.current) return;

      const cursorX = e.clientX;
      const cursorY = e.clientY;
      const RADIUS = 75; // 75px radius wave falloff

      letterRefs.current.forEach((span) => {
        if (!span) return;
        const rect = span.getBoundingClientRect();
        const charCenterX = rect.left + rect.width / 2;
        const charCenterY = rect.top + rect.height / 2;

        const distanceX = Math.abs(cursorX - charCenterX);
        const distanceY = Math.abs(cursorY - charCenterY);
        const distance = Math.hypot(distanceX, distanceY);

        if (distance < RADIUS) {
          // Smooth cosine falloff
          const ratio = Math.cos((distance / RADIUS) * (Math.PI / 2));
          const scale = 1 + ratio * 0.35; // up to 1.35x scale
          const translateY = -ratio * 10; // up to -10px lift

          span.style.transform = `translateY(${translateY}px) scale(${scale})`;
          span.style.color = ratio > 0.3 ? "var(--accent, #22c55e)" : "";
          span.style.zIndex = "10";
        } else {
          span.style.transform = "translateY(0px) scale(1)";
          span.style.color = "";
          span.style.zIndex = "1";
        }
      });
    },
    [prefersReducedMotion]
  );

  const handleMouseLeave = useCallback(() => {
    if (prefersReducedMotion) return;
    letterRefs.current.forEach((span) => {
      if (!span) return;
      span.style.transform = "translateY(0px) scale(1)";
      span.style.color = "";
      span.style.zIndex = "1";
    });
  }, [prefersReducedMotion]);

  return (
    <h1
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`text-4xl sm:text-6xl font-bold tracking-tight text-foreground font-mono mb-6 max-w-4xl mx-auto py-2 leading-tight select-none cursor-default ${className}`}
    >
      {words.map((word, wordIdx) => {
        const letters = word.split("");
        return (
          <span
            key={wordIdx}
            className="inline-block whitespace-nowrap mr-[0.3em] last:mr-0"
          >
            {letters.map((char, charIdx) => {
              const refIndex = globalCharIndex++;
              return (
                <span
                  key={charIdx}
                  ref={(el) => {
                    letterRefs.current[refIndex] = el;
                  }}
                  className="inline-block transition-transform duration-75 ease-out origin-bottom text-foreground hover:text-accent relative"
                  style={{
                    willChange: "transform",
                    transformStyle: "preserve-3d",
                  }}
                >
                  {char}
                </span>
              );
            })}
          </span>
        );
      })}
    </h1>
  );
}
