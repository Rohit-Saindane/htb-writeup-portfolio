"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X } from "lucide-react";
import { CyberConceptCard } from "@/lib/gemini";
import { SearchResultItem } from "@/app/api/search/route";
import { openAssistantWithPrompt } from "@/lib/cyberEvents";

const POPULAR_TECHNIQUES = [
  "Active Directory",
  "SUID Privilege Escalation",
  "SQL Injection",
  "Kerberoasting",
  "EternalBlue",
  "LinPEAS",
  "Buffer Overflow",
];

export default function SearchModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [writeups, setWriteups] = useState<SearchResultItem[]>([]);
  const [cyberConcept, setCyberConcept] = useState<CyberConceptCard | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Listen for Cmd+K / Ctrl+K and global open-cyber-search event
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    const handleCustomOpen = (e: Event) => {
      const customEvent = e as CustomEvent<{ query?: string }>;
      setIsOpen(true);
      if (customEvent.detail?.query) {
        setQuery(customEvent.detail.query);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("open-cyber-search", handleCustomOpen);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("open-cyber-search", handleCustomOpen);
    };
  }, [isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } else {
      setQuery("");
      setWriteups([]);
      setCyberConcept(null);
    }
  }, [isOpen]);

  // Debounced search with AbortController to prevent race conditions
  useEffect(() => {
    if (!query.trim() || query.trim().length < 2) {
      setWriteups([]);
      setCyberConcept(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const controller = new AbortController();

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`, {
          signal: controller.signal,
        });
        if (res.ok) {
          const data = await res.json();
          setWriteups(data.writeups || []);
          setCyberConcept(data.cyberConcept || null);
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name !== "AbortError") {
          console.error("Search fetch error:", err);
        }
      } finally {
        setLoading(false);
      }
    }, 280);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  const handleSelectWriteup = (slug: string, headingId?: string) => {
    setIsOpen(false);
    const url = headingId ? `/writeups/${slug}#${headingId}` : `/writeups/${slug}`;
    router.push(url);
  };

  const handleAskAssistant = (concept: CyberConceptCard) => {
    setIsOpen(false);
    if (concept.isOffTopic) {
      openAssistantWithPrompt(
        `I was searching for "${concept.keyword}" in the CVE database. Elliot, what machine or vulnerability in Rohit's portfolio should I analyze instead?`,
        "general"
      );
    } else {
      openAssistantWithPrompt(
        `Explain the technical exploit mechanics and defensive mitigation for ${concept.title} (${concept.keyword}). How would I safely practice this in an authorized lab?`,
        "explain_attack"
      );
    }
  };

  const getSeverityDot = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case "critical":
        return "bg-rose-500";
      case "high":
        return "bg-orange-500";
      case "medium":
        return "bg-amber-500";
      default:
        return "bg-blue-500";
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-12 sm:pt-20 px-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/40 dark:bg-[#07090b]/80 backdrop-blur-sm"
          />

          {/* Modal Container: Light/Dark Responsive CVE Database */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -6 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            className="relative w-full max-w-[680px] max-h-[85vh] flex flex-col bg-card dark:bg-[#0b0d10] border border-border dark:border-[#20242b] rounded-xl shadow-2xl overflow-hidden text-foreground dark:text-[#e4e7eb] z-10 theme-transition"
            id="cve-search-modal"
          >
            {/* Top Linear Scanning Beam (Active when loading) */}
            {loading && (
              <div className="absolute top-0 left-0 right-0 h-[2px] overflow-hidden z-20">
                <motion.div
                  initial={{ x: "-100%" }}
                  animate={{ x: "100%" }}
                  transition={{ repeat: Infinity, duration: 1.1, ease: "easeInOut" }}
                  className="w-1/2 h-full bg-gradient-to-r from-transparent via-emerald-500 dark:via-[#00e599] to-transparent"
                />
              </div>
            )}

            {/* Header & Search Input Box */}
            <div className="p-5 pb-4 border-b border-border dark:border-[#20242b] bg-card dark:bg-[#0b0d10]">
              <div className="relative flex items-center">
                <Search className="absolute left-3.5 w-4 h-4 text-muted-foreground dark:text-[#6b7684] pointer-events-none" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search writeups, exploits, CVEs, or tools…"
                  className="w-full bg-background dark:bg-[#111418] border border-border dark:border-[#20242b] rounded-lg py-[13px] pl-10 pr-20 text-[14px] text-foreground dark:text-[#e4e7eb] placeholder-muted-foreground dark:placeholder-[#6b7684] focus:outline-none focus:border-accent dark:focus:border-[#3b82f6]/70 transition-colors font-sans shadow-sm"
                  id="cve-search-input"
                />
                <div className="absolute right-3 flex items-center gap-2">
                  {query && (
                    <button
                      onClick={() => setQuery("")}
                      className="p-1 text-muted-foreground hover:text-foreground dark:text-[#6b7684] dark:hover:text-[#e4e7eb] transition-colors cursor-pointer"
                      aria-label="Clear search"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                  <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground dark:text-[#6b7684] border border-border dark:border-[#20242b] rounded bg-muted/40 dark:bg-[#0b0d10]">
                    ESC
                  </kbd>
                </div>
              </div>

              {/* Real-time scan indicator label */}
              {loading && (
                <div className="flex items-center gap-2 mt-2.5 font-mono text-[11px] text-muted-foreground dark:text-[#6b7684]">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent dark:bg-[#00e599] animate-pulse" />
                  <span>querying cve records &amp; machine archives for &ldquo;{query}&rdquo;…</span>
                </div>
              )}
            </div>

            {/* Main Scrollable Content Area */}
            <div className="overflow-y-auto p-6 space-y-7 scrollbar-thin">
              {/* STATE 1: Empty / Initial State */}
              {!query.trim() && (
                <div>
                  <div className="font-mono text-[11px] text-muted-foreground dark:text-[#6b7684] mb-3.5">
                    state — empty
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {POPULAR_TECHNIQUES.map((tech) => (
                      <button
                        key={tech}
                        onClick={() => setQuery(tech)}
                        className="text-[12px] text-muted-foreground hover:text-foreground dark:text-[#8a93a1] dark:hover:text-[#e4e7eb] border border-border dark:border-[#20242b] hover:border-accent/40 rounded-md py-1 px-2.5 font-mono bg-muted/30 dark:bg-[#111418] transition-colors cursor-pointer"
                      >
                        {tech}
                      </button>
                    ))}
                  </div>
                  <div className="text-[12px] text-muted-foreground dark:text-[#6b7684] mt-5 leading-relaxed">
                    Type a technique or CVE to pull a summary and any writeups that cover it.
                  </div>
                </div>
              )}

              {/* STATE 2 & 3 & 4: Results, Off-Topic, or No Match */}
              {!loading && query.trim().length >= 2 && (
                <>
                  {/* Case A: Off-Topic Notice (Only when no portfolio writeups matched) */}
                  {cyberConcept?.isOffTopic && writeups.length === 0 && (
                    <div>
                      <div className="font-mono text-[11px] text-muted-foreground dark:text-[#6b7684] mb-3.5">
                        state — off-topic query
                      </div>
                      <div className="border border-border dark:border-[#20242b] rounded-lg p-[22px] bg-muted/30 dark:bg-[#111418] space-y-2.5">
                        <h3 className="text-[16px] font-semibold text-foreground dark:text-[#e4e7eb] m-0">
                          No match for &ldquo;{query}&rdquo;
                        </h3>
                        <p className="text-[13px] text-muted-foreground dark:text-[#8a93a1] leading-[1.6] m-0">
                          {cyberConcept.definition ? (
                            <>
                              {cyberConcept.definition} — not a term used in this portfolio&apos;s writeups.
                            </>
                          ) : (
                            <>
                              &ldquo;{query}&rdquo; is not a cybersecurity term or technique covered in this portfolio.
                            </>
                          )}{" "}
                          Try a technique instead: Active Directory, Petitpotam, ESC17, SQL Injection, Buffer Overflow.
                        </p>
                        <div className="flex flex-wrap gap-2 pt-2">
                          {["Active Directory", "PetitPotam", "ESC17", "SQL Injection", "Buffer Overflow"].map((item) => (
                            <button
                              key={item}
                              onClick={() => setQuery(item)}
                              className="text-[11px] font-mono text-muted-foreground hover:text-foreground dark:text-[#8a93a1] dark:hover:text-[#e4e7eb] border border-border dark:border-[#20242b] hover:border-accent rounded py-0.5 px-2 bg-card dark:bg-[#0b0d10] transition-colors cursor-pointer"
                            >
                              {item}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Case B: Valid CVE Record Found */}
                  {cyberConcept && !cyberConcept.isOffTopic && (
                    <div>
                      <div className="font-mono text-[11px] text-muted-foreground dark:text-[#6b7684] mb-3.5">
                        state — result
                      </div>

                      {/* CVE Record Panel */}
                      <div className="bg-muted/30 dark:bg-[#111418] border border-border dark:border-[#20242b] rounded-lg p-6 shadow-sm">
                        {/* Record ID / Category */}
                        <div className="font-mono text-[11px] text-muted-foreground dark:text-[#6b7684] mb-1.5">
                          {cyberConcept.cveOrStandard && cyberConcept.cveOrStandard !== "N/A"
                            ? `${cyberConcept.cveOrStandard} · ${cyberConcept.category}`
                            : cyberConcept.category}
                        </div>

                        {/* Title */}
                        <h2 className="text-[20px] font-semibold text-foreground dark:text-[#e4e7eb] m-0 mb-2.5">
                          {cyberConcept.title}
                        </h2>

                        {/* Severity Row */}
                        <div className="flex items-center gap-2 text-[12px] text-muted-foreground dark:text-[#8a93a1] mb-4">
                          <span
                            className={`w-2 h-2 rounded-[2px] inline-block flex-shrink-0 ${getSeverityDot(
                              cyberConcept.severity
                            )}`}
                          />
                          <span>
                            {cyberConcept.severity} severity · {cyberConcept.category}
                          </span>
                        </div>

                        {/* Definition */}
                        <p className="text-[14px] leading-[1.65] text-foreground/90 dark:text-[#e4e7eb] m-0 mb-[22px]">
                          {cyberConcept.definition}
                        </p>

                        {/* Structured Field Grid */}
                        <dl className="grid grid-cols-1 sm:grid-cols-[120px_1fr] gap-x-4 gap-y-3.5 text-[13px] m-0">
                          {cyberConcept.attackMechanics && (
                            <>
                              <dt className="text-muted-foreground dark:text-[#6b7684] font-mono text-[11px] sm:pt-0.5">
                                Attack vector
                              </dt>
                              <dd className="m-0 text-foreground dark:text-[#e4e7eb] leading-[1.6]">
                                {cyberConcept.attackMechanics}
                              </dd>
                            </>
                          )}

                          {cyberConcept.defenseMitigation && (
                            <>
                              <dt className="text-muted-foreground dark:text-[#6b7684] font-mono text-[11px] sm:pt-0.5">
                                Mitigation
                              </dt>
                              <dd className="m-0 text-foreground dark:text-[#e4e7eb] leading-[1.6]">
                                {cyberConcept.defenseMitigation}
                              </dd>
                            </>
                          )}

                          {cyberConcept.labPractice && (
                            <>
                              <dt className="text-muted-foreground dark:text-[#6b7684] font-mono text-[11px] sm:pt-0.5">
                                Practice on
                              </dt>
                              <dd className="m-0 text-foreground dark:text-[#e4e7eb] leading-[1.6]">
                                {cyberConcept.labPractice}
                              </dd>
                            </>
                          )}

                          {cyberConcept.tags && cyberConcept.tags.length > 0 && (
                            <>
                              <dt className="text-muted-foreground dark:text-[#6b7684] font-mono text-[11px] sm:pt-0.5">
                                Tags
                              </dt>
                              <dd className="m-0 text-muted-foreground dark:text-[#a9b4c2] font-mono text-[12px] leading-[1.6]">
                                {cyberConcept.tags.join(", ")}
                              </dd>
                            </>
                          )}
                        </dl>

                        {/* Divider */}
                        <div className="border-t border-border dark:border-[#20242b] my-[22px]" />

                        {/* Reference Line */}
                        <div className="text-[13px] text-muted-foreground dark:text-[#8a93a1] flex flex-wrap items-center justify-between gap-3">
                          <div>
                            {writeups.length > 0 ? (
                              <>
                                {writeups.length} writeup{writeups.length > 1 ? "s" : ""} reference this technique —{" "}
                                <button
                                  type="button"
                                  onClick={() => {
                                    document
                                      .getElementById("matching-writeups-list")
                                      ?.scrollIntoView({ behavior: "smooth" });
                                  }}
                                  className="text-accent dark:text-[#5b8def] hover:underline cursor-pointer"
                                >
                                  jump to list
                                </button>
                              </>
                            ) : (
                              <span>No writeups in this portfolio currently reference this technique.</span>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => handleAskAssistant(cyberConcept)}
                            className="text-[12px] font-mono text-accent dark:text-[#5b8def] hover:underline transition-colors cursor-pointer"
                          >
                            Deconstruct with Elliot →
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Case C: Referenced Writeups List */}
                  {writeups.length > 0 && (
                    <div id="matching-writeups-list" className="scroll-mt-4">
                      <div className="text-[13px] text-muted-foreground dark:text-[#8a93a1] mb-3.5">
                        Referenced in {writeups.length} writeup{writeups.length > 1 ? "s" : ""}
                      </div>

                      <div className="border-b border-border dark:border-[#20242b]">
                        {writeups.map((item) => (
                          <div
                            key={item.slug + (item.headingId || "")}
                            onClick={() => handleSelectWriteup(item.slug, item.headingId)}
                            className="flex justify-between items-baseline py-3.5 border-t border-border dark:border-[#20242b] group cursor-pointer hover:bg-muted/40 dark:hover:bg-[#111418]/60 px-2.5 -mx-2.5 rounded-lg transition-colors"
                          >
                            <div className="pr-4 flex-1">
                              <div>
                                <b className="text-[14px] font-medium text-foreground dark:text-[#e4e7eb] group-hover:text-accent dark:group-hover:text-[#00e599] transition-colors">
                                  {item.title}
                                </b>
                                <span className="font-mono text-[11px] text-muted-foreground dark:text-[#6b7684] ml-2.5">
                                  {item.os.toUpperCase()} · {item.difficulty.toUpperCase()}
                                </span>
                              </div>

                              {/* Deep-link section indicator if matched */}
                              {item.headingText && (
                                <div className="font-mono text-[11px] text-accent dark:text-[#00e599]/90 mt-1 flex items-center gap-1.5">
                                  <span className="w-1.5 h-1.5 rounded-sm bg-accent dark:bg-[#00e599]" />
                                  <span>Section: {item.headingText}</span>
                                </div>
                              )}

                              <div className="text-[12.5px] text-muted-foreground dark:text-[#8a93a1] mt-1 line-clamp-2 max-w-[480px] leading-[1.55]">
                                {item.tags && item.tags.length > 0 ? item.tags.join(", ") : item.snippet}
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectWriteup(item.slug, item.headingId);
                              }}
                              className="text-[12px] font-mono text-accent dark:text-[#5b8def] hover:underline transition-colors whitespace-nowrap cursor-pointer pt-0.5"
                            >
                              Open
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Case D: No Matches Found */}
                  {!cyberConcept && writeups.length === 0 && (
                    <div className="border border-border dark:border-[#20242b] rounded-lg p-[22px] bg-muted/30 dark:bg-[#111418] text-center space-y-2 py-8">
                      <div className="font-mono text-[11px] text-muted-foreground dark:text-[#6b7684]">
                        state — no records
                      </div>
                      <h3 className="text-[16px] font-semibold text-foreground dark:text-[#e4e7eb] m-0">
                        No match for &ldquo;{query}&rdquo;
                      </h3>
                      <p className="text-[13px] text-muted-foreground dark:text-[#8a93a1] max-w-sm mx-auto leading-relaxed m-0">
                        No portfolio writeups or threat records match this term. Try searching a protocol, CVE, or machine name.
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Bottom Status Bar */}
            <div className="px-5 py-2.5 border-t border-border dark:border-[#20242b] bg-muted/30 dark:bg-[#0c0e12] flex items-center justify-between text-[11px] font-mono text-muted-foreground dark:text-[#6b7684]">
              <div className="flex items-center gap-4">
                <span>[ESC] Close</span>
                <span>[ENTER] Select</span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground dark:text-[#8a93a1]">
                <span className="w-1.5 h-1.5 rounded-full bg-accent dark:bg-[#00e599]" />
                <span>cve database // rohit saindane</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
