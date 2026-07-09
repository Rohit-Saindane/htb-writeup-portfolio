"use client";

import { useState, useMemo } from "react";
import { Search, RotateCcw, AlertTriangle, SlidersHorizontal, Hash } from "lucide-react";
import WriteupCard from "@/components/WriteupCard";
import { WriteupMetadata, FilterOptions } from "@/lib/mdx";

interface WriteupsCatalogProps {
  writeups: WriteupMetadata[];
  filterOptions: FilterOptions;
}

export default function WriteupsCatalog({ writeups, filterOptions }: WriteupsCatalogProps) {
  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSeason, setSelectedSeason] = useState("all");
  const [selectedOS, setSelectedOS] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [selectedTag, setSelectedTag] = useState("all");

  // Reset all filters
  const resetFilters = () => {
    setSearchQuery("");
    setSelectedSeason("all");
    setSelectedOS("all");
    setSelectedDifficulty("all");
    setSelectedTag("all");
  };

  // Perform search & filtering
  const filteredWriteups = useMemo(() => {
    return writeups.filter((w) => {
      // 1. Search Query filter (matches title, summary, or tags)
      const matchesSearch =
        searchQuery === "" ||
        w.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      // 2. Season filter
      const matchesSeason = selectedSeason === "all" || w.seasonSlug === selectedSeason;

      // 3. OS filter
      const matchesOS = selectedOS === "all" || w.os === selectedOS;

      // 4. Difficulty filter
      const matchesDifficulty = selectedDifficulty === "all" || w.difficulty === selectedDifficulty;

      // 5. Tag filter
      const matchesTag = selectedTag === "all" || w.tags.includes(selectedTag);

      return matchesSearch && matchesSeason && matchesOS && matchesDifficulty && matchesTag;
    });
  }, [writeups, searchQuery, selectedSeason, selectedOS, selectedDifficulty, selectedTag]);

  return (
    <div className="w-full min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background decoration grid lines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.02)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:5rem_5rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Catalog Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10 border-b border-border/60 pb-6">
          <div>
            <h1 className="text-3xl font-bold font-mono tracking-tight text-foreground flex items-center gap-2">
              <span className="text-accent">&gt;_</span>
              <span>All Writeups</span>
            </h1>
            <p className="text-sm font-sans text-muted-foreground mt-1.5 leading-relaxed">
              Explore walkthroughs, nmap scans, and privilege escalation vectors for {writeups.length} lab machines.
            </p>
          </div>
          
          {/* Active Results Count & Reset button */}
          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="text-muted-foreground bg-black/10 dark:bg-white/5 border border-border px-3 py-1 rounded-lg">
              Showing <strong className="text-foreground">{filteredWriteups.length}</strong> of {writeups.length} machines
            </span>
            {(searchQuery || selectedSeason !== "all" || selectedOS !== "all" || selectedDifficulty !== "all" || selectedTag !== "all") && (
              <button
                onClick={resetFilters}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-accent/10 border border-accent/20 text-accent hover:bg-accent hover:text-background hover:shadow-glow theme-transition cursor-pointer"
                id="reset-filters-btn"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>
        </div>

        {/* Search Bar Input */}
        <div className="relative mb-10 max-w-3xl group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-accent theme-transition" />
          <input
            type="text"
            placeholder="Search by machine name, tags, or vulnerability description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-card border border-border focus:border-accent/40 focus:outline-none focus:shadow-glow font-sans text-foreground theme-transition shadow-sm"
            id="writeups-search-input"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          
          {/* Filter Sidebar Column */}
          <div className="rgb-border-wrapper lg:col-span-1 shadow-sm">
            <div className="rgb-border-inner flex flex-col gap-6 p-5 relative overflow-hidden group">
              {/* Ambient top glowing line */}
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-accent/10 to-transparent group-hover:via-accent/40 theme-transition" />
              
              <div className="flex items-center gap-2 border-b border-border/60 pb-3 mb-1">
                <SlidersHorizontal className="w-4 h-4 text-accent" />
                <span className="text-sm font-mono font-bold text-foreground">Filters</span>
              </div>

              {/* Filter Section: Season */}
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground">
                  Season
                </span>
                <div className="relative">
                  <select
                    value={selectedSeason}
                    onChange={(e) => setSelectedSeason(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-background border border-border font-mono text-sm focus:outline-none focus:border-accent/30 text-foreground cursor-pointer appearance-none theme-transition hover:border-border-hover"
                    id="filter-season-select"
                  >
                    <option value="all">All Seasons</option>
                    {filterOptions.seasons.map((s) => (
                      <option key={s.slug} value={s.slug}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">
                    ▼
                  </div>
                </div>
              </div>

              {/* Filter Section: OS */}
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground">
                  Operating System
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {["all", "linux", "windows"].map((os) => (
                    <button
                      key={os}
                      onClick={() => setSelectedOS(os)}
                      className={`py-2 px-1 rounded-lg border font-mono text-xs capitalize theme-transition cursor-pointer text-center ${
                        selectedOS === os
                          ? "bg-accent/15 border-accent text-accent shadow-[0_0_10px_rgba(34,197,94,0.1)]"
                          : "bg-background border-border text-muted-foreground hover:text-foreground hover:border-accent/20"
                      }`}
                      id={`filter-os-btn-${os}`}
                    >
                      {os}
                    </button>
                  ))}
                </div>
              </div>

              {/* Filter Section: Difficulty */}
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground">
                  Difficulty
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {["all", "easy", "medium", "hard", "insane"].map((diff) => (
                    <button
                      key={diff}
                      onClick={() => setSelectedDifficulty(diff)}
                      className={`py-2 px-2 rounded-lg border font-mono text-xs capitalize theme-transition cursor-pointer text-center ${
                        selectedDifficulty === diff
                          ? "bg-accent/15 border-accent text-accent shadow-[0_0_10px_rgba(34,197,94,0.1)]"
                          : "bg-background border-border text-muted-foreground hover:text-foreground hover:border-accent/20"
                      }`}
                      id={`filter-diff-btn-${diff}`}
                    >
                      {diff}
                    </button>
                  ))}
                </div>
              </div>

              {/* Filter Section: Tags */}
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground mb-1">
                  Popular Tags
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => setSelectedTag("all")}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-mono border theme-transition cursor-pointer ${
                      selectedTag === "all"
                        ? "bg-accent/15 border-accent text-accent shadow-[0_0_10px_rgba(34,197,94,0.1)]"
                        : "bg-background border-border text-muted-foreground hover:text-foreground hover:border-accent/20"
                    }`}
                    id="filter-tag-btn-all"
                  >
                    <Hash className="w-3 h-3" />
                    <span>All</span>
                  </button>
                  {filterOptions.tags.slice(0, 15).map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setSelectedTag(tag)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-mono border theme-transition cursor-pointer ${
                        selectedTag === tag
                          ? "bg-accent/15 border-accent text-accent shadow-[0_0_10px_rgba(34,197,94,0.1)]"
                          : "bg-background border-border text-muted-foreground hover:text-foreground hover:border-accent/20"
                      }`}
                      id={`filter-tag-btn-${tag.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                    >
                      <Hash className="w-3 h-3" />
                      <span>{tag}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Grid Area Column */}
          <div className="lg:col-span-3">
            {filteredWriteups.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredWriteups.map((writeup, index) => (
                  <WriteupCard key={writeup.slug} writeup={writeup} index={index} />
                ))}
              </div>
            ) : (
              /* Empty results terminal */
              <div className="flex flex-col items-center justify-center text-center p-12 border border-border border-dashed bg-card rounded-xl shadow-inner min-h-[300px]">
                <AlertTriangle className="w-10 h-10 text-amber-500 mb-4 animate-bounce" />
                <span className="text-lg font-mono font-bold text-foreground">No Writeups Found</span>
                <p className="text-sm text-muted-foreground max-w-sm mt-2">
                  No machines match your search term or filters. Try adjusting the tags or resetting the filters.
                </p>
                <button
                  onClick={resetFilters}
                  className="mt-6 px-4 py-2 rounded-lg bg-accent text-background font-mono text-sm font-semibold hover:bg-accent-hover hover:shadow-glow theme-transition cursor-pointer"
                  id="empty-reset-filters-btn"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
