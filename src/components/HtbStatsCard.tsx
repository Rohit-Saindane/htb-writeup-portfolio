"use client";

import { useEffect, useState } from "react";
import { ShieldAlert, RefreshCw, Trophy, Award, Users, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

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

interface HtbStats {
  rank: string;
  rankPoints: number;
  currentSeasonRank: string;
  totalXP: number;
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
  machineDifficulties?: DifficultyStat[];
  recentActivity?: ActivityStat[];
}

export default function HtbStatsCard() {
  const [stats, setStats] = useState<HtbStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeAgo, setTimeAgo] = useState("Just now");

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/htb-stats");
      if (!res.ok) {
        throw new Error(`Failed to fetch stats: ${res.status}`);
      }
      const data = await res.json();
      setStats(data);
      setError(null);
    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to load HTB profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 5 * 60 * 1000); // Poll every 5 mins
    return () => clearInterval(interval);
  }, []);

  // Update "updated X minutes ago" string
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

  // Gracefully fallback to MOCK data if error occurs and no stale stats exist
  const displayStats: HtbStats = stats || {
    rank: "#805",
    rankPoints: 229,
    currentSeasonRank: "#240",
    totalXP: 229,
    ownsUser: 50,
    ownsRoot: 43,
    hackingTeam: "Apophis",
    userTag: "Pro Hacker",
    userName: "FluXi0n",
    userAvatar: "https://htb-sso-prod-public-storage.s3.eu-central-1.amazonaws.com/users/ff998aeb-eb01-4c92-8807-baf80fddd0c6-avatar.png",
    countryCode: "IN",
    countryName: "India",
    isMock: true,
    machineDifficulties: [
      { name: "Easy", owned_machines: 17, total_machines: 161, completion_percentage: 10.56 },
      { name: "Medium", owned_machines: 17, total_machines: 192, completion_percentage: 8.85 },
      { name: "Hard", owned_machines: 8, total_machines: 122, completion_percentage: 6.56 },
      { name: "Insane", owned_machines: 1, total_machines: 68, completion_percentage: 1.47 }
    ],
    recentActivity: [
      { blood: false, avatar: "https://cdn.services-k8s.prod.aws.htb.systems/content/machines/avatar/a1e513f0-690d-4dc2-bd2c-946d3983d026-1780052541.png", type: "user", id: 912, name: "Nimbus", points: 20, ownDate: "2026-07-02T14:08:27.000Z" },
      { blood: false, avatar: "https://cdn.services-k8s.prod.aws.htb.systems/content/machines/avatar/a1e514a2-69e8-4e79-82ab-176c3b5a26b4-1780052657.png", type: "root", id: 915, name: "Enigma", points: 20, ownDate: "2026-07-01T14:45:38.000Z" },
      { blood: false, avatar: "https://cdn.services-k8s.prod.aws.htb.systems/content/machines/avatar/a1e514a2-69e8-4e79-82ab-176c3b5a26b4-1780052657.png", type: "user", id: 915, name: "Enigma", points: 10, ownDate: "2026-06-30T15:49:59.000Z" },
      { blood: false, avatar: "https://cdn.services-k8s.prod.aws.htb.systems/content/machines/avatar/a1e5130b-96c5-4d6b-a7c3-aaa82554d1b2-1780052391.png", type: "root", id: 909, name: "Checkpoint", points: 30, ownDate: "2026-06-20T16:10:39.000Z" },
      { blood: false, avatar: "https://cdn.services-k8s.prod.aws.htb.systems/content/machines/avatar/a1e5130b-96c5-4d6b-a7c3-aaa82554d1b2-1780052391.png", type: "user", id: 909, name: "Checkpoint", points: 15, ownDate: "2026-06-20T16:07:39.000Z" }
    ]
  };

  // SVG concentric circle helper
  const getStrokeProps = (radius: number, percent: number) => {
    const circ = 2 * Math.PI * radius;
    const offset = circ - (percent / 100) * circ;
    return { strokeDasharray: `${circ} ${circ}`, strokeDashoffset: offset };
  };

  // Helper for formatting own relative dates
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

  // Get difficulty percentages
  const getDiffPercent = (name: string) => {
    const diff = displayStats.machineDifficulties?.find(d => d.name.toLowerCase() === name.toLowerCase());
    return diff ? diff.completion_percentage : 0;
  };

  const getDiffDetails = (name: string) => {
    const diff = displayStats.machineDifficulties?.find(d => d.name.toLowerCase() === name.toLowerCase());
    return diff ? `${diff.owned_machines}/${diff.total_machines}` : "0/0";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full bg-card rounded-xl border border-border hover:border-accent/40 shadow-glow theme-transition overflow-hidden"
      id="htb-stats-card-container"
    >
      {/* Live Status Bar */}
      <div className="px-5 py-3 border-b border-border flex items-center justify-between bg-black/[0.04] dark:bg-white/[0.02]">
        <div className="flex items-center gap-3">
          <span className="relative flex h-2.5 w-2.5">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
              displayStats.isMock ? "bg-amber-400" : "bg-accent"
            }`}></span>
            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
              displayStats.isMock ? "bg-amber-500" : "bg-accent"
            }`}></span>
          </span>
          <span className="text-[10px] font-mono font-bold tracking-wider text-muted-foreground uppercase flex items-center gap-1.5">
            Live Hack The Box Stats
            {displayStats.isMock && (
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20 font-sans tracking-normal normal-case">
                Demo
              </span>
            )}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {error && (
            <span className="text-[10px] font-sans text-rose-500 flex items-center gap-1" title={error}>
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Offline</span>
            </span>
          )}
          {stats?.updatedAt && (
            <span className="text-[10px] font-mono text-muted-foreground flex items-center gap-1.5">
              <CheckCircle2 className="w-3 h-3 text-accent" />
              {timeAgo}
            </span>
          )}
          <button
            onClick={fetchStats}
            disabled={loading}
            className="p-1 rounded hover:bg-border text-muted-foreground hover:text-foreground cursor-pointer theme-transition"
            aria-label="Refresh stats"
          >
            <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin text-accent" : ""}`} />
          </button>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Column 1: Profile Details & Stats */}
        <div className="lg:col-span-5 flex flex-col justify-between gap-6">
          {/* User Info Header Block */}
          <div className="flex items-center gap-4">
            <img
              src={displayStats.userAvatar}
              alt={`${displayStats.userName} avatar`}
              className="w-16 h-16 rounded-full object-cover border-2 border-accent/80 bg-black/40 flex-shrink-0 shadow-glow"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "https://www.hackthebox.com/storage/avatars/default.png";
              }}
            />
            <div>
              <div className="flex items-baseline gap-1.5">
                <h3 className="text-xl sm:text-2xl font-bold font-mono text-foreground tracking-tight">
                  {displayStats.userName}
                </h3>
                <span className="text-sm font-mono font-bold text-muted-foreground">
                  #{displayStats.countryCode}
                </span>
              </div>
              <div className="mt-1">
                <span className="text-[10px] font-mono font-bold tracking-widest px-2 py-0.5 rounded bg-black/40 border border-border/80 text-accent uppercase">
                  {displayStats.userTag}
                </span>
              </div>
            </div>
          </div>

          {/* Core Numeric Stats Grid */}
          <div className="grid grid-cols-2 gap-4 border-t border-b border-border/60 py-4">
            <div className="flex flex-col">
              <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                <Trophy className="w-3 h-3 text-accent" />
                Rank
              </span>
              <span className="text-xl font-bold font-mono text-foreground mt-0.5">
                {displayStats.rank}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                <Award className="w-3 h-3 text-accent" />
                Total XP
              </span>
              <span className="text-xl font-bold font-mono text-foreground mt-0.5">
                {displayStats.rankPoints.toLocaleString()}
              </span>
            </div>
            <div className="flex flex-col pt-2">
              <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                <Trophy className="w-3 h-3 text-accent" />
                Season Rank
              </span>
              <span className="text-lg font-bold font-mono text-foreground mt-0.5">
                {displayStats.currentSeasonRank}
              </span>
            </div>
            <div className="flex flex-col pt-2">
              <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                <Users className="w-3 h-3 text-accent" />
                Team
              </span>
              <span className="text-lg font-bold font-mono text-foreground mt-0.5 truncate max-w-[150px]">
                {displayStats.hackingTeam}
              </span>
            </div>
          </div>

          {/* Owned Assets Summary */}
          <div className="flex justify-between items-center text-xs font-mono text-muted-foreground bg-black/[0.04] dark:bg-white/[0.04] px-4 py-2.5 rounded border border-border/50">
            <span>Owned Assets:</span>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                User: <strong className="text-foreground ml-0.5">{displayStats.ownsUser}</strong>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                Root: <strong className="text-foreground ml-0.5">{displayStats.ownsRoot}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Column 2: Difficulty Completion Concentric Chart */}
        <div className="lg:col-span-3 flex flex-col items-center justify-center border-t lg:border-t-0 lg:border-l lg:border-r border-border/60 pt-6 lg:pt-0 px-2 lg:px-6">
          <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-4 font-bold">
            Difficulty Completion
          </span>

          <div className="relative w-40 h-40">
            <svg viewBox="0 0 200 200" className="w-full h-full transform -rotate-90">
              {/* Ring 4 (Outer): Insane (White) */}
              <circle cx="100" cy="100" r="80" className="stroke-[#e2e8f0] dark:stroke-[#161e24]" strokeWidth="8" fill="none" />
              <circle
                cx="100"
                cy="100"
                r="80"
                stroke="#d1d5db"
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                {...getStrokeProps(80, getDiffPercent("Insane"))}
                className="transition-all duration-1000 ease-out"
              />

              {/* Ring 3: Hard (Red/Orange) */}
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

              {/* Ring 2: Medium (Yellow) */}
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

              {/* Ring 1 (Inner): Easy (Green) */}
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
              <span className="w-2.5 h-2.5 rounded bg-gray-300 flex-shrink-0" />
              <span className="truncate">Ins: {getDiffDetails("Insane")}</span>
            </div>
          </div>
        </div>

        {/* Column 3: Recent Activity (Machine Solves) */}
        <div className="lg:col-span-4 flex flex-col justify-start border-t lg:border-t-0 border-border/60 pt-6 lg:pt-0">
          <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-4 font-bold text-center lg:text-left">
            Recent Solves
          </span>

          <div className="flex flex-col gap-3.5">
            {displayStats.recentActivity && displayStats.recentActivity.length > 0 ? (
              displayStats.recentActivity.slice(0, 5).map((act, index) => (
                <div key={index} className="flex items-center justify-between text-xs font-mono py-1">
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
              <span className="text-xs text-muted-foreground text-center py-4">No recent activity.</span>
            )}
          </div>
        </div>

      </div>
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
