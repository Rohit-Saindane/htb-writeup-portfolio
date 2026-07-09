"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

interface CopyButtonProps {
  text: string;
}

export default function CopyButton({ text }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`copy-btn ${copied ? "copied" : ""} cursor-pointer`}
      aria-label="Copy code to clipboard"
      id="copy-code-btn"
    >
      {copied ? (
        <>
          <Check className="w-3.5 h-3.5" />
          <span>COPIED!</span>
        </>
      ) : (
        <>
          <Copy className="w-3.5 h-3.5" />
          <span>COPY</span>
        </>
      )}
    </button>
  );
}
