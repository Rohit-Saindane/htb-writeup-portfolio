"use client";

import React from "react";
import Link from "next/link";
import {
  Terminal,
  FileCode2,
  ExternalLink,
  Radar,
  Shield,
  Zap,
  Code2,
  GitBranch,
  Activity,
  Key,
  Network,
  Cpu,
  LucideIcon
} from "lucide-react";
import { Tool } from "@/types/tool";

const iconMap: Record<string, LucideIcon> = {
  nmap: Radar,
  "burp-suite": Shield,
  metasploit: Zap,
  "python-bash": Code2,
  bloodhound: GitBranch,
  wireshark: Activity,
  "mimikatz-rubeus": Key,
  "chisel-proxychains": Network,
  "hashcat-john": Cpu,
};

interface ToolFlyoutContentProps {
  tool: Tool;
}

export default function ToolFlyoutContent({ tool }: ToolFlyoutContentProps) {
  const Icon = iconMap[tool.iconName] || Radar;

  return (
    <div className="relative flex flex-col gap-3 font-sans">
      {/* Heavy Terminal Titlebar Accent Top Edge */}
      <div
        className="absolute -top-5 -left-5 -right-5 h-[3px] rounded-t-xl"
        style={{
          backgroundColor: tool.accentColor,
          boxShadow: `0 0 10px ${tool.accentColor}`,
        }}
      />

      {/* Flyout Header */}
      <div className="flex items-center justify-between gap-3 pt-1 pb-3 border-b border-border/60">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center bg-black/20 border border-border"
            style={{ borderColor: `${tool.accentColor}40` }}
          >
            <Icon className="w-4 h-4" style={{ color: tool.accentColor }} />
          </div>
          <div>
            <h4 className="font-mono font-bold text-foreground text-base leading-tight">
              {tool.name}
            </h4>
            <span
              className="text-[10px] font-mono font-bold uppercase tracking-widest"
              style={{ color: tool.accentColor }}
            >
              {tool.category}
            </span>
          </div>
        </div>
      </div>

      {/* Usage Blurb */}
      {tool.blurb && (
        <p className="text-xs text-muted-foreground font-sans leading-relaxed">
          {tool.blurb}
        </p>
      )}

      {/* Signature Commands */}
      {tool.commands && tool.commands.length > 0 && (
        <div className="mt-1">
          <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-1.5">
            <Terminal className="w-3 h-3 text-accent" />
            <span>Signature Commands</span>
          </div>
          <div className="rounded-lg bg-black/70 border border-border/80 p-2.5 font-mono text-[11px] text-accent/90 space-y-1.5 overflow-x-auto shadow-inner">
            {tool.commands.map((cmd, idx) => (
              <div key={idx} className="flex items-start gap-2 leading-relaxed">
                <span className="text-muted-foreground select-none">$</span>
                <span className="break-all font-mono text-foreground">{cmd}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Writeups Section */}
      <div className="pt-2 border-t border-border/50 mt-1">
        <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-2">
          <FileCode2 className="w-3 h-3 text-accent" />
          <span>Writeup References</span>
        </div>

        {tool.writeups && tool.writeups.length > 0 ? (
          <div className="flex flex-col gap-1.5">
            <span className="text-xs text-accent font-mono font-semibold">
              Used in {tool.writeups.length} writeup{tool.writeups.length > 1 ? "s" : ""}:
            </span>
            <div className="flex flex-wrap gap-2">
              {tool.writeups.map((w) => (
                <Link
                  key={w.slug}
                  href={`/writeups/${w.slug}`}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded bg-accent/10 border border-accent/30 text-[11px] font-mono text-accent hover:bg-accent/20 transition-colors"
                >
                  <span>{w.title}</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-[11px] font-mono text-muted-foreground/80 italic">
            No linked writeups yet
          </p>
        )}
      </div>
    </div>
  );
}
