"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Terminal,
  Square,
  Bug,
  Shield,
  Wrench,
  Zap,
  Check,
  Copy,
  CornerDownLeft,
  Maximize2,
  Minimize2,
  Minus,
  X,
  Trash2,
  GripHorizontal,
  ChevronDown,
  Paperclip,
  Brain,
  Eye,
  ImageIcon,
  ExternalLink,
  ArrowUpRight,
  BookOpen,
} from "lucide-react";

interface UploadedImage {
  url: string;
  name: string;
  mimeType: string;
  base64Data: string;
  sizeKb?: number;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
  image?: UploadedImage;
}

interface WriteupContext {
  machineName?: string;
  os?: "linux" | "windows";
  difficulty?: string;
  tags?: string[];
  summary?: string;
}

interface ModeConfig {
  id: string;
  name: string;
  shortLabel: string;
  icon: React.ElementType;
  color: string;
  hexColor: string;
  accentBg: string;
  description: string;
  placeholder: string;
}

interface MemoryItem {
  id: string;
  timestamp: string;
  topic: string;
  category: string;
  insight: string;
  source: string;
}

const MODES: ModeConfig[] = [
  {
    id: "general",
    name: "General Mode",
    shortLabel: "General",
    icon: Terminal,
    color: "text-[#00e599]",
    hexColor: "#00e599",
    accentBg: "bg-[#00e599]/10 border-[#00e599]/30",
    description: "Balanced HTB research, methodology & theory",
    placeholder: "Ask Elliot about machines, concepts, or labs…",
  },
  {
    id: "explain_attack",
    name: "Attack (Red Team)",
    shortLabel: "Attack",
    icon: Zap,
    color: "text-[#ef4444]",
    hexColor: "#ef4444",
    accentBg: "bg-[#ef4444]/10 border-[#ef4444]/30",
    description: "Strictly offensive mechanics, payloads & exploit chains",
    placeholder: "Ask for attack vectors, payloads or exploit mechanics (Strictly Red)…",
  },
  {
    id: "mitigation",
    name: "Defense (Blue Team)",
    shortLabel: "Defense",
    icon: Shield,
    color: "text-[#3b82f6]",
    hexColor: "#3b82f6",
    accentBg: "bg-[#3b82f6]/10 border-[#3b82f6]/30",
    description: "Strictly detection, hardening, Sigma rules & mitigation",
    placeholder: "Ask for mitigation, detection, Sigma or hardening (Strictly Blue)…",
  },
  {
    id: "debug_error",
    name: "Debug Error",
    shortLabel: "Debug",
    icon: Bug,
    color: "text-[#eab308]",
    hexColor: "#eab308",
    accentBg: "bg-[#eab308]/10 border-[#eab308]/30",
    description: "Triage exploit crashes, broken shells & syntax bugs",
    placeholder: "Paste command error trace or exploit crash to isolate…",
  },
  {
    id: "tool_help",
    name: "Tools Arsenal",
    shortLabel: "Tools",
    icon: Wrench,
    color: "text-[#a855f7]",
    hexColor: "#a855f7",
    accentBg: "bg-[#a855f7]/10 border-[#a855f7]/30",
    description: "Syntax, flags & command-line execution for tools",
    placeholder: "Ask for tool syntax, command flags, or CLI cheat sheet…",
  },
];

const DYNAMIC_GREETINGS = [
  "Hello, friend.\n\nI'm listening. Whether you're hitting a wall with a broken exploit, hunting an elusive SUID binary, or breaking down a privilege escalation chain in your lab... I've got your back. Let's cut through the noise.",
  "What's up, man?\n\nGood to see you in the terminal. You're here to look behind the curtain, aren't you? What system, binary, or exploit chain are we analyzing today?",
  "Hey, kiddo.\n\nControl is an illusion, but privilege escalation isn't. Show me the error log, the payload, or the machine you're stuck on—we'll figure it out together.",
  "Hey, bro.\n\nTerminal is alive and ready. What's our attack vector today? Reverse shell, Kerberos ticket, web misconfiguration, or something brand new?",
  "You're looking behind the curtain, aren't you?\n\nI'm listening. Point me at the port, the packet capture, or the kernel trace—let's find the fracture point.",
  "Are you seeing this too?\n\nThe logs don't lie. Hit me with the command error or the target machine—let's strip away the noise.",
  "Glad you're here, buddy.\n\nTwo sets of eyes on a target are always better than one. Drop your exploit code, LinPEAS output, or target question whenever you're ready.",
  "The daemon never sleeps.\n\nWhether it's Active Directory bloodhound paths, memory corruption, or web exploitation, what system are we breaking down together?",
];

function getTimestamp() {
  const now = new Date();
  return now.toTimeString().slice(0, 8);
}

export default function CyberAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "init",
      role: "assistant",
      content: DYNAMIC_GREETINGS[0],
      timestamp: "00:00:01",
    },
  ]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [activeMode, setActiveMode] = useState<string>("general");
  const [isModeOpen, setIsModeOpen] = useState(false);
  const [writeupContext, setWriteupContext] = useState<WriteupContext | null>(null);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);

  // Multimodal Image Upload State
  const [pendingImage, setPendingImage] = useState<UploadedImage | null>(null);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Neural Memory Inspector State
  const [isMemoryOpen, setIsMemoryOpen] = useState(false);
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [memorySearch, setMemorySearch] = useState("");

  // Dragging state with window-level mouse & touch tracking
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ startX: 0, startY: 0, posX: 0, posY: 0 });

  const pathname = usePathname();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const modeDropdownRef = useRef<HTMLDivElement>(null);

  const activeModeMeta = MODES.find((m) => m.id === activeMode) || MODES[0];
  const ActiveIcon = activeModeMeta.icon;

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgId(id);
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  // Fetch learned memories from API
  const fetchMemories = useCallback(async () => {
    try {
      const res = await fetch("/api/assistant/memory");
      if (res.ok) {
        const data = await res.json();
        setMemories(data.memories || []);
      }
    } catch (err) {
      console.warn("Could not fetch neural memories:", err);
    }
  }, []);

  useEffect(() => {
    fetchMemories();
  }, [fetchMemories]);

  // Handle image file selection
  const processImageFile = (file: File) => {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64Data = result.split(",")[1];
      setPendingImage({
        url: result,
        name: file.name || `screenshot-${Date.now()}.png`,
        mimeType: file.type || "image/png",
        base64Data,
        sizeKb: Math.round(file.size / 1024),
      });
    };
    reader.readAsDataURL(file);
  };

  // Clipboard Paste listener (Ctrl+V screenshot support)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (!isOpen || isMinimized) return;
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith("image/")) {
          const file = items[i].getAsFile();
          if (file) {
            e.preventDefault();
            processImageFile(file);
            break;
          }
        }
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [isOpen, isMinimized]);

  // Close mode dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        modeDropdownRef.current &&
        !modeDropdownRef.current.contains(e.target as Node)
      ) {
        setIsModeOpen(false);
      }
    };
    if (isModeOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isModeOpen]);

  // Pick a fresh dynamic greeting on initial load
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * DYNAMIC_GREETINGS.length);
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].id === "init") {
        return [
          {
            ...prev[0],
            content: DYNAMIC_GREETINGS[randomIndex],
            timestamp: getTimestamp(),
          },
        ];
      }
      return prev;
    });
  }, []);

  // Global ESC key handling: maximize -> restore, normal -> minimize
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isMinimized) {
        if (zoomedImage) {
          setZoomedImage(null);
        } else if (isMemoryOpen) {
          setIsMemoryOpen(false);
        } else if (isModeOpen) {
          setIsModeOpen(false);
        } else if (isMaximized) {
          setIsMaximized(false);
        } else {
          setIsMinimized(true);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isMinimized, isMaximized, isModeOpen, isMemoryOpen, zoomedImage]);

  // Auto-scroll to bottom of terminal
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isStreaming]);

  // Detect active writeup slug from pathname
  useEffect(() => {
    const match = pathname?.match(/\/writeups\/([^\/]+)/);
    if (match && match[1]) {
      const slug = match[1];
      const machineName = slug.charAt(0).toUpperCase() + slug.slice(1);
      setWriteupContext({
        machineName,
        os: "linux",
        difficulty: "unknown",
        tags: [],
        summary: `Walkthrough for ${machineName} machine.`,
      });
    } else {
      setWriteupContext(null);
    }
  }, [pathname]);

  // Header Mouse Dragging
  const handleHeaderMouseDown = (e: React.MouseEvent) => {
    if (isMaximized) return;
    if ((e.target as HTMLElement).closest("button, input, select, a, [role='menuitem']")) return;

    e.preventDefault();
    setIsDragging(true);
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      posX: position.x,
      posY: position.y,
    };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const dx = moveEvent.clientX - dragStartRef.current.startX;
      const dy = moveEvent.clientY - dragStartRef.current.startY;

      let newX = dragStartRef.current.posX + dx;
      let newY = dragStartRef.current.posY + dy;

      if (typeof window !== "undefined") {
        const maxLeft = -(window.innerWidth - 120);
        const maxRight = 40;
        const maxUp = -(window.innerHeight - 100);
        const maxDown = 40;
        newX = Math.max(maxLeft, Math.min(newX, maxRight));
        newY = Math.max(maxUp, Math.min(newY, maxDown));
      }

      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  // Header Touch Dragging
  const handleHeaderTouchStart = (e: React.TouchEvent) => {
    if (isMaximized) return;
    if ((e.target as HTMLElement).closest("button, input, select, a, [role='menuitem']")) return;
    if (e.touches.length !== 1) return;

    const t = e.touches[0];
    setIsDragging(true);
    dragStartRef.current = {
      startX: t.clientX,
      startY: t.clientY,
      posX: position.x,
      posY: position.y,
    };

    const handleTouchMove = (moveEvent: TouchEvent) => {
      if (moveEvent.touches.length !== 1) return;
      const touch = moveEvent.touches[0];
      const dx = touch.clientX - dragStartRef.current.startX;
      const dy = touch.clientY - dragStartRef.current.startY;

      let newX = dragStartRef.current.posX + dx;
      let newY = dragStartRef.current.posY + dy;

      if (typeof window !== "undefined") {
        const maxLeft = -(window.innerWidth - 120);
        const maxRight = 40;
        const maxUp = -(window.innerHeight - 100);
        const maxDown = 40;
        newX = Math.max(maxLeft, Math.min(newX, maxRight));
        newY = Math.max(maxUp, Math.min(newY, maxDown));
      }

      setPosition({ x: newX, y: newY });
    };

    const handleTouchEnd = () => {
      setIsDragging(false);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };

    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handleTouchEnd);
  };

  const handleHeaderDoubleClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("button, input, a, select")) return;
    setIsMaximized((prev) => !prev);
  };

  // Drag and drop file listeners
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processImageFile(e.dataTransfer.files[0]);
    }
  };

  const handleSendMessage = useCallback(
    async (promptText?: string, modeOverride?: string) => {
      const text = promptText || input;
      if ((!text.trim() && !pendingImage) || isStreaming) return;

      const currentImg = pendingImage;
      setPendingImage(null);

      const userMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        content: text.trim(),
        timestamp: getTimestamp(),
        image: currentImg || undefined,
      };

      const newMessages = [...messages, userMessage];
      setMessages(newMessages);
      setInput("");
      setIsStreaming(true);

      const assistantMsgId = (Date.now() + 1).toString();
      const assistantMessage: Message = {
        id: assistantMsgId,
        role: "assistant",
        content: "",
        timestamp: getTimestamp(),
      };

      setMessages([...newMessages, assistantMessage]);

      const mode = modeOverride || activeMode;
      abortControllerRef.current = new AbortController();

      try {
        const res = await fetch("/api/assistant", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: newMessages
              .filter(
                (m) =>
                  m.id !== "init" &&
                  !m.content.startsWith("[Connection error]:") &&
                  (m.content.trim().length > 0 || m.image)
              )
              .map((m) => ({
                role: m.role,
                content: m.content,
                image: m.image
                  ? {
                      mimeType: m.image.mimeType,
                      base64Data: m.image.base64Data,
                      name: m.image.name,
                    }
                  : undefined,
              })),
            context: writeupContext,
            mode,
          }),
          signal: abortControllerRef.current.signal,
        });

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.error || `Server responded with ${res.status}`);
        }

        if (!res.body) throw new Error("No response body");

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let streamedText = "";

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          streamedText += chunk;

          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMsgId ? { ...msg, content: streamedText } : msg
            )
          );
        }

        // If response indexed new memory, refresh memory store count
        if (streamedText.includes("Neural Memory Indexed")) {
          fetchMemories();
        }
      } catch (err: unknown) {
        const isAbort = err instanceof Error && err.name === "AbortError";
        const errMsg = err instanceof Error ? err.message : "Unable to reach fsociety daemon.";

        if (isAbort) {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMsgId
                ? { ...msg, content: msg.content + "\n\n*[Transmission interrupted by operator]*" }
                : msg
            )
          );
        } else {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMsgId
                ? {
                    ...msg,
                    content: `[Connection error]: ${errMsg}`,
                  }
                : msg
            )
          );
        }
      } finally {
        setIsStreaming(false);
        abortControllerRef.current = null;
      }
    },
    [input, pendingImage, isStreaming, messages, activeMode, writeupContext, fetchMemories]
  );

  // Listen for open-cyber-assistant custom events
  useEffect(() => {
    const handleCustomOpen = (e: Event) => {
      const customEvent = e as CustomEvent<{ prompt?: string; mode?: string }>;
      setIsOpen(true);
      setIsMinimized(false);
      if (customEvent.detail?.mode) {
        setActiveMode(customEvent.detail.mode);
      }
      if (customEvent.detail?.prompt) {
        setTimeout(() => {
          handleSendMessage(customEvent.detail?.prompt, customEvent.detail?.mode);
        }, 120);
      }
    };

    window.addEventListener("open-cyber-assistant", handleCustomOpen);
    return () => window.removeEventListener("open-cyber-assistant", handleCustomOpen);
  }, [handleSendMessage]);

  const handleStopStream = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: "cleared-" + Date.now(),
        role: "assistant",
        content: "Terminal session purged. Ready for new operational parameters.",
        timestamp: getTimestamp(),
      },
    ]);
  };

  const handleDeleteMemoryItem = async (id: string) => {
    try {
      const res = await fetch(`/api/assistant/memory?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setMemories((prev) => prev.filter((m) => m.id !== id));
      }
    } catch (err) {
      console.error("Delete memory error:", err);
    }
  };

  const filteredMemories = memories.filter((m) => {
    if (!memorySearch.trim()) return true;
    const q = memorySearch.toLowerCase();
    return (
      m.topic.toLowerCase().includes(q) ||
      m.insight.toLowerCase().includes(q) ||
      m.category.toLowerCase().includes(q)
    );
  });

  return (
    <>
      {/* Hidden File Input for Image Upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            processImageFile(e.target.files[0]);
          }
        }}
      />

      {/* Zoomed Image Modal */}
      <AnimatePresence>
        {zoomedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setZoomedImage(null)}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out"
          >
            <div className="relative max-w-4xl max-h-[90vh]">
              <img
                src={zoomedImage}
                alt="Zoomed forensic screenshot"
                className="max-h-[85vh] max-w-full rounded-lg border border-border/80 shadow-2xl object-contain"
              />
              <button
                onClick={() => setZoomedImage(null)}
                className="absolute -top-3 -right-3 p-1.5 rounded-full bg-card border border-border text-foreground shadow-lg hover:scale-110 transition-transform cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Trigger Pill Button (When closed or minimized) */}
      {(!isOpen || isMinimized) && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40"
        >
          <button
            onClick={() => {
              setIsOpen(true);
              setIsMinimized(false);
            }}
            className="group relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-card dark:bg-[#0e1216] border border-border dark:border-[#20242b] text-foreground dark:text-[#e4e7eb] shadow-xl hover:shadow-2xl transition-all duration-200 cursor-pointer font-mono text-xs theme-transition"
            style={{
              borderColor: isStreaming ? `${activeModeMeta.hexColor}80` : undefined,
            }}
            id="cyber-assistant-trigger"
          >
            {/* Pulsing Status Dot */}
            <span className="relative flex h-2.5 w-2.5">
              {isStreaming ? (
                <>
                  <span
                    className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                    style={{ backgroundColor: activeModeMeta.hexColor }}
                  />
                  <span
                    className="relative inline-flex rounded-full h-2.5 w-2.5"
                    style={{ backgroundColor: activeModeMeta.hexColor }}
                  />
                </>
              ) : (
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: activeModeMeta.hexColor }}
                />
              )}
            </span>

            <div className="flex items-center gap-2">
              <span
                className="font-bold"
                style={{ color: activeModeMeta.hexColor }}
              >
                &gt;_
              </span>
              <span className="font-medium group-hover:text-accent transition-colors">
                {isStreaming ? "daemon generating…" : "daemon // fsociety"}
              </span>
            </div>

            {writeupContext?.machineName && (
              <span className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] rounded bg-muted/40 dark:bg-[#161b22] text-muted-foreground border border-border dark:border-[#20242b]">
                {writeupContext.machineName}
              </span>
            )}
          </button>
        </motion.div>
      )}

      {/* Backdrop for Maximized State */}
      <AnimatePresence>
        {isOpen && !isMinimized && isMaximized && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMaximized(false)}
            className="fixed inset-0 bg-black/60 dark:bg-black/75 backdrop-blur-sm z-40 transition-opacity"
          />
        )}
      </AnimatePresence>

      {/* Reshaped, Floatable & Maximizable Window with Dual Theme Support */}
      <AnimatePresence>
        {isOpen && !isMinimized && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.16 }}
            style={isMaximized ? { x: 0, y: 0 } : { x: position.x, y: position.y }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`fixed z-50 flex flex-col bg-card dark:bg-[#0b0d10] border border-border dark:border-[#20242b] shadow-2xl overflow-hidden text-foreground dark:text-[#e4e7eb] theme-transition ${
              isMaximized
                ? "inset-2 sm:inset-4 md:inset-6 w-auto h-auto rounded-2xl"
                : "bottom-4 right-4 sm:bottom-6 sm:right-6 w-[calc(100vw-2rem)] sm:w-[560px] md:w-[620px] h-[660px] max-h-[88vh] rounded-2xl"
            }`}
            id="cyber-assistant-hud"
          >
            {/* Drag File Overlay */}
            {isDraggingFile && (
              <div className="absolute inset-0 z-40 bg-accent/15 backdrop-blur-sm border-2 border-dashed border-accent flex flex-col items-center justify-center p-6 text-center pointer-events-none">
                <ImageIcon className="w-12 h-12 text-accent mb-3 animate-bounce" />
                <h3 className="text-base font-mono font-bold text-foreground">
                  Drop image to analyze &amp; index
                </h3>
                <p className="text-xs font-mono text-muted-foreground mt-1">
                  Terminal OCR, Nmap scans, Burp requests will be autonomously learned into neural memory
                </p>
              </div>
            )}

            {/* Top Linear Scanning Beam (Dynamic Mode Themed) */}
            {isStreaming && (
              <div className="absolute top-0 left-0 right-0 h-[2px] overflow-hidden z-30 pointer-events-none">
                <motion.div
                  initial={{ x: "-100%" }}
                  animate={{ x: "100%" }}
                  transition={{ repeat: Infinity, duration: 1.1, ease: "easeInOut" }}
                  className="w-1/2 h-full"
                  style={{
                    background: `linear-gradient(90deg, transparent, ${activeModeMeta.hexColor}, transparent)`,
                    boxShadow: `0 0 12px ${activeModeMeta.hexColor}`,
                  }}
                />
              </div>
            )}

            {/* Header / Drag Handle */}
            <div
              onMouseDown={handleHeaderMouseDown}
              onTouchStart={handleHeaderTouchStart}
              onDoubleClick={handleHeaderDoubleClick}
              className={`flex items-center justify-between px-3.5 py-2.5 bg-muted/20 dark:bg-[#101419] border-b border-border dark:border-[#20242b] select-none font-mono text-xs touch-none ${
                isMaximized ? "cursor-default" : isDragging ? "cursor-grabbing" : "cursor-grab"
              }`}
            >
              {/* Left Title & Status */}
              <div className="flex items-center gap-2 pointer-events-none">
                <span className="relative flex h-2 w-2">
                  <span
                    className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                    style={{ backgroundColor: activeModeMeta.hexColor }}
                  />
                  <span
                    className="relative inline-flex rounded-full h-2 w-2"
                    style={{ backgroundColor: activeModeMeta.hexColor }}
                  />
                </span>

                <div className="flex items-center gap-1.5 text-muted-foreground dark:text-[#8a93a1]">
                  <ActiveIcon
                    className="w-3.5 h-3.5 transition-colors duration-200"
                    style={{ color: activeModeMeta.hexColor }}
                  />
                  <span className="font-semibold text-foreground dark:text-[#e4e7eb]">daemon // fsociety</span>
                </div>

                {writeupContext?.machineName && (
                  <span className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-muted/40 dark:bg-[#161b22] text-muted-foreground border border-border dark:border-[#20242b] text-[10px]">
                    <span>target:</span>
                    <span
                      className="font-medium"
                      style={{ color: activeModeMeta.hexColor }}
                    >
                      {writeupContext.machineName}
                    </span>
                  </span>
                )}
              </div>

              {/* Middle Grab Affordance */}
              {!isMaximized && (
                <div className="hidden sm:flex items-center text-muted-foreground/60 dark:text-[#3b4452] pointer-events-none">
                  <GripHorizontal className="w-4 h-4" />
                </div>
              )}

              {/* Right Window Controls */}
              <div className="flex items-center gap-1">
                {/* Neural Memory Inspector Toggle */}
                <button
                  type="button"
                  onClick={() => setIsMemoryOpen(!isMemoryOpen)}
                  className={`p-1.5 rounded-md transition-colors cursor-pointer flex items-center gap-1 text-[10px] font-mono border ${
                    isMemoryOpen
                      ? "bg-accent/15 border-accent text-accent"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/40 border-transparent"
                  }`}
                  title="View Autonomous Neural Memories & Trained Insights"
                >
                  <Brain className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">{memories.length} memories</span>
                </button>

                <button
                  type="button"
                  onClick={handleClearHistory}
                  className="p-1.5 rounded-md text-muted-foreground hover:text-foreground dark:hover:text-[#e4e7eb] hover:bg-muted/40 dark:hover:bg-[#181d24] transition-colors cursor-pointer"
                  title="Purge session memory"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => setIsMinimized(true)}
                  className="p-1.5 rounded-md text-muted-foreground hover:text-foreground dark:hover:text-[#e4e7eb] hover:bg-muted/40 dark:hover:bg-[#181d24] transition-colors cursor-pointer"
                  title="Minimize (ESC)"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => setIsMaximized(!isMaximized)}
                  className="p-1.5 rounded-md text-muted-foreground hover:text-foreground dark:hover:text-[#e4e7eb] hover:bg-muted/40 dark:hover:bg-[#181d24] transition-colors cursor-pointer"
                  title={isMaximized ? "Restore window" : "Maximize fullscreen"}
                >
                  {isMaximized ? (
                    <Minimize2 className="w-3.5 h-3.5" />
                  ) : (
                    <Maximize2 className="w-3.5 h-3.5" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    setIsMinimized(false);
                    setIsMaximized(false);
                  }}
                  className="p-1.5 rounded-md text-muted-foreground hover:text-rose-500 hover:bg-muted/40 dark:hover:bg-[#181d24] transition-colors cursor-pointer"
                  title="Close daemon"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Neural Memory Drawer Panel (If Open) */}
            <AnimatePresence>
              {isMemoryOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border-b border-border dark:border-[#20242b] bg-background/95 dark:bg-[#090c10] p-4 font-mono text-xs space-y-3 max-h-64 overflow-y-auto"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Brain className="w-4 h-4 text-accent" />
                      <span className="font-bold text-foreground uppercase tracking-wider text-[11px]">
                        Persistent Neural Knowledge Archive ({memories.length})
                      </span>
                    </div>
                    <button
                      onClick={() => setIsMemoryOpen(false)}
                      className="text-muted-foreground hover:text-foreground text-[10px] cursor-pointer"
                    >
                      [close]
                    </button>
                  </div>

                  <input
                    type="text"
                    value={memorySearch}
                    onChange={(e) => setMemorySearch(e.target.value)}
                    placeholder="Search learned concepts, CVEs, or tools…"
                    className="w-full bg-card dark:bg-[#111418] border border-border dark:border-[#20242b] rounded px-2.5 py-1 text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:border-accent"
                  />

                  <div className="space-y-1.5">
                    {filteredMemories.length === 0 ? (
                      <div className="text-[11px] text-muted-foreground py-2 text-center">
                        No learned memories match &ldquo;{memorySearch}&rdquo;
                      </div>
                    ) : (
                      filteredMemories.map((mem) => (
                        <div
                          key={mem.id}
                          className="flex items-start justify-between gap-2 p-2 rounded bg-card dark:bg-[#0c0f13] border border-border dark:border-[#1e242d]"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-bold text-accent text-[11px]">
                                {mem.topic}
                              </span>
                              <span className="text-[9px] px-1 py-0.5 rounded bg-muted/40 text-muted-foreground uppercase">
                                {mem.category}
                              </span>
                              <span className="text-[9px] text-muted-foreground">
                                {mem.timestamp.slice(0, 10)}
                              </span>
                            </div>
                            <p className="text-[11.5px] text-foreground/90 font-sans leading-relaxed">
                              {mem.insight}
                            </p>
                          </div>
                          <button
                            onClick={() => handleDeleteMemoryItem(mem.id)}
                            className="text-muted-foreground hover:text-rose-400 p-1 cursor-pointer"
                            title="Forget memory"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Message Stream Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin bg-background/50 dark:bg-[#090b0e]">
              <div className={`${isMaximized ? "max-w-4xl mx-auto w-full px-2 sm:px-6" : "w-full"} space-y-4`}>
                {messages.map((msg, index) => {
                  const isUser = msg.role === "user";
                  const isLatestAssistant = index === messages.length - 1 && !isUser;
                  const isWaitingForFirstChunk = isLatestAssistant && isStreaming && !msg.content;

                  if (isUser) {
                    return (
                      <div key={msg.id} className="flex flex-col items-end space-y-1.5 w-full">
                        <div className="flex items-center gap-1.5 text-[10.5px] font-mono text-muted-foreground">
                          <span className="text-accent font-medium">operator</span>
                          <span>·</span>
                          <span>{msg.timestamp}</span>
                        </div>

                        {/* Uploaded User Image Card */}
                        {msg.image && (
                          <div className="relative group max-w-[85%] rounded-lg overflow-hidden border border-border dark:border-[#1e293b] bg-card dark:bg-[#111622] p-1.5 shadow-sm">
                            <img
                              src={msg.image.url}
                              alt={msg.image.name}
                              onClick={() => setZoomedImage(msg.image?.url || null)}
                              className="max-h-56 rounded object-contain cursor-zoom-in group-hover:opacity-95 transition-opacity"
                            />
                            <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground px-1 pt-1">
                              <span className="truncate max-w-[200px]">{msg.image.name}</span>
                              <span className="flex items-center gap-1 text-accent">
                                <Eye className="w-3 h-3" />
                                <span>inspect</span>
                              </span>
                            </div>
                          </div>
                        )}

                        {msg.content && (
                          <div className="px-3.5 py-2.5 rounded-xl bg-muted/40 dark:bg-[#111622] border border-border dark:border-[#1e293b] text-foreground dark:text-[#e4e7eb] font-mono text-[12.5px] leading-relaxed shadow-sm max-w-[90%] whitespace-pre-wrap">
                            {msg.content}
                          </div>
                        )}
                      </div>
                    );
                  }

                  // Assistant message waiting for first chunk
                  if (isWaitingForFirstChunk) {
                    return (
                      <div key={msg.id} className="flex flex-col space-y-1.5 w-full">
                        <div className="flex items-center gap-2 text-[10.5px] font-mono text-muted-foreground">
                          <span
                            className="w-1.5 h-1.5 rounded-full animate-ping"
                            style={{ backgroundColor: activeModeMeta.hexColor }}
                          />
                          <span
                            className="font-medium transition-colors"
                            style={{ color: activeModeMeta.hexColor }}
                          >
                            daemon:elliot
                          </span>
                          <span>·</span>
                          <span>processing query</span>
                        </div>

                        {/* Processing Process Box Styled with Selected Mode Color */}
                        <div
                          className="p-3.5 rounded-xl bg-card dark:bg-[#0c0f13] border flex items-center justify-between shadow-sm transition-all duration-300"
                          style={{
                            borderColor: `${activeModeMeta.hexColor}35`,
                            boxShadow: `0 0 16px -4px ${activeModeMeta.hexColor}20`,
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <span className="relative flex h-2.5 w-2.5">
                              <span
                                className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                                style={{ backgroundColor: activeModeMeta.hexColor }}
                              />
                              <span
                                className="relative inline-flex rounded-full h-2.5 w-2.5"
                                style={{ backgroundColor: activeModeMeta.hexColor }}
                              />
                            </span>
                            <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
                              <span className="text-foreground font-medium">analyzing query</span>
                              <span>·</span>
                              <span>querying neural core &amp; security archives…</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 font-mono text-[11px]">
                            <span
                              className="inline-block w-1.5 h-3.5 animate-pulse"
                              style={{
                                backgroundColor: activeModeMeta.hexColor,
                                boxShadow: `0 0 8px ${activeModeMeta.hexColor}`,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  }

                  // Assistant message with content
                  return (
                    <div key={msg.id} className="flex flex-col space-y-1.5 w-full">
                      <div className="flex items-center justify-between text-[10.5px] font-mono text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <span
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: activeModeMeta.hexColor }}
                          />
                          <span
                            className="font-medium"
                            style={{ color: activeModeMeta.hexColor }}
                          >
                            daemon:elliot
                          </span>
                          <span>·</span>
                          <span>{msg.timestamp}</span>
                        </div>

                        {!isStreaming && msg.content && (
                          <button
                            type="button"
                            onClick={() => handleCopyMessage(msg.id, msg.content)}
                            className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] text-muted-foreground hover:text-foreground dark:hover:text-[#e4e7eb] hover:bg-muted/30 border border-transparent hover:border-border transition-colors cursor-pointer"
                            title="Copy response"
                          >
                            {copiedMsgId === msg.id ? (
                              <>
                                <Check
                                  className="w-2.5 h-2.5"
                                  style={{ color: activeModeMeta.hexColor }}
                                />
                                <span style={{ color: activeModeMeta.hexColor }}>copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-2.5 h-2.5" />
                                <span>copy</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>

                      <div className="p-4 rounded-xl bg-card dark:bg-[#0c0f13] border border-border dark:border-[#1b2028] text-foreground dark:text-[#e4e7eb] text-[13px] leading-relaxed shadow-sm">
                        <TerminalMessageContent
                          content={msg.content}
                          isStreaming={isStreaming && isLatestAssistant}
                        />
                      </div>
                    </div>
                  );
                })}

                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input Console Bar with Image Staging & Mode Selector */}
            <div className="p-3 bg-muted/20 dark:bg-[#101419] border-t border-border dark:border-[#20242b] space-y-2">
              <div className={`${isMaximized ? "max-w-4xl mx-auto w-full px-2 sm:px-6" : "w-full"} space-y-2`}>
                {/* Image Staging Preview Bar (When an image is attached) */}
                <AnimatePresence>
                  {pendingImage && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 6 }}
                      className="flex items-center justify-between p-2 rounded-lg bg-card dark:bg-[#111418] border border-border dark:border-[#20242b] text-xs font-mono"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={pendingImage.url}
                          alt="Staged upload"
                          className="w-8 h-8 rounded object-cover border border-border flex-shrink-0"
                        />
                        <div className="min-w-0 truncate">
                          <span className="font-medium text-foreground truncate block">
                            {pendingImage.name}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {pendingImage.sizeKb} KB · ready to analyze &amp; train
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setPendingImage(null)}
                        className="p-1 text-muted-foreground hover:text-rose-500 transition-colors cursor-pointer"
                        title="Remove image"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Form Input Line with Dropdown Selector & File Attachment Button */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex items-center gap-2"
                >
                  <div className="relative flex-1 flex items-center bg-card dark:bg-[#0b0d10] border border-border dark:border-[#20242b] rounded-xl pl-2 pr-3 py-1.5 transition-colors focus-within:border-accent">
                    {/* Mode Dropdown Selector Trigger Button */}
                    <div className="relative" ref={modeDropdownRef}>
                      <button
                        type="button"
                        onClick={() => setIsModeOpen(!isModeOpen)}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border font-mono text-[11px] transition-all cursor-pointer mr-2 select-none"
                        style={{
                          backgroundColor: isModeOpen ? `${activeModeMeta.hexColor}15` : "transparent",
                          borderColor: isModeOpen ? `${activeModeMeta.hexColor}60` : "var(--border)",
                          color: "inherit",
                        }}
                        id="mode-dropdown-trigger"
                        title="Change operational mode"
                      >
                        <ActiveIcon
                          className="w-3.5 h-3.5 transition-colors"
                          style={{ color: activeModeMeta.hexColor }}
                        />
                        <span className="font-medium hidden sm:inline">{activeModeMeta.shortLabel}</span>
                        <ChevronDown
                          className="w-3 h-3 text-muted-foreground transition-transform duration-150"
                          style={{
                            transform: isModeOpen ? "rotate(180deg)" : "rotate(0deg)",
                            color: isModeOpen ? activeModeMeta.hexColor : undefined,
                          }}
                        />
                      </button>

                      {/* Dropdown Menu */}
                      <AnimatePresence>
                        {isModeOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: 8, scale: 0.96 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 8, scale: 0.96 }}
                            transition={{ duration: 0.15 }}
                            className="absolute bottom-full left-0 mb-2 w-64 sm:w-72 bg-card dark:bg-[#0c0f13] border border-border dark:border-[#242c38] rounded-xl shadow-2xl overflow-hidden z-50 p-1.5 font-mono text-xs"
                          >
                            <div className="px-2.5 py-1.5 text-[10px] text-muted-foreground uppercase tracking-wider font-semibold border-b border-border dark:border-[#1c222b] mb-1 flex items-center justify-between">
                              <span>Operational Mode</span>
                              <span
                                className="text-[9px] lowercase font-normal"
                                style={{ color: activeModeMeta.hexColor }}
                              >
                                strictly enforced
                              </span>
                            </div>

                            <div className="space-y-1">
                              {MODES.map((m) => {
                                const isSelected = activeMode === m.id;
                                const ModeIcon = m.icon;
                                return (
                                  <button
                                    key={m.id}
                                    type="button"
                                    onClick={() => {
                                      setActiveMode(m.id);
                                      setIsModeOpen(false);
                                    }}
                                    className="w-full flex items-start gap-2.5 px-2.5 py-2 rounded-lg transition-all text-left cursor-pointer border"
                                    style={
                                      isSelected
                                        ? {
                                            backgroundColor: `${m.hexColor}15`,
                                            borderColor: `${m.hexColor}50`,
                                            color: "inherit",
                                          }
                                        : {
                                            backgroundColor: "transparent",
                                            borderColor: "transparent",
                                            color: "inherit",
                                          }
                                    }
                                  >
                                    <ModeIcon
                                      className="w-4 h-4 mt-0.5 flex-shrink-0"
                                      style={{
                                        color: isSelected ? m.hexColor : "var(--muted-foreground)",
                                      }}
                                    />
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center justify-between">
                                        <span className="text-[11.5px] font-medium text-foreground">
                                          {m.name}
                                        </span>
                                        {isSelected && (
                                          <Check
                                            className="w-3 h-3"
                                            style={{ color: m.hexColor }}
                                          />
                                        )}
                                      </div>
                                      <div className="text-[10px] text-muted-foreground mt-0.5 leading-snug">
                                        {m.description}
                                      </div>
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Image Attachment Button */}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="p-1.5 mr-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors cursor-pointer"
                      title="Attach image or paste via Ctrl+V"
                    >
                      <Paperclip className="w-3.5 h-3.5" />
                    </button>

                    {/* Text Input */}
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder={pendingImage ? "Ask Elliot to analyze this image…" : activeModeMeta.placeholder}
                      className="w-full bg-transparent text-foreground placeholder-muted-foreground font-mono text-xs focus:outline-none pl-1"
                      disabled={isStreaming}
                      id="cyber-assistant-input"
                    />
                  </div>

                  {isStreaming ? (
                    <button
                      type="button"
                      onClick={handleStopStream}
                      className="px-3.5 py-2.5 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 border border-rose-500/40 transition-colors cursor-pointer text-xs font-mono flex items-center gap-1.5"
                      title="Stop transmission"
                    >
                      <Square className="w-3.5 h-3.5 fill-current" />
                      <span className="hidden sm:inline">abort</span>
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={!input.trim() && !pendingImage}
                      className="px-3.5 py-2.5 rounded-xl border transition-all cursor-pointer text-xs font-mono flex items-center gap-1 disabled:opacity-30 disabled:cursor-not-allowed"
                      style={
                        input.trim() || pendingImage
                          ? {
                              backgroundColor: `${activeModeMeta.hexColor}20`,
                              borderColor: `${activeModeMeta.hexColor}70`,
                              color: activeModeMeta.hexColor,
                              boxShadow: `0 0 12px ${activeModeMeta.hexColor}30`,
                            }
                          : {
                              backgroundColor: "transparent",
                              borderColor: "var(--border)",
                              color: "var(--muted-foreground)",
                            }
                      }
                      title="Transmit command"
                      id="cyber-assistant-send-btn"
                    >
                      <CornerDownLeft className="w-3.5 h-3.5" />
                    </button>
                  )}
                </form>

                {/* Status Footer */}
                <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground px-0.5">
                  <span className="flex items-center gap-1.5">
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: activeModeMeta.hexColor }}
                    />
                    <span>
                      mode:{" "}
                      <strong
                        className="font-medium"
                        style={{ color: activeModeMeta.hexColor }}
                      >
                        {activeModeMeta.shortLabel}
                      </strong>{" "}
                      (strictly active)
                    </span>
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="hidden sm:inline text-[9.5px]">paste images via Ctrl+V</span>
                    <span>{isMaximized ? "Esc to restore" : "Esc to minimize"}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/**
 * Clean Terminal Markdown & Code Block Formatter with Dual Theme Support
 */
function TerminalMessageContent({
  content,
  isStreaming,
}: {
  content: string;
  isStreaming?: boolean;
}) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyCode = (code: string, idx: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const parts = content.split(/(```[\s\S]*?```)/g);

  return (
    <div className="space-y-2.5 leading-relaxed font-sans text-[13px]">
      {parts.map((part, idx) => {
        if (part.startsWith("```")) {
          const match = part.match(/```(\w+)?\n?([\s\S]*?)```/);
          const lang = match ? match[1] || "bash" : "text";
          const code = match ? match[2].trim() : part.slice(3, -3).trim();

          return (
            <div
              key={idx}
              className="my-2.5 rounded-lg border border-border dark:border-[#1e242d] bg-muted/40 dark:bg-[#080b0e] overflow-hidden font-mono text-xs shadow-inner"
            >
              <div className="flex items-center justify-between px-3 py-1.5 bg-muted/30 dark:bg-[#0f1318] border-b border-border dark:border-[#1c222b] text-[10px] text-muted-foreground">
                <span className="font-semibold uppercase tracking-wider">{lang}</span>
                <button
                  type="button"
                  onClick={() => copyCode(code, idx)}
                  className="flex items-center gap-1 hover:text-accent transition-colors cursor-pointer"
                >
                  {copiedIndex === idx ? (
                    <>
                      <Check className="w-3 h-3 text-accent" />
                      <span className="text-accent font-semibold">copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>copy</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-3 overflow-x-auto text-[12px] leading-relaxed text-foreground dark:text-[#d1d5db]">
                <code>{code}</code>
              </pre>
            </div>
          );
        }

        // Render standard markdown lines, bolding, blockquotes, and lists
        const lines = part.split("\n");
        return (
          <div key={idx} className="space-y-1.5">
            {lines.map((line, lIdx) => {
              if (!line.trim()) return <div key={lIdx} className="h-1" />;

              // Blockquotes (e.g. Neural Memory Indexed blocks)
              if (line.startsWith("> ")) {
                return (
                  <blockquote
                    key={lIdx}
                    className="border-l-2 border-accent bg-accent/10 px-3 py-1.5 rounded-r text-foreground text-xs font-mono my-2"
                  >
                    {formatInline(line.slice(2))}
                  </blockquote>
                );
              }

              // Headings (#, ##, ###)
              if (line.startsWith("# ")) {
                return (
                  <h3 key={lIdx} className="font-bold text-foreground mt-3 mb-1 font-mono text-sm">
                    {formatInline(line.slice(2))}
                  </h3>
                );
              }
              if (line.startsWith("## ")) {
                return (
                  <h4 key={lIdx} className="font-bold text-foreground mt-3 mb-1 font-mono text-xs">
                    {formatInline(line.slice(3))}
                  </h4>
                );
              }
              if (line.startsWith("### ")) {
                return (
                  <h4 key={lIdx} className="font-bold text-foreground mt-3 mb-1 font-mono text-xs">
                    {formatInline(line.slice(4))}
                  </h4>
                );
              }

              // Bullet points
              if (line.startsWith("* ") || line.startsWith("- ")) {
                return (
                  <div key={lIdx} className="flex items-start gap-2 pl-2">
                    <span className="text-accent select-none mt-1 text-[8px]">●</span>
                    <span className="flex-1">{formatInline(line.slice(2))}</span>
                  </div>
                );
              }

              return <p key={lIdx} className="m-0">{formatInline(line)}</p>;
            })}
          </div>
        );
      })}

      {isStreaming && (
        <span className="inline-block w-1.5 h-3.5 bg-accent animate-pulse ml-0.5 align-middle" />
      )}
    </div>
  );
}

function formatInline(text: string): React.ReactNode {
  // Regex matches markdown links [title](url), standalone URLs (https://...), backtick code `code`, and bold **text**
  const parts = text.split(/(\[[^\]]+\]\([^)]+\)|https?:\/\/[^\s<>)\]]+|`[^`]+`|\*\*[^*]+\*\*)/g);
  return parts.map((seg, i) => {
    // 1. Markdown links [title](url)
    if (seg.startsWith("[") && seg.includes("](") && seg.endsWith(")")) {
      const match = seg.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (match) {
        const label = match[1];
        const rawUrl = match[2].trim();

        let isInternalWriteup = false;
        let targetUrl = rawUrl;

        if (rawUrl.startsWith("/writeups/") || rawUrl.startsWith("#")) {
          isInternalWriteup = true;
        } else if (
          rawUrl.includes("hackthebox.com/writeups/") ||
          rawUrl.includes("hackthebox.eu/writeups/")
        ) {
          // Model hallucinated hackthebox.com domain for local writeup
          const idx = rawUrl.indexOf("/writeups/");
          targetUrl = rawUrl.substring(idx);
          isInternalWriteup = true;
        } else if (rawUrl.startsWith("/") && !rawUrl.startsWith("//")) {
          isInternalWriteup = true;
        }

        if (isInternalWriteup) {
          const handleInternalClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
            const [targetPath, targetHash] = targetUrl.split("#");
            // If already on the target writeup page, smooth scroll immediately
            if (targetHash && (window.location.pathname === targetPath || !targetPath)) {
              e.preventDefault();
              window.history.pushState(null, "", `#${targetHash}`);
              const cleanId = targetHash.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
              let el =
                document.getElementById(targetHash) ||
                document.getElementById(cleanId) ||
                document.getElementById(targetHash.replace(/-+/g, "-"));

              // Fuzzy match heading if not found by exact ID
              if (!el) {
                const headings = document.querySelectorAll("h1, h2, h3, h4");
                for (const h of Array.from(headings)) {
                  const hId = h.id ? h.id.toLowerCase().replace(/-+/g, "-") : "";
                  const hText = (h.textContent || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
                  if (hId === cleanId || hText === cleanId || hId.includes(cleanId) || cleanId.includes(hId)) {
                    el = h as HTMLElement;
                    break;
                  }
                }
              }

              if (el) {
                const navOffset = 90;
                const offsetPosition = el.getBoundingClientRect().top + window.pageYOffset - navOffset;
                window.scrollTo({ top: Math.max(0, offsetPosition), behavior: "smooth" });
              }
            }
          };

          const cleanLabel = (label || "")
            .replace(/^[\s⚡🔗👉🚀📌\u26A1\uFE0F]+/, "")
            .replace(/^Jump to\s+/i, "")
            .replace(/^Link to\s+/i, "")
            .replace(/\s*Writeup\s*[-—:]\s*/i, " · ")
            .trim();

          return (
            <a
              key={i}
              href={targetUrl}
              onClick={handleInternalClick}
              className="inline-flex items-center gap-2 px-3 py-1.5 my-1.5 rounded-lg border border-border/70 dark:border-[#202732] bg-card/60 dark:bg-[#0d1219] hover:bg-card dark:hover:bg-[#141a24] hover:border-accent/40 text-foreground transition-all duration-150 cursor-pointer shadow-xs group no-underline align-middle max-w-full"
              title={`View writeup: ${cleanLabel}`}
            >
              <BookOpen className="w-3.5 h-3.5 text-accent/80 group-hover:text-accent shrink-0 transition-colors" />
              <span className="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-accent/10 text-accent font-semibold border border-accent/20 shrink-0">
                Writeup
              </span>
              <span className="text-xs font-medium text-foreground/90 dark:text-zinc-200 group-hover:text-foreground transition-colors truncate">
                {cleanLabel}
              </span>
              <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground/60 group-hover:text-accent group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0 ml-0.5" />
            </a>
          );
        }

        // External Link: Render in vibrant Cyber Blue to indicate external destination
        return (
          <a
            key={i}
            href={rawUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 font-medium underline underline-offset-2 decoration-blue-500/60 hover:decoration-blue-500 transition-colors align-baseline group cursor-pointer"
            title={`External resource: ${rawUrl}`}
          >
            <span className="group-hover:underline">{label}</span>
            <ExternalLink className="w-3 h-3 text-blue-500 dark:text-blue-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform shrink-0" />
          </a>
        );
      }
    }

    // 2. Standalone HTTP/HTTPS URLs (auto-link in clickable Cyber Blue)
    if (seg.startsWith("http://") || seg.startsWith("https://")) {
      const cleanUrl = seg.replace(/[.,;!?]+$/, "");
      if (cleanUrl.includes("hackthebox.com/writeups/") || cleanUrl.includes("hackthebox.eu/writeups/")) {
        const idx = cleanUrl.indexOf("/writeups/");
        const targetUrl = cleanUrl.substring(idx);
        const [targetPath, targetHash] = targetUrl.split("#");
        const rawLabel = targetHash ? targetHash.replace(/-/g, " ") : targetPath;
        const cleanLabel = rawLabel
          .replace(/^[\s⚡🔗👉🚀📌\u26A1\uFE0F]+/, "")
          .replace(/^Jump to\s+/i, "")
          .replace(/^Link to\s+/i, "")
          .replace(/\s*Writeup\s*[-—:]\s*/i, " · ")
          .trim();

        const handleInternalClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
          if (targetHash && (window.location.pathname === targetPath || !targetPath)) {
            e.preventDefault();
            window.history.pushState(null, "", `#${targetHash}`);
            const cleanId = targetHash.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
            const el =
              document.getElementById(targetHash) ||
              document.getElementById(cleanId) ||
              document.getElementById(targetHash.replace(/-+/g, "-"));

            if (el) {
              const navOffset = 90;
              const offsetPosition = el.getBoundingClientRect().top + window.pageYOffset - navOffset;
              window.scrollTo({ top: Math.max(0, offsetPosition), behavior: "smooth" });
            }
          }
        };

        return (
          <a
            key={i}
            href={targetUrl}
            onClick={handleInternalClick}
            className="inline-flex items-center gap-2 px-3 py-1.5 my-1.5 rounded-lg border border-border/70 dark:border-[#202732] bg-card/60 dark:bg-[#0d1219] hover:bg-card dark:hover:bg-[#141a24] hover:border-accent/40 text-foreground transition-all duration-150 cursor-pointer shadow-xs group no-underline align-middle max-w-full"
            title={`View writeup: ${cleanLabel}`}
          >
            <BookOpen className="w-3.5 h-3.5 text-accent/80 group-hover:text-accent shrink-0 transition-colors" />
            <span className="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-accent/10 text-accent font-semibold border border-accent/20 shrink-0">
              Writeup
            </span>
            <span className="text-xs font-medium text-foreground/90 dark:text-zinc-200 group-hover:text-foreground transition-colors truncate capitalize">
              {cleanLabel}
            </span>
            <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground/60 group-hover:text-accent group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0 ml-0.5" />
          </a>
        );
      }

      return (
        <a
          key={i}
          href={cleanUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 font-medium underline underline-offset-2 decoration-blue-500/60 hover:decoration-blue-500 transition-colors align-baseline group cursor-pointer"
          title={`External resource: ${cleanUrl}`}
        >
          <span className="group-hover:underline break-all">{cleanUrl}</span>
          <ExternalLink className="w-3 h-3 text-blue-500 dark:text-blue-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform shrink-0" />
        </a>
      );
    }

    // Inline Code `code`
    if (seg.startsWith("`") && seg.endsWith("`")) {
      return (
        <code
          key={i}
          className="px-1.5 py-0.5 rounded bg-muted/60 dark:bg-[#161b22] border border-border/80 dark:border-[#20242b] text-[11px] font-mono text-accent font-semibold mx-0.5"
        >
          {seg.slice(1, -1)}
        </code>
      );
    }

    // Bold **text**
    if (seg.startsWith("**") && seg.endsWith("**")) {
      return (
        <strong key={i} className="font-bold text-foreground">
          {seg.slice(2, -2)}
        </strong>
      );
    }

    return seg;
  });
}
