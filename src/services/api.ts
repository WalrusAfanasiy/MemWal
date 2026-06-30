import type { ChatMessage, ChatResponse, PromptState, StoredMemory } from "@/types/memory";

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...init
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response.json() as Promise<T>;
}

export function sendMessage(message: string, history: ChatMessage[], prompt: string) {
  return request<ChatResponse>("/api/chat", {
    method: "POST",
    body: JSON.stringify({ message, history, prompt })
  });
}

export function loadPrompt() {
  return request<PromptState>("/api/prompt");
}

export function savePrompt(content: string) {
  return request<PromptState>("/api/prompt", {
    method: "POST",
    body: JSON.stringify({ content })
  });
}

export function loadMemories() {
  return request<StoredMemory[]>("/api/memories");
}
