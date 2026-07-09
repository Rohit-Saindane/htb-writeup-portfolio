"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch by waiting for mount
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-9 h-9 rounded-lg bg-border-glow" />;
  }

  const isDark = theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="p-2 rounded-lg bg-card border border-border hover:border-accent hover:shadow-glow theme-transition text-foreground flex items-center justify-center cursor-pointer"
      aria-label="Toggle theme"
      id="theme-toggle-btn"
    >
      {isDark ? (
        <Sun className="w-5 h-5 text-accent hover:text-accent-hover" />
      ) : (
        <Moon className="w-5 h-5 text-accent hover:text-accent-hover" />
      )}
    </button>
  );
}
