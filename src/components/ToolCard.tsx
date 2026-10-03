"use client";

import React, { useState } from "react";
import {
  Radar,
  Shield,
  Zap,
  Code2,
  GitBranch,
  Activity,
  Key,
  Network,
  Cpu,
  LucideIcon,
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

interface ToolCardProps {
  tool: Tool;
}

export default function ToolCard({ tool }: ToolCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const Icon = iconMap[tool.iconName] || Radar;

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative bg-card rounded-xl border border-border hover:-translate-y-1.5 transition-all duration-300 overflow-hidden flex flex-col justify-between h-full p-5 cursor-pointer shadow-sm theme-transition"
      style={{
        borderColor: isHovered ? `${tool.accentColor}60` : undefined,
        boxShadow: isHovered
          ? `0 0 20px -3px ${tool.accentColor}25, 0 8px 24px -6px ${tool.accentColor}20`
          : undefined,
      }}
    >
      {/* Visual Accent glow line matching WriteupCard */}
      <div
        className="absolute top-0 left-0 w-full h-[2.5px] transition-all duration-300 pointer-events-none"
        style={{
          background: isHovered
            ? `linear-gradient(90deg, ${tool.accentColor} 0%, ${tool.accentColor}50 45%, transparent 85%)`
            : `linear-gradient(90deg, ${tool.accentColor}30 0%, transparent 45%)`,
          boxShadow: isHovered ? `0 0 10px ${tool.accentColor}80` : "none",
        }}
      />

      <div>
        {/* Header: Icon, Tool Name & Category */}
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center bg-black/20 dark:bg-white/5 border transition-all duration-300 flex-shrink-0"
            style={{
              borderColor: isHovered
                ? `${tool.accentColor}70`
                : `${tool.accentColor}30`,
              backgroundColor: isHovered ? `${tool.accentColor}18` : undefined,
            }}
          >
            <Icon
              className="w-5 h-5 transition-transform duration-300 group-hover:scale-110"
              style={{ color: tool.accentColor }}
            />
          </div>
          <div>
            <h3
              className="font-mono font-bold text-base leading-tight transition-colors duration-300"
              style={{
                color: isHovered ? tool.accentColor : undefined,
              }}
            >
              {tool.name}
            </h3>
            <span
              className="text-[9.5px] font-mono font-bold uppercase tracking-widest block mt-0.5"
              style={{ color: tool.accentColor }}
            >
              {tool.category}
            </span>
          </div>
        </div>

        {/* Short Description */}
        <p className="text-xs text-muted-foreground font-sans leading-relaxed">
          {tool.description}
        </p>
      </div>
    </div>
  );
}
