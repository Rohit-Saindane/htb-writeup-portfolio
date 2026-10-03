"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X, FileText, Search } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import Logo from "./Logo";
import { openSearchModal } from "@/lib/cyberEvents";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { label: "Writeups", href: "/writeups" },
    { label: "About", href: "/about" },
  ];

  const isActive = (href: string) => pathname?.startsWith(href);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md theme-transition">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Brand Name */}
          <div className="flex-shrink-0">
            <Link 
              href="/" 
              className="text-xl font-bold font-mono tracking-wider hover:text-accent theme-transition flex items-center gap-2 group"
              id="navbar-logo-link"
            >
              <Logo className="w-6 h-6 text-accent group-hover:scale-110 transition-transform duration-300" />
              <span>Rohit Saindane</span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-6">
            <div className="flex items-baseline space-x-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium font-mono theme-transition ${
                    isActive(link.href)
                      ? "text-accent border-b-2 border-accent"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  id={`nav-link-${link.label.toLowerCase()}`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Accent Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => openSearchModal()}
                className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-card/80 hover:bg-card border border-border hover:border-accent/50 text-muted-foreground hover:text-foreground font-mono text-xs transition-all cursor-pointer shadow-sm"
                id="navbar-search-btn"
                title="Search writeups & exploit database (Ctrl+K)"
              >
                <Search className="w-3.5 h-3.5 text-accent" />
                <span className="hidden lg:inline">Search...</span>
                <kbd className="px-1.5 py-0.5 text-[10px] bg-background/80 border border-border rounded text-muted-foreground">
                  ⌘K
                </kbd>
              </button>
              <ThemeToggle />
              <a
                href="/resume.pdf"
                download
                className="flex items-center gap-2 px-4 py-2 rounded-md bg-accent text-background font-mono text-sm font-semibold hover:bg-accent-hover theme-transition cursor-pointer"
                id="resume-download-btn"
              >
                <FileText className="w-4 h-4" />
                <span>Resume</span>
              </a>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => openSearchModal()}
              className="p-2 rounded-md text-muted-foreground hover:text-foreground bg-card border border-border flex items-center justify-center cursor-pointer"
              aria-label="Search"
              id="mobile-search-btn"
            >
              <Search className="w-4 h-4 text-accent" />
            </button>
            <ThemeToggle />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-md text-muted-foreground hover:text-foreground bg-card border border-border flex items-center justify-center cursor-pointer"
              aria-label="Toggle menu"
              id="mobile-menu-toggle-btn"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="md:hidden border-b border-border bg-background px-2 pt-2 pb-4 space-y-1 sm:px-3 theme-transition">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className={`block px-3 py-2 rounded-md text-base font-medium font-mono theme-transition ${
                isActive(link.href)
                  ? "text-accent bg-border-glow"
                  : "text-muted-foreground hover:text-foreground hover:bg-card"
              }`}
              id={`mobile-nav-link-${link.label.toLowerCase()}`}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-2 px-3">
            <a
              href="/resume.pdf"
              download
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-md bg-accent text-background font-mono text-sm font-semibold hover:bg-accent-hover theme-transition cursor-pointer"
              id="mobile-resume-download-btn"
            >
              <FileText className="w-4 h-4" />
              <span>Resume</span>
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
