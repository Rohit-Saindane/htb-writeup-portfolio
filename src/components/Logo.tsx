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
        {/* Purple Sigil Rich High Contrast Gradient */}
        <linearGradient id="purple-sigil-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#d8b4fe" />
          <stop offset="50%" stopColor="#c084fc" />
          <stop offset="100%" stopColor="#9333ea" />
        </linearGradient>

        <linearGradient id="purple-sigil-dark" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#9333ea" />
          <stop offset="100%" stopColor="#581c87" />
        </linearGradient>

        <filter id="sigil-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <g filter="url(#sigil-glow)" stroke="url(#purple-sigil-grad)" strokeLinecap="round" strokeLinejoin="round">
        {/* Outer Ring with lateral horizontal pointed wings and top gap */}
        <path
          d="M 40 13 C 22 17 8 32 8 50 C 8 50 3 50 1 50 C 3 50 8 50 8 50 C 8 68 22 83 40 87 M 60 13 C 78 17 92 32 92 50 C 92 50 97 50 99 50 C 97 50 92 50 92 50 C 92 68 78 83 60 87"
          strokeWidth="4.5"
        />

        {/* Middle Ring with top gap */}
        <path
          d="M 38 23 C 26 28 17 38 17 50 C 17 68 32 80 50 80 C 68 80 83 68 83 50 C 83 38 74 28 62 23"
          strokeWidth="4.5"
        />

        {/* Inner Ring with bottom gap */}
        <path
          d="M 34 67 C 28 61 24 53 24 44 C 24 30 36 18 50 18 C 64 18 76 30 76 44 C 76 53 72 61 66 67"
          strokeWidth="4.5"
        />

        {/* Central Core Eye Circle */}
        <circle cx="50" cy="44" r="10" strokeWidth="4.5" />
        <circle cx="50" cy="44" r="4.5" fill="url(#purple-sigil-grad)" stroke="none" />
      </g>
    </svg>
  );
}


