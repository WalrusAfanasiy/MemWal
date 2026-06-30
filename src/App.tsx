import { useEffect, useMemo, useState } from "react";
import { Header } from "./components/Header";
import { ChatPanel } from "./components/ChatPanel";
import { MemoryEngine } from "./components/MemoryEngine";
import { PersistentMemory } from "./components/PersistentMemory";
import { PromptDrawer } from "./components/PromptDrawer";
import { defaultPrompt } from "./prompts/defaultPrompt";
import { loadMemories, loadPrompt, savePrompt, sendMessage } from "./services/api";
import type { ChatMessage, MemoryEvent, PromptState, StoredMemory } from "./types/memory";

const welcomeMessage: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content:
    "**MemoryWAL is a prompt-controlled memory agent.**\n\nTell me a durable preference, project detail, or instruction. I will recall existing Walrus Memory, decide whether the new information should be stored, merged, or skipped, and show the memory operation.",
  createdAt: new Date().toISOString()
};

export function App() {
  const [messages, setMessages] = useState<ChatMessage[]>([welcomeMessage]);
  const [events, setEvents] = useState<MemoryEvent[]>([]);
  const [memories, setMemories] = useState<StoredMemory[]>([]);
  const [prompt, setPrompt] = useState<PromptState>({
    content: defaultPrompt,
    version: "Memory Policy v1.0",
    updatedAt: new Date().toISOString()
  });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [savingPrompt, setSavingPrompt] = useState(false);
  const activeHistory = useMemo(() => messages.filter((message) => message.id !== "welcome"), [messages]);

  useEffect(() => {
    void Promise.all([loadPrompt(), loadMemories()])
      .then(([promptState, memoryState]) => {
        setPrompt(promptState);
        setMemories(memoryState);
      })
      .catch(() => {
        setMemories([]);
      });
  }, []);

  async function handleSend(content: string) {
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content,
      createdAt: new Date().toISOString()
    };

    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setLoading(true);

    try {
      const response = await sendMessage(content, activeHistory, prompt.content);
      setEvents(response.events);
      setMemories(response.memories);
      setMessages((current) => [...current, response.message]);
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: `The Worker request failed: ${error instanceof Error ? error.message : "Unknown error"}`,
          createdAt: new Date().toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function handlePromptSave(content: string) {
    setSavingPrompt(true);
    try {
      setPrompt(await savePrompt(content));
      setDrawerOpen(false);
    } finally {
      setSavingPrompt(false);
    }
  }

  function handleNewSession() {
    setMessages([
      {
        ...welcomeMessage,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        content:
          memories.length > 0
            ? `New session started. I still have ${memories.length} persistent ${memories.length === 1 ? "memory" : "memories"} available for recall.`
            : welcomeMessage.content
      }
    ]);
    setEvents([]);
  }

  return (
    <div className="min-h-screen text-slate-100">
      <Header onPromptOpen={() => setDrawerOpen(true)} onNewSession={handleNewSession} />
      <main className="grid gap-4 p-4 lg:grid-cols-[minmax(320px,1.08fr)_minmax(300px,0.92fr)_minmax(280px,0.82fr)] lg:p-6">
        <ChatPanel messages={messages} loading={loading} onSend={handleSend} />
        <MemoryEngine events={events} />
        <PersistentMemory memories={memories} />
      </main>
      <PromptDrawer
        open={drawerOpen}
        prompt={prompt}
        saving={savingPrompt}
        onClose={() => setDrawerOpen(false)}
        onSave={handlePromptSave}
      />
    </div>
  );
}
