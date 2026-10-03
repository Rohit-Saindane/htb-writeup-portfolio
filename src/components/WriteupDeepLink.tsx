"use client";

import { useEffect, useCallback } from "react";

export default function WriteupDeepLink() {
  const performScrollAndHighlight = useCallback(() => {
    const rawHash = window.location.hash.replace("#", "");
    const urlParams = new URLSearchParams(window.location.search);
    const highlightTerm = urlParams.get("highlight") || "";

    if (!rawHash && !highlightTerm) return;

    const targetId = decodeURIComponent(rawHash.split("?")[0]).trim();
    const cleanId = targetId.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");

    let targetEl: HTMLElement | null = null;
    let highlightEl: HTMLElement | null = null;

    // 1. Direct ID lookup (exact and normalized hyphen)
    if (targetId) {
      targetEl =
        document.getElementById(targetId) ||
        document.getElementById(cleanId) ||
        document.getElementById(targetId.replace(/-+/g, "-"));
    }

    // 2. Fuzzy heading match if exact ID lookup missed
    if (!targetEl && cleanId) {
      const headings = document.querySelectorAll("h1, h2, h3, h4");
      for (const h of Array.from(headings)) {
        const hId = h.id ? h.id.toLowerCase().replace(/-+/g, "-") : "";
        const hText = (h.textContent || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");

        // Match normalized ID, sub-phrase, or textual content
        if (
          hId === cleanId ||
          hText === cleanId ||
          (cleanId.includes("privilege-escalation") && (hId.includes("privilege-escalation") || hId.includes("root-access"))) ||
          (cleanId.includes("initial-foothold") && hId.includes("initial-foothold")) ||
          (cleanId.includes("recon") && hId.includes("recon"))
        ) {
          targetEl = h as HTMLElement;
          break;
        }
      }
    }

    // 3. Highlight term search within content blocks
    if (highlightTerm) {
      const queryLower = highlightTerm.toLowerCase();
      if (targetEl) {
        let sibling = targetEl.nextElementSibling;
        let steps = 0;
        while (sibling && steps < 12) {
          if (sibling.textContent?.toLowerCase().includes(queryLower)) {
            highlightEl = sibling as HTMLElement;
            break;
          }
          sibling = sibling.nextElementSibling;
          steps++;
        }
      }

      if (!highlightEl) {
        const blocks = document.querySelectorAll(
          "article blockquote, blockquote, article h3, article p, article pre, h3, p"
        );
        for (const el of Array.from(blocks)) {
          if (el.textContent?.toLowerCase().includes(queryLower)) {
            highlightEl = el as HTMLElement;
            break;
          }
        }
      }
    }

    const finalEl = highlightEl || targetEl;

    if (finalEl) {
      // Calculate top position with fixed navbar offset (90px)
      const navOffset = 90;
      const elementPosition = finalEl.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navOffset;

      window.scrollTo({
        top: Math.max(0, offsetPosition),
        behavior: "smooth",
      });

      // Visual Cyber Accent Pulse
      finalEl.classList.add("cyber-target-highlight");
      const prevOutline = finalEl.style.outline;
      const prevShadow = finalEl.style.boxShadow;
      const prevBg = finalEl.style.backgroundColor;

      finalEl.style.transition = "all 0.35s ease";
      finalEl.style.outline = "2px solid #00e599";
      finalEl.style.boxShadow = "0 0 25px rgba(0, 229, 153, 0.4)";
      finalEl.style.backgroundColor = "rgba(0, 229, 153, 0.1)";

      setTimeout(() => {
        finalEl.style.outline = prevOutline;
        finalEl.style.boxShadow = prevShadow;
        finalEl.style.backgroundColor = prevBg;
        finalEl.classList.remove("cyber-target-highlight");
      }, 3500);
    }
  }, []);

  useEffect(() => {
    // Staggered triggers to ensure hydration, MDX rendering, and layout stabilization
    const t1 = setTimeout(performScrollAndHighlight, 120);
    const t2 = setTimeout(performScrollAndHighlight, 400);
    const t3 = setTimeout(performScrollAndHighlight, 900);
    const t4 = setTimeout(performScrollAndHighlight, 1500);

    const handleHashChange = () => {
      setTimeout(performScrollAndHighlight, 50);
    };

    window.addEventListener("hashchange", handleHashChange);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, [performScrollAndHighlight]);

  return null;
}
