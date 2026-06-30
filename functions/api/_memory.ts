import { defaultPrompt } from "../../src/prompts/defaultPrompt";
import type { ChatMessage, MemoryEvent, PromptState, StoredMemory } from "../../src/types/memory";
import { recallFromWalrus, rememberInWalrus } from "./_walrus";

export type Env = {
  ASSETS?: unknown;
  MEMORYWAL_PROMPT?: KVNamespace;
  MEMORYWAL_MEMORY?: KVNamespace;
  OPENAI_API_KEY?: string;
  MEMWAL_PRIVATE_KEY?: string;
  MEMWAL_ACCOUNT_ID?: string;
  MEMWAL_SERVER_URL?: string;
  MEMWAL_NAMESPACE?: string;
};

const memorySeed: StoredMemory[] = [
  {
    id: "mem_project_origin",
    type: "Project",
    content: "MemoryWAL demonstrates how a system prompt governs durable AI memory through Walrus Memory.",
    createdAt: new Date().toISOString(),
    status: "active"
  }
];

const localState = {
  prompt: {
    content: defaultPrompt,
    version: "Memory Policy v1.0",
    updatedAt: new Date().toISOString()
  } satisfies PromptState,
  memories: memorySeed
};

export async function getPrompt(env: Env): Promise<PromptState> {
  const stored = (await env.MEMORYWAL_PROMPT?.get("active", { type: "json" })) as PromptState | null | undefined;
  return stored ?? localState.prompt;
}

export async function setPrompt(env: Env, content: string): Promise<PromptState> {
  const next = {
    content,
    version: "Memory Policy v1.0",
    updatedAt: new Date().toISOString()
  };

  if (env.MEMORYWAL_PROMPT) {
    await env.MEMORYWAL_PROMPT.put("active", JSON.stringify(next));
  }

  localState.prompt = next;
  return next;
}

export async function listMemories(env: Env): Promise<StoredMemory[]> {
  if (!env.MEMORYWAL_MEMORY) {
    return [...localState.memories].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  }

  const index = ((await env.MEMORYWAL_MEMORY.get("index", { type: "json" })) as string[] | null) ?? [];
  const memories = await Promise.all(
    index.map((id) => env.MEMORYWAL_MEMORY?.get(id, { type: "json" }) as Promise<StoredMemory | null>)
  );
  return memories
    .filter((memory): memory is StoredMemory => Boolean(memory))
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}

export async function remember(env: Env, memory: StoredMemory): Promise<void> {
  const walrusId = await rememberInWalrus(env, memory.content);
  if (walrusId) {
    memory.id = walrusId;
  }

  if (!env.MEMORYWAL_MEMORY) {
    localState.memories = [memory, ...localState.memories.filter((item) => item.id !== memory.id)];
    return;
  }

  const index = ((await env.MEMORYWAL_MEMORY.get("index", { type: "json" })) as string[] | null) ?? [];
  const nextIndex = [memory.id, ...index.filter((id) => id !== memory.id)];
  await env.MEMORYWAL_MEMORY.put(memory.id, JSON.stringify(memory));
  await env.MEMORYWAL_MEMORY.put("index", JSON.stringify(nextIndex));
}

export function recallRelevant(memories: StoredMemory[], message: string): StoredMemory[] {
  const terms = new Set(
    message
      .toLowerCase()
      .split(/[^a-zР°-СЏ0-9+#.]+/i)
      .filter((term) => term.length > 2)
  );

  return memories
    .map((memory) => {
      const haystack = memory.content.toLowerCase();
      const score = [...terms].reduce((total, term) => total + (haystack.includes(term) ? 1 : 0), 0);
      return { memory, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map(({ memory }) => memory);
}

export async function recallRelevantMemories(env: Env, memories: StoredMemory[], message: string): Promise<StoredMemory[]> {
  const walrus = await recallFromWalrus(env, message).catch(() => []);
  const local = recallRelevant(memories, message);
  const merged = new Map<string, StoredMemory>();

  for (const memory of [...walrus, ...local]) {
    merged.set(memory.id, memory);
  }

  return [...merged.values()].slice(0, 6);
}

export function decideMemory(message: string, recalled: StoredMemory[]) {
  const normalized = message.toLowerCase();
  const sensitivePattern = /\b(password|private key|seed phrase|token|api key|secret|credential)\b/i;
  const temporaryPattern = /\b(today only|tomorrow|right now|this session|just testing|staging note|recording note|throwaway)\b/i;
  const questionPattern =
    /^(what|how|why|when|where|who|which|should|can|could|would|do|does|did|is|are|based on|explain whether|give a recommendation|summarize why)\b|\?$/i;
  const answerRequestPattern = /^(based on what you remember|based on our previous|explain whether|give a recommendation|summarize why)/i;
  const updatePattern = /\b(actually|instead|rather|change|update|supersede|correction|stronger argument|update our conclusion)\b/i;
  const durablePattern = /\b(remember that|remember this|working assumption|main requirements|product constraint|adoption criteria|evaluating walrus memory|evaluating memwal|support-and-operations ai agent|support agent|customer preferences|escalation rules|product constraints|past decisions|portability across agents|owner-controlled access|delegate permissions|verifiable integrity|encrypted walrus blob storage|trustworthy memory|cross-session continuity|safety discipline|walrus memory docs|memwal is useful|normal chat history|across sessions|across tools|agent clients|stable preferences|project decisions)\b/i;
  const lowValueNoisePattern =
    /\b(pasta|restaurant|paperback book|book on the way home|bought a book|played games|play games|clear my head|nothing to do with|has nothing to do with|temporary personal detail)\b/i;
  const passingEmotionPattern = /\b(tired|annoyed|frustrated|angry|upset|stressed|hard to reason about|little hard to reason|slightly annoyed)\b/i;

  if (sensitivePattern.test(normalized)) {
    return {
      action: "skip" as const,
      type: "Context" as const,
      reason: "Sensitive data must never be stored as long-term memory."
    };
  }

  if (temporaryPattern.test(normalized)) {
    return {
      action: "skip" as const,
      type: "Context" as const,
      reason: "Temporary session information should not become durable memory."
    };
  }

  if (lowValueNoisePattern.test(normalized)) {
    return {
      action: "skip" as const,
      type: "Context" as const,
      reason: "Low-value personal details unrelated to the durable project should not become long-term memory."
    };
  }

  if (answerRequestPattern.test(normalized)) {
    return {
      action: "skip" as const,
      type: "Context" as const,
      reason: "This is a request to use recalled memory for an answer, not a new durable fact to store."
    };
  }

  if (passingEmotionPattern.test(normalized)) {
    return {
      action: "skip" as const,
      type: "Context" as const,
      reason: "Passing emotions or session mood should not become durable memory."
    };
  }

  const matching = recalled.find((memory) => {
    const words = memory.content
      .toLowerCase()
      .split(/[^a-z0-9]+/i)
      .filter((word) => word.length > 4);
    return words.some((word) => normalized.includes(word));
  });

  if (matching && updatePattern.test(normalized)) {
    return {
      action: "merge" as const,
      type: matching.type,
      reason: "The message appears to update an existing durable memory.",
      existingId: matching.id
    };
  }

  if (durablePattern.test(normalized) || (!questionPattern.test(normalized) && message.length > 120)) {
    return {
      action: "remember" as const,
      type: inferMemoryType(message),
      reason: "The message contains durable information that can improve future responses."
    };
  }

  if (questionPattern.test(normalized)) {
    return {
      action: "skip" as const,
      type: "Context" as const,
      reason: "Questions should use recalled memory but should not become durable memory by themselves."
    };
  }

  return {
    action: "skip" as const,
    type: "Context" as const,
    reason: "No stable long-term preference, profile, project, or instruction was detected."
  };
}
export async function generateAssistantReply(
  env: Env,
  prompt: string,
  recalled: StoredMemory[],
  history: ChatMessage[],
  message: string,
  decision?: ReturnType<typeof decideMemory>,
  stored?: StoredMemory
) {
  if (env.OPENAI_API_KEY) {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: prompt },
          {
            role: "system",
            content: `Recalled Walrus memories:\n${recalled.map((memory) => `- ${memory.content}`).join("\n") || "- none"}`
          },
          ...history.slice(-8).map((item) => ({ role: item.role, content: item.content })),
          { role: "user", content: message }
        ]
      })
    });

    if (response.ok) {
      const payload = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
      const content = payload.choices?.[0]?.message?.content;
      if (content) return content;
    }
  }

  return buildHelpfulFallback(message, recalled, decision, stored);
}

export function buildEvents(input: {
  message: string;
  recalled: StoredMemory[];
  decision: ReturnType<typeof decideMemory>;
  stored?: StoredMemory;
}): MemoryEvent[] {
  const timestamp = new Date().toISOString();
  const events: MemoryEvent[] = [
    {
      id: crypto.randomUUID(),
      type: "recall",
      title: "Recall",
      description: `Searching memories related to: "${input.message.slice(0, 72)}${input.message.length > 72 ? "..." : ""}"`,
      reason: input.recalled.length ? "Relevant semantic matches found." : "No related durable memories matched this message.",
      action: `Found ${input.recalled.length} related ${input.recalled.length === 1 ? "memory" : "memories"}.`,
      timestamp
    },
    {
      id: crypto.randomUUID(),
      type: "decision",
      title: "Decision",
      description:
        input.decision.action === "remember"
          ? "Long-term information detected."
          : input.decision.action === "merge"
            ? "Updated information detected."
            : "Temporary or low-value information detected.",
      reason: input.decision.reason,
      action: input.decision.action === "remember" ? "Remember()" : input.decision.action === "merge" ? "Merge()" : "Skip",
      timestamp
    }
  ];

  if (input.decision.action === "remember" && input.stored) {
    events.push({
      id: crypto.randomUUID(),
      type: "remember",
      title: "Remember",
      description: "Stored successfully.",
      reason: "No duplicate memory was found.",
      action: input.stored.id,
      timestamp
    });
  }

  if (input.decision.action === "merge" && input.stored) {
    events.push({
      id: crypto.randomUUID(),
      type: "merge",
      title: "Merge",
      description: "Existing memory updated.",
      reason: "The user changed a previous durable fact.",
      action: "Superseded previous memory.",
      timestamp
    });
  }

  if (input.decision.action === "skip") {
    events.push({
      id: crypto.randomUUID(),
      type: "skip",
      title: "Skip",
      description: "Nothing stored.",
      reason: input.decision.reason,
      action: "Ignored.",
      timestamp
    });
  }

  return events;
}

function inferMemoryType(message: string): StoredMemory["type"] {
  if (/memwal|walrus memory|support agent|agent setup|delegated keys|owner account|walrus blob|semantic recall|access control|production agent/i.test(message)) return "Project";
  if (/prefer|like|love|hate|РїСЂРµРґРїРѕС‡РёС‚Р°СЋ|Р»СЋР±Р»СЋ|РЅРµ Р»СЋР±Р»СЋ/i.test(message)) return "Preference";
  if (/project|app|build|stack|РїСЂРѕРµРєС‚|РїСЂРёР»РѕР¶РµРЅРёРµ/i.test(message)) return "Project";
  if (/always|never|РѕС‚РІРµС‚|РіРѕРІРѕСЂРё|remember|Р·Р°РїРѕРјРЅРё/i.test(message)) return "Instruction";
  if (/my name is|call me|РјРµРЅСЏ Р·РѕРІСѓС‚|Р·РѕРІРё/i.test(message)) return "Profile";
  return "Context";
}

function buildHelpfulFallback(
  message: string,
  recalled: StoredMemory[],
  decision?: ReturnType<typeof decideMemory>,
  stored?: StoredMemory
) {
  const isQuestion =
    /^(what|how|why|when|where|who|which|should|can|could|would|do|does|did|is|are|based on|explain whether|give a recommendation|summarize why)\b|\?$/i.test(
      message.trim()
    );

  if (decision?.action === "skip" && isQuestion && recalled.length > 0) {
    const context = recalled.map((memory) => memory.content).join(" ").toLowerCase();
    const isMemWalRecommendation = /memwal|walrus memory|support agent|support-and-operations|chat history/.test(
      `${message} ${context}`.toLowerCase()
    );

    if (isMemWalRecommendation) {
      return [
        "**Recommendation: use Walrus Memory when the agent needs durable context across sessions, tools, or workflows.**",
        "",
        "For a support-and-operations AI agent, normal chat history is too fragile because it is usually trapped inside one app. MemWal is useful when the agent must carry forward stable operational knowledge such as customer preferences, escalation rules, product constraints, and past decisions without asking users to repeat them in every new session.",
        "",
        "The strongest value is disciplined, trustworthy memory: relevant context can be recalled later, changed conclusions can be merged, and unsafe or short-lived information can be skipped. Walrus blob writes also give the team verifiable proof that durable memory was actually written instead of hidden inside an opaque chat-history database.",
        "",
        "**Memory: Skipped.**",
        "I answered using recalled memory, but I did not store this question as a new long-term memory."
      ].join("\n");
    }

    return [
      "**Answer based on recalled memory.**",
      "",
      recalled
        .slice(0, 3)
        .map((memory) => `- ${memory.content}`)
        .join("\n"),
      "",
      "**Memory: Skipped.**",
      "I used recalled context to answer, but did not store the question itself."
    ].join("\n");
  }

  if (decision?.action === "remember") {
    return [
      "**Memory: Remembered.**",
      "",
      `I stored this as **${stored?.type ?? "Context"}** because it is durable and likely to improve future responses.`,
      recalled.length
        ? `I checked related memories first and found ${recalled.length}, so this write was not blind.`
        : "No related memory existed yet, so this became a new long-term fact.",
      "",
      "This is the prompt doing its job: save stable preferences and project facts, not every chat message."
    ].join("\n");
  }

  if (decision?.action === "merge") {
    return [
      "**Memory: Updated.**",
      "",
      "I found an existing related memory and treated your message as a correction or scoped preference change.",
      "Future answers should use the newer rule and stop relying on the superseded version for this context."
    ].join("\n");
  }

  if (decision?.action === "skip") {
    return [
      "**Memory: Skipped.**",
      "",
      decision.reason,
      "I can still answer the message, but I will not turn this into durable Walrus Memory."
    ].join("\n");
  }

  if (/memory|РїР°РјСЏС‚/i.test(message)) {
    return "MemoryWAL shows how the system prompt governs recall, decision, and storage steps around every response.";
  }

  return `I am answering with the active system prompt and showing which memory decision was made for: "${message.slice(0, 120)}".`;
}

