import React from "react";

export default function Logo({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#9fe550" />
          <stop offset="100%" stopColor="#15803d" />
        </linearGradient>
        <filter id="logo-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      {/* Outer Hexagon Shield with Glowing Effect */}
      <polygon
        points="50,10 85,28 85,72 50,90 15,72 15,28"
        stroke="url(#logo-grad)"
        strokeWidth="6"
        strokeLinejoin="round"
        filter="url(#logo-glow)"
      />
      
      {/* Sleek Inner Cyber Terminal Symbol */}
      <path
        d="M34 38 L48 50 L34 62"
        stroke="#9fe550"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Glowing cursor underscore */}
      <line
        x1="52"
        y1="62"
        x2="68"
        y2="62"
        stroke="#9fe550"
        strokeWidth="6"
        strokeLinecap="round"
      />
    </svg>
  );
}
