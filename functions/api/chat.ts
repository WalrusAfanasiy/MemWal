import type { ChatRequest, ChatResponse, StoredMemory } from "../../src/types/memory";
import { buildEvents, decideMemory, generateAssistantReply, listMemories, recallRelevantMemories, remember, type Env } from "./_memory";

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const body = (await request.json()) as ChatRequest;
  if (!body.message?.trim()) {
    return new Response("Message is required.", { status: 400 });
  }

  const memoriesBefore = await listMemories(env);
  const recalled = await recallRelevantMemories(env, memoriesBefore, body.message);
  const decision = decideMemory(body.message, recalled);

  let stored: StoredMemory | undefined;
  let writeError: string | undefined;
  if (decision.action === "remember" || decision.action === "merge") {
    const candidate: StoredMemory = {
      id: decision.action === "merge" && "existingId" in decision ? decision.existingId : crypto.randomUUID(),
      type: decision.type,
      content: body.message.trim(),
      createdAt: new Date().toISOString(),
      status: "active"
    };

    try {
      await remember(env, candidate);
      stored = candidate;
    } catch (error) {
      writeError = error instanceof Error ? error.message : "Unknown Walrus Memory write error";
    }
  }

  const assistantText = writeError
    ? [
        "**Memory: Not stored.**",
        "",
        "The agent decided this information is durable, but the Walrus Memory write did not complete successfully.",
        "I will not claim the memory was saved. Please retry this message so it can produce a verified Walrus blob ID."
      ].join("\n")
    : await generateAssistantReply(env, body.prompt, recalled, body.history, body.message, decision, stored);

  const events = buildEvents({ message: body.message, recalled, decision, stored });
  if (writeError) {
    events.push({
      id: crypto.randomUUID(),
      type: "skip",
      title: "Walrus Write Failed",
      description: "Nothing stored.",
      reason: "The Walrus Memory write did not complete successfully.",
      action: "Retry the message to create a verified blob.",
      timestamp: new Date().toISOString()
    });
  }

  const response: ChatResponse = {
    message: {
      id: crypto.randomUUID(),
      role: "assistant",
      content: assistantText,
      createdAt: new Date().toISOString()
    },
    events,
    memories: await listMemories(env)
  };

  return Response.json(response);
};
