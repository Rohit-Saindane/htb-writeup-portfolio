// Global event dispatcher for Cyber Assistant and Search Modal interactions

export interface ActiveWriteupContext {
  machineName: string;
  os: "linux" | "windows";
  difficulty: string;
  tags: string[];
  summary: string;
}

export function openSearchModal(initialQuery = "") {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("open-cyber-search", { detail: { query: initialQuery } })
    );
  }
}

export function openAssistantWithPrompt(prompt: string, mode = "general") {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("open-cyber-assistant", { detail: { prompt, mode } })
    );
  }
}
