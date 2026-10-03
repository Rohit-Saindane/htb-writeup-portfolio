"use client";

import { useEffect, useState } from "react";
import { RefreshCw, Trophy, Award, Users, CheckCircle2, ChevronLeft, ChevronRight, Target } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface DifficultyStat {
  name: string;
  owned_machines: number;
  total_machines: number;
  completion_percentage: number;
}

interface ActivityStat {
  blood: boolean;
  avatar: string;
  type: string;
  id: number;
  name: string;
  points: number;
  ownDate: string;
}

interface SeasonStatItem {
  seasonId: string;
  seasonName: string;
  tier: string;
  tierColor: string;
  seasonalRank: string;
  tierProgress: number;
  points: number;
  flags: string;
  ownsUser: number;
  ownsRoot: number;
  machineDifficulties: DifficultyStat[];
  recentActivity: ActivityStat[];
}

interface HtbStats {
  rank: string;
  rankPoints: number;
  currentSeasonRank: string;
  totalXP: number;
  level: number;
  levelXP: number;
  levelMaxXP: number;
  htbRankTitle: string;
  grade: number;
  ownsUser: number;
  ownsRoot: number;
  hackingTeam: string;
  userTag: string;
  userName: string;
  userAvatar: string;
  countryCode: string;
  countryName: string;
  isMock?: boolean;
  cached?: boolean;
  stale?: boolean;
  updatedAt?: string;
  seasons?: SeasonStatItem[];
  machineDifficulties?: DifficultyStat[];
  recentActivity?: ActivityStat[];
}

export default function HtbStatsCard() {
  const [stats, setStats] = useState<HtbStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeAgo, setTimeAgo] = useState("Just now");
  const [seasonIdx, setSeasonIdx] = useState(0);

  const fetchStats = async (force: boolean = false) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/htb-stats${force ? "?force=true" : ""}`);
      if (!res.ok) {
        throw new Error(`Failed to fetch stats: ${res.status}`);
      }
      const data = await res.json();
      setStats(data);
    } catch (err: unknown) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(() => fetchStats(), 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!stats || !stats.updatedAt) return;
    
    const updateTimeAgo = () => {
      const diffMs = Date.now() - new Date(stats.updatedAt!).getTime();
      const diffMins = Math.floor(diffMs / (60 * 1000));
      
      if (diffMins <= 0) {
        setTimeAgo("Just now");
      } else if (diffMins === 1) {
        setTimeAgo("1 min ago");
      } else {
        setTimeAgo(`${diffMins} min ago`);
      }
    };

    updateTimeAgo();
    const timeInterval = setInterval(updateTimeAgo, 30000);
    return () => clearInterval(timeInterval);
  }, [stats]);

  if (loading && !stats) {
    return <StatsSkeleton />;
  }

  const displayStats: HtbStats = stats || {
    rank: "#805",
    rankPoints: 375,
    currentSeasonRank: "#2536",
    totalXP: 375,
    level: 59,
    levelXP: 79,
    levelMaxXP: 1743,
    htbRankTitle: "Professional",
    grade: 3,
    ownsUser: 56,
    ownsRoot: 49,
    hackingTeam: "Apophis",
    userTag: "Pro Hacker",
    userName: "FluXi0n",
    userAvatar: "https://htb-sso-prod-public-storage.s3.eu-central-1.amazonaws.com/users/ff998aeb-eb01-4c92-8807-baf80fddd0c6-avatar.png",
    countryCode: "IN",
    countryName: "India",
    isMock: true,
    seasons: [
      {
        seasonId: "season-11",
        seasonName: "Season 11",
        tier: "RUBY TIER",
        tierColor: "#ef4444",
        seasonalRank: "#2536",
        tierProgress: 50,
        points: 375,
        flags: "14/26",
        ownsUser: 14,
        ownsRoot: 14,
        machineDifficulties: [
          { name: "Easy", owned_machines: 6, total_machines: 161, completion_percentage: 3.73 },
          { name: "Medium", owned_machines: 5, total_machines: 192, completion_percentage: 2.6 },
          { name: "Hard", owned_machines: 2, total_machines: 122, completion_percentage: 1.63 },
          { name: "Insane", owned_machines: 1, total_machines: 68, completion_percentage: 1.47 }
        ],
        recentActivity: [
          { blood: false, avatar: "https://cdn.services-k8s.prod.aws.htb.systems/content/machines/avatar/a1e513f0-690d-4dc2-bd2c-946d3983d026-1780052541.png", type: "root", id: 912, name: "Bedside", points: 30, ownDate: "2026-07-24T15:41:44.000Z" },
          { blood: false, avatar: "https://cdn.services-k8s.prod.aws.htb.systems/content/machines/avatar/a1e513f0-690d-4dc2-bd2c-946d3983d026-1780052541.png", type: "user", id: 912, name: "Bedside", points: 15, ownDate: "2026-07-23T14:08:27.000Z" },
          { blood: false, avatar: "https://cdn.services-k8s.prod.aws.htb.systems/content/machines/avatar/a1e514a2-69e8-4e79-82ab-176c3b5a26b4-1780052657.png", type: "root", id: 915, name: "Paperwork", points: 20, ownDate: "2026-07-18T14:45:38.000Z" },
          { blood: false, avatar: "https://cdn.services-k8s.prod.aws.htb.systems/content/machines/avatar/a1e514a2-69e8-4e79-82ab-176c3b5a26b4-1780052657.png", type: "user", id: 915, name: "Paperwork", points: 10, ownDate: "2026-07-18T12:49:59.000Z" },
          { blood: false, avatar: "https://cdn.services-k8s.prod.aws.htb.systems/content/machines/avatar/a1e5130b-96c5-4d6b-a7c3-aaa82554d1b2-1780052391.png", type: "root", id: 909, name: "DevHub", points: 30, ownDate: "2026-07-10T16:10:39.000Z" },
          { blood: false, avatar: "https://cdn.services-k8s.prod.aws.htb.systems/content/machines/avatar/a1e5130b-96c5-4d6b-a7c3-aaa82554d1b2-1780052391.png", type: "user", id: 909, name: "DevHub", points: 15, ownDate: "2026-07-10T15:07:39.000Z" },
          { blood: false, avatar: "https://cdn.services-k8s.prod.aws.htb.systems/content/machines/avatar/a1e513f0-690d-4dc2-bd2c-946d3983d026-1780052541.png", type: "root", id: 905, name: "Nimbus", points: 40, ownDate: "2026-07-02T11:20:00.000Z" }
        ]
      },
      {
        seasonId: "season-10",
        seasonName: "Season 10",
        tier: "PLATINUM TIER",
        tierColor: "#a855f7",
        seasonalRank: "#1279",
        tierProgress: 76.5,
        points: 685,
        flags: "23/26",
        ownsUser: 23,
        ownsRoot: 23,
        machineDifficulties: [
          { name: "Easy", owned_machines: 10, total_machines: 161, completion_percentage: 6.21 },
          { name: "Medium", owned_machines: 8, total_machines: 192, completion_percentage: 4.16 },
          { name: "Hard", owned_machines: 4, total_machines: 122, completion_percentage: 3.27 },
          { name: "Insane", owned_machines: 1, total_machines: 68, completion_percentage: 1.47 }
        ],
        recentActivity: [
          { blood: false, avatar: "/images/machines/garfield.png", type: "root", id: 880, name: "Garfield", points: 30, ownDate: "2026-04-18T12:20:00.000Z" },
          { blood: false, avatar: "/images/machines/garfield.png", type: "user", id: 880, name: "Garfield", points: 15, ownDate: "2026-04-18T10:00:00.000Z" },
          { blood: false, avatar: "/images/machines/devarea.png", type: "root", id: 875, name: "DevArea", points: 40, ownDate: "2026-04-10T14:15:00.000Z" },
          { blood: false, avatar: "/images/machines/devarea.png", type: "user", id: 875, name: "DevArea", points: 20, ownDate: "2026-04-10T11:00:00.000Z" },
          { blood: false, avatar: "/images/machines/logging.png", type: "root", id: 870, name: "Logging", points: 30, ownDate: "2026-03-28T18:00:00.000Z" },
          { blood: false, avatar: "/images/machines/pirate.png", type: "root", id: 865, name: "Pirate", points: 30, ownDate: "2026-03-15T11:45:00.000Z" },
          { blood: false, avatar: "/images/machines/cctv.png", type: "root", id: 860, name: "CCTV", points: 20, ownDate: "2026-03-02T09:30:00.000Z" }
        ]
      },
      {
        seasonId: "season-9",
        seasonName: "Season 9",
        tier: "RUBY TIER",
        tierColor: "#ef4444",
        seasonalRank: "#1860",
        tierProgress: 72.0,
        points: 980,
        flags: "18/24",
        ownsUser: 18,
        ownsRoot: 18,
        machineDifficulties: [
          { name: "Easy", owned_machines: 8, total_machines: 161, completion_percentage: 4.96 },
          { name: "Medium", owned_machines: 6, total_machines: 192, completion_percentage: 3.12 },
          { name: "Hard", owned_machines: 3, total_machines: 122, completion_percentage: 2.45 },
          { name: "Insane", owned_machines: 0, total_machines: 68, completion_percentage: 0 }
        ],
        recentActivity: [
          { blood: false, avatar: "/images/machines/interpreter.png", type: "root", id: 820, name: "Interpreter", points: 30, ownDate: "2025-12-14T10:30:00.000Z" },
          { blood: false, avatar: "/images/machines/interpreter.png", type: "user", id: 820, name: "Interpreter", points: 15, ownDate: "2025-12-14T08:15:00.000Z" },
          { blood: false, avatar: "/images/machines/kobold.png", type: "root", id: 815, name: "Kobold", points: 20, ownDate: "2025-12-01T16:20:00.000Z" },
          { blood: false, avatar: "/images/machines/kobold.png", type: "user", id: 815, name: "Kobold", points: 10, ownDate: "2025-12-01T14:00:00.000Z" },
          { blood: false, avatar: "/images/machines/variatype.png", type: "root", id: 810, name: "VariaType", points: 30, ownDate: "2025-11-20T19:10:00.000Z" },
          { blood: false, avatar: "/images/machines/variatype.png", type: "user", id: 810, name: "VariaType", points: 15, ownDate: "2025-11-20T17:00:00.000Z" },
          { blood: false, avatar: "/images/machines/wingdata.png", type: "root", id: 805, name: "WingData", points: 25, ownDate: "2025-11-05T14:30:00.000Z" }
        ]
      }
    ]
  };

  const seasonsList = displayStats.seasons && displayStats.seasons.length > 0 ? displayStats.seasons : [];
  const currentSeasonData = seasonsList[seasonIdx] || seasonsList[0] || {
    seasonId: "season-11",
    seasonName: "Season 11",
    tier: "RUBY TIER",
    tierColor: "#ef4444",
    seasonalRank: "#3154",
    tierProgress: 16.67,
    points: 310,
    flags: "12/26",
    ownsUser: 12,
    ownsRoot: 12,
    machineDifficulties: displayStats.machineDifficulties || [],
    recentActivity: displayStats.recentActivity || []
  };

  const nextSeason = () => {
    if (seasonIdx > 0) setSeasonIdx(seasonIdx - 1);
  };

  const prevSeason = () => {
    if (seasonIdx < seasonsList.length - 1) setSeasonIdx(seasonIdx + 1);
  };

  const getStrokeProps = (radius: number, percent: number) => {
    const circ = 2 * Math.PI * radius;
    const offset = circ - (percent / 100) * circ;
    return { strokeDasharray: `${circ} ${circ}`, strokeDashoffset: offset };
  };

  const formatRelativeDate = (dateStr: string): string => {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));
    if (diffDays <= 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    const diffWeeks = Math.floor(diffDays / 7);
    if (diffWeeks === 1) return "1w ago";
    if (diffWeeks < 4) return `${diffWeeks}w ago`;
    const diffMonths = Math.floor(diffDays / 30);
    if (diffMonths === 1) return "1m ago";
    return `${diffMonths}m ago`;
  };

  const getDiffPercent = (name: string) => {
    const diff = currentSeasonData.machineDifficulties?.find(d => d.name.toLowerCase() === name.toLowerCase());
    return diff ? diff.completion_percentage : 0;
  };

  const getDiffDetails = (name: string) => {
    const diff = currentSeasonData.machineDifficulties?.find(d => d.name.toLowerCase() === name.toLowerCase());
    return diff ? `${diff.owned_machines}/${diff.total_machines}` : "0/0";
  };

  const getTierSvg = (tier: string): string => {
    const lower = (tier || "").toLowerCase();
    if (lower.includes("ruby")) return "/tier-svgs/tier-ruby.svg";
    if (lower.includes("platinum")) return "/tier-svgs/tier-platinum.svg";
    if (lower.includes("silver")) return "/tier-svgs/tier-silver.svg";
    if (lower.includes("bronze")) return "/tier-svgs/tier-bronze.svg";
    if (lower.includes("holo")) return "/tier-svgs/tier-holo.svg";
    return "/tier-svgs/tier-ruby.svg";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`w-full bg-card rounded-xl border border-border hover:border-accent/40 shadow-glow theme-transition overflow-hidden relative ${
        loading && stats ? "after:absolute after:inset-0 after:bg-accent/[0.03] after:backdrop-blur-[0.5px] after:animate-pulse" : ""
      }`}
      id="htb-stats-card-container"
    >
      {/* Live Status Header Bar (Clean Header without telemetry title) */}
      <div className="px-5 py-3 border-b border-border flex flex-wrap items-center justify-between gap-3 bg-black/[0.04] dark:bg-white/[0.02]">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-accent" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-accent" />
          </span>
          <span className="text-xs font-mono font-bold tracking-wider text-muted-foreground uppercase">
            Live Profile Sync
          </span>
        </div>

        {/* Season Switcher Controls Bar */}
        <div className="flex items-center gap-2 bg-background/80 px-3 py-1 rounded-lg border border-border">
          <button
            onClick={prevSeason}
            disabled={seasonIdx >= seasonsList.length - 1}
            className={`p-1 rounded hover:bg-card ${seasonIdx >= seasonsList.length - 1 ? "opacity-30 cursor-not-allowed" : "cursor-pointer text-accent hover:scale-110"} theme-transition`}
            aria-label="Previous Season"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <span className="text-xs font-mono font-bold text-foreground px-2 min-w-[90px] text-center">
            {currentSeasonData.seasonName}
          </span>

          <button
            onClick={nextSeason}
            disabled={seasonIdx <= 0}
            className={`p-1 rounded hover:bg-card ${seasonIdx <= 0 ? "opacity-30 cursor-not-allowed" : "cursor-pointer text-accent hover:scale-110"} theme-transition`}
            aria-label="Next Season"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-3">
          {stats?.updatedAt && (
            <span className="text-[10px] font-mono text-muted-foreground flex items-center gap-1.5">
              <CheckCircle2 className="w-3 h-3 text-accent" />
              {timeAgo}
            </span>
          )}
          <button
            onClick={() => fetchStats(true)}
            disabled={loading}
            className="p-1.5 rounded hover:bg-border text-muted-foreground hover:text-foreground cursor-pointer theme-transition"
            aria-label="Refresh stats"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-accent" : ""}`} />
          </button>
        </div>
      </div>

      {/* Seasonal Summary Sub-Header Banner (Only Flags) */}
      <div className="px-6 py-2.5 border-b border-border/60 bg-accent/5 flex items-center justify-end text-xs font-mono text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Target className="w-4 h-4 text-cyan-400" />
          <span>Flags: <strong className="text-foreground text-sm font-bold ml-1">{currentSeasonData.flags}</strong></span>
        </div>
      </div>

      {/* Main Grid Content (Reactive for Active Season) */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSeasonData.seasonId}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.25 }}
          className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-8"
        >
          
          {/* Column 1: Profile & Official HTB Cyber Tier Avatar Frame */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-5">
            {/* User Avatar with Official HTB Cyber Frame Matching Active Season Tier */}
            <div className="flex items-center gap-5">
              {/* Official HTB Cyber Tier Frame Container */}
              <div className="relative w-[104px] h-[120px] flex-shrink-0 flex items-center justify-center">
                {/* Inner Round Avatar Image centered perfectly inside official frame */}
                <img
                  src={displayStats.userAvatar}
                  alt={`${displayStats.userName} avatar`}
                  className="w-[56px] h-[56px] rounded-full object-cover bg-black/80 shadow-2xl z-0"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://www.hackthebox.com/storage/avatars/default.png";
                  }}
                />

                {/* Official HTB SVG Tier Badge Frame Overlay */}
                <img
                  src={getTierSvg(currentSeasonData.tier)}
                  alt={`${currentSeasonData.tier} Frame`}
                  className="absolute inset-0 w-full h-full object-contain pointer-events-none z-10"
                  style={{
                    filter: `drop-shadow(0 0 10px ${currentSeasonData.tierColor || '#ef4444'}a0)`
                  }}
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-1.5">
                  <h3 className="text-xl font-bold font-mono text-foreground tracking-tight truncate">
                    {displayStats.userName}
                  </h3>
                  <span className="text-xs font-mono font-bold text-muted-foreground">
                    #{displayStats.countryCode}
                  </span>
                </div>

                <div className="mt-1 flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold tracking-widest px-2.5 py-0.5 rounded-md bg-accent/15 border border-accent/40 text-accent dark:text-[#00e599] uppercase shadow-sm">
                    {displayStats.userTag}
                  </span>
                  <span className="text-[10px] font-mono font-extrabold text-foreground px-2 py-0.5 rounded bg-accent/20 border border-accent/40">
                    Lvl {displayStats.level ?? 59}
                  </span>
                </div>
              </div>
            </div>

            {/* Level XP Progress & HTB Rank Title Block */}
            <div className="p-4 rounded-lg bg-black/[0.04] dark:bg-white/[0.03] border border-border flex flex-col gap-2.5">
              {/* Level XP Progress Bar matching official HTB */}
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 font-bold">
                  Level <span className="px-1 py-0.5 rounded bg-purple-900/60 text-purple-300 text-[9px] font-mono font-extrabold uppercase">XP</span>
                </span>
                <span className="text-xs font-bold font-mono text-foreground">
                  {displayStats.levelXP ?? 79}/{displayStats.levelMaxXP ?? 1743}
                </span>
              </div>
              <div className="w-full h-2 bg-black/20 dark:bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent rounded-full theme-transition"
                  style={{
                    width: `${Math.min(100, Math.max(0, (((displayStats.levelXP ?? 79) / (displayStats.levelMaxXP ?? 1743)) * 100)))}%`
                  }}
                />
              </div>

              {/* Rank Title & Grade */}
              <div className="flex items-center justify-between border-t border-border/50 pt-2 mt-0.5">
                <div className="flex flex-col">
                  <span className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground">
                    HTB Rank
                  </span>
                  <span className="text-base font-bold font-mono text-foreground">
                    {displayStats.htbRankTitle || "Professional"}
                  </span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground">
                    Grade
                  </span>
                  <span className="text-xs font-bold font-mono text-accent">
                    ◆ ◆ ◆
                  </span>
                </div>
              </div>
            </div>

            {/* Core Numeric Stats Grid */}
            <div className="grid grid-cols-2 gap-3 border-t border-b border-border/60 py-3 text-xs font-mono">
              <div className="flex flex-col">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                  <Trophy className="w-3 h-3 text-accent" />
                  Global Rank
                </span>
                <span className="text-lg font-bold text-foreground mt-0.5">
                  {displayStats.rank}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                  <Award className="w-3 h-3 text-accent" />
                  Total XP
                </span>
                <span className="text-lg font-bold text-foreground mt-0.5">
                  {displayStats.rankPoints.toLocaleString()}
                </span>
              </div>
              <div className="flex flex-col pt-1">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                  <Trophy className="w-3 h-3 text-accent" />
                  {currentSeasonData.seasonName} Rank
                </span>
                <span className="text-base font-bold text-accent mt-0.5">
                  {currentSeasonData.seasonalRank}
                </span>
              </div>
              <div className="flex flex-col pt-1">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                  <Users className="w-3 h-3 text-accent" />
                  Team
                </span>
                <span className="text-base font-bold text-foreground mt-0.5 truncate max-w-[130px]">
                  {displayStats.hackingTeam}
                </span>
              </div>
            </div>

            {/* Overall Solves Summary */}
            <div className="flex justify-between items-center text-xs font-mono text-muted-foreground bg-black/[0.04] dark:bg-white/[0.04] px-4 py-2 rounded border border-border/50">
              <span>Overall Solves:</span>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  User: <strong className="text-foreground ml-0.5">{displayStats.ownsUser || 56}</strong>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  Root: <strong className="text-foreground ml-0.5">{displayStats.ownsRoot || 49}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Column 2: Difficulty Completion Concentric Ring Chart */}
          <div className="lg:col-span-3 flex flex-col items-center justify-center border-t lg:border-t-0 lg:border-l lg:border-r border-border/60 pt-6 lg:pt-0 px-2 lg:px-6">
            <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-4 font-bold">
              {currentSeasonData.seasonName} Difficulty
            </span>

            <div className="relative w-40 h-40">
              <svg viewBox="0 0 200 200" className="w-full h-full transform -rotate-90">
                {/* Ring 4 (Outer): Insane */}
                <circle cx="100" cy="100" r="80" className="stroke-[#e2e8f0] dark:stroke-[#161e24]" strokeWidth="8" fill="none" />
                <circle
                  cx="100"
                  cy="100"
                  r="80"
                  stroke="#a855f7"
                  strokeWidth="8"
                  fill="none"
                  strokeLinecap="round"
                  {...getStrokeProps(80, getDiffPercent("Insane"))}
                  className="transition-all duration-1000 ease-out"
                />

                {/* Ring 3: Hard */}
                <circle cx="100" cy="100" r="64" className="stroke-[#e2e8f0] dark:stroke-[#161e24]" strokeWidth="8" fill="none" />
                <circle
                  cx="100"
                  cy="100"
                  r="64"
                  stroke="#ef4444"
                  strokeWidth="8"
                  fill="none"
                  strokeLinecap="round"
                  {...getStrokeProps(64, getDiffPercent("Hard"))}
                  className="transition-all duration-1000 ease-out"
                />

                {/* Ring 2: Medium */}
                <circle cx="100" cy="100" r="48" className="stroke-[#e2e8f0] dark:stroke-[#161e24]" strokeWidth="8" fill="none" />
                <circle
                  cx="100"
                  cy="100"
                  r="48"
                  stroke="#eab308"
                  strokeWidth="8"
                  fill="none"
                  strokeLinecap="round"
                  {...getStrokeProps(48, getDiffPercent("Medium"))}
                  className="transition-all duration-1000 ease-out"
                />

                {/* Ring 1 (Inner): Easy */}
                <circle cx="100" cy="100" r="32" className="stroke-[#e2e8f0] dark:stroke-[#161e24]" strokeWidth="8" fill="none" />
                <circle
                  cx="100"
                  cy="100"
                  r="32"
                  stroke="#22c55e"
                  strokeWidth="8"
                  fill="none"
                  strokeLinecap="round"
                  {...getStrokeProps(32, getDiffPercent("Easy"))}
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
            </div>

            {/* Concentric Legends */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-4 text-[10px] font-mono text-muted-foreground w-full max-w-[200px]">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-green-500 flex-shrink-0" />
                <span className="truncate">Easy: {getDiffDetails("Easy")}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-yellow-500 flex-shrink-0" />
                <span className="truncate">Med: {getDiffDetails("Medium")}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-red-500 flex-shrink-0" />
                <span className="truncate">Hard: {getDiffDetails("Hard")}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-purple-500 flex-shrink-0" />
                <span className="truncate">Ins: {getDiffDetails("Insane")}</span>
              </div>
            </div>
          </div>

          {/* Column 3: Machine Solves (Utilizing vertical height with 7 items) */}
          <div className="lg:col-span-4 flex flex-col justify-start border-t lg:border-t-0 border-border/60 pt-6 lg:pt-0">
            <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-3 font-bold text-center lg:text-left">
              {currentSeasonData.seasonName} Solves
            </span>

            <div className="flex flex-col gap-3">
              {currentSeasonData.recentActivity && currentSeasonData.recentActivity.length > 0 ? (
                currentSeasonData.recentActivity.slice(0, 7).map((act, index) => (
                  <div key={index} className="flex items-center justify-between text-xs font-mono py-0.5 border-b border-border/30 last:border-0 pb-1.5">
                    <div className="flex items-center gap-2.5 truncate max-w-[70%]">
                      <img
                        src={act.avatar}
                        alt={`${act.name} machine`}
                        className="w-7 h-7 rounded-full object-contain flex-shrink-0 bg-black/5 dark:bg-white/5"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/images/machines/silentium.png";
                        }}
                      />
                      <div className="flex flex-col min-w-0">
                        <span className="text-foreground font-bold truncate leading-tight">
                          {act.name}
                        </span>
                        <span className={`text-[9px] uppercase tracking-wider ${
                          act.type === "root" ? "text-red-400 font-bold" : "text-green-400"
                        }`}>
                          {act.type === "root" ? "System Own" : "User Own"}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end flex-shrink-0 text-right">
                      <span className="text-accent text-[11px] font-bold">
                        +{act.points} pts
                      </span>
                      <span className="text-[9px] text-muted-foreground">
                        {formatRelativeDate(act.ownDate)}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <span className="text-xs text-muted-foreground text-center py-4">No solves recorded for this season.</span>
              )}
            </div>
          </div>

        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}

function StatsSkeleton() {
  return (
    <div className="w-full bg-card rounded-xl border border-border overflow-hidden">
      <div className="px-5 py-4 border-b border-border flex items-center justify-between bg-black/10">
        <div className="h-4 bg-muted animate-pulse rounded w-32" />
        <div className="h-4 bg-muted animate-pulse rounded w-24" />
      </div>
      <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-muted animate-pulse flex-shrink-0" />
            <div className="flex flex-col gap-1 w-full">
              <div className="h-5 bg-muted animate-pulse rounded w-1/2" />
              <div className="h-3.5 bg-muted animate-pulse rounded w-1/4" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 border-t border-b border-border py-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-8 bg-muted animate-pulse rounded w-full" />
            ))}
          </div>
        </div>
        <div className="lg:col-span-3 flex flex-col items-center justify-center py-4">
          <div className="w-32 h-32 rounded-full border-8 border-muted animate-pulse" />
        </div>
        <div className="lg:col-span-4 flex flex-col gap-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-8 bg-muted animate-pulse rounded w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}

