export type MessageRole = "user" | "assistant";

export type ChatMessage = {
  id: string;
  role: MessageRole;
  content: string;
  createdAt: string;
};

export type MemoryAction = "recall" | "decision" | "remember" | "merge" | "skip";

export type MemoryEvent = {
  id: string;
  type: MemoryAction;
  title: string;
  description: string;
  reason: string;
  action: string;
  timestamp: string;
};

export type StoredMemory = {
  id: string;
  type: "Preference" | "Profile" | "Project" | "Instruction" | "Context";
  content: string;
  createdAt: string;
  status: "active" | "superseded" | "skipped";
};

export type PromptState = {
  content: string;
  version: string;
  updatedAt: string;
};

export type ChatRequest = {
  message: string;
  history: ChatMessage[];
  prompt: string;
};

export type ChatResponse = {
  message: ChatMessage;
  events: MemoryEvent[];
  memories: StoredMemory[];
};
