import { MDXRemote } from "next-mdx-remote/rsc";
import React from "react";
import CopyButton from "./CopyButton";

interface MdxComponentProps {
  children?: React.ReactNode;
}

interface MdxLinkProps {
  href?: string;
  children?: React.ReactNode;
}

// Custom heading elements with styling and anchor links
const H1 = ({ children }: MdxComponentProps) => (
  <h1 className="text-3xl font-bold font-mono tracking-tight text-foreground mt-8 mb-4 border-b border-border pb-2">
    {children}
  </h1>
);

const H2 = ({ children }: MdxComponentProps) => {
  // Generate an ID for Table of Contents tracking
  const id = children?.toString().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "") || "";
  
  return (
    <h2 id={id} className="text-2xl font-bold font-mono text-foreground mt-8 mb-3 flex items-center gap-2 group scroll-mt-20">
      <span className="text-accent select-none">##</span>
      <span>{children}</span>
    </h2>
  );
};

const H3 = ({ children }: MdxComponentProps) => (
  <h3 className="text-xl font-bold font-mono text-foreground mt-6 mb-2">
    {children}
  </h3>
);

interface MdxParagraphProps extends React.HTMLAttributes<HTMLParagraphElement> {
  align?: string;
}

const P = ({ children, align, ...props }: MdxParagraphProps) => {
  const alignClass = align === "center" ? "text-center" : align === "right" ? "text-right" : "";
  return (
    <p {...props} className={`text-base text-muted-foreground leading-relaxed font-sans mb-4 ${alignClass}`}>
      {children}
    </p>
  );
};

const UL = ({ children }: MdxComponentProps) => (
  <ul className="list-disc list-inside space-y-1.5 mb-4 text-muted-foreground font-sans pl-2">
    {children}
  </ul>
);

const OL = ({ children }: MdxComponentProps) => (
  <ol className="list-decimal list-inside space-y-1.5 mb-4 text-muted-foreground font-sans pl-2">
    {children}
  </ol>
);

const LI = ({ children }: MdxComponentProps) => (
  <li className="text-base text-muted-foreground leading-relaxed pl-1">
    {children}
  </li>
);

const A = ({ href, children }: MdxLinkProps) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="text-accent hover:text-accent-hover underline underline-offset-4 theme-transition cursor-pointer"
  >
    {children}
  </a>
);

const Blockquote = ({ children }: MdxComponentProps) => (
  <blockquote className="border-l-4 border-accent bg-card/40 px-4 py-3 my-4 italic text-muted-foreground rounded-r">
    {children}
  </blockquote>
);

// Helper for basic shell/bash syntax prompt highlighting
function highlightPrompt(code: string, language: string): React.ReactNode {
  if (language === "bash" || language === "shell" || language === "sh" || language === "text") {
    const lines = code.split("\n");
    return lines.map((line, index) => {
      if (line.startsWith("$ ")) {
        return (
          <div key={index} className="line">
            <span className="command-prompt">$ </span>
            {line.substring(2)}
          </div>
        );
      }
      if (line.startsWith("# ")) {
        return (
          <div key={index} className="line">
            <span className="command-prompt"># </span>
            {line.substring(2)}
          </div>
        );
      }
      return <div key={index} className="line">{line}</div>;
    });
  }
  return code;
}

// Custom Pre block acting as simulated Unix Terminal
const Pre = ({ children }: MdxComponentProps) => {
  const codeProps = (children as React.ReactElement)?.props || {};
  const codeText = codeProps.children || "";
  const className = codeProps.className || "";
  const language = className.replace(/language-/, "") || "bash";

  return (
    <div className="terminal-window border border-border rounded-xl my-6 bg-[#0c0f12] overflow-hidden shadow-lg">
      <div className="terminal-header bg-[#12161a] border-b border-border/80 px-4 py-2 flex items-center justify-between">
        <div className="terminal-dots flex gap-1.5">
          <div className="terminal-dot red w-3 h-3 rounded-full bg-[#ff5f56]" />
          <div className="terminal-dot yellow w-3 h-3 rounded-full bg-[#ffbd2e]" />
          <div className="terminal-dot green w-3 h-3 rounded-full bg-[#27c93f]" />
        </div>
        <div className="terminal-title text-[11px] font-mono text-muted-foreground uppercase tracking-wider">
          {language}
        </div>
        <CopyButton text={codeText.trim()} />
      </div>
      <div className="terminal-content">
        <pre className="terminal-pre p-4 overflow-x-auto text-[13px] font-mono leading-relaxed text-slate-200">
          <code className={`terminal-code ${className}`}>
            {highlightPrompt(codeText, language)}
          </code>
        </pre>
      </div>
    </div>
  );
};

const components = {
  h1: H1,
  h2: H2,
  h3: H3,
  p: P,
  ul: UL,
  ol: OL,
  li: LI,
  a: A,
  blockquote: Blockquote,
  pre: Pre,
};

interface MdxContentProps {
  source: string;
}

export default function MdxContent({ source }: MdxContentProps) {
  return (
    <div className="mdx-content prose dark:prose-invert max-w-none">
      <MDXRemote source={source} components={components} />
    </div>
  );
}
