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
  if (decision.action === "remember" || decision.action === "merge") {
    stored = {
      id: decision.action === "merge" && "existingId" in decision ? decision.existingId : crypto.randomUUID(),
      type: decision.type,
      content: body.message.trim(),
      createdAt: new Date().toISOString(),
      status: "active"
    };
    await remember(env, stored);
  }

  const assistantText = await generateAssistantReply(env, body.prompt, recalled, body.history, body.message, decision, stored);

  const response: ChatResponse = {
    message: {
      id: crypto.randomUUID(),
      role: "assistant",
      content: assistantText,
      createdAt: new Date().toISOString()
    },
    events: buildEvents({ message: body.message, recalled, decision, stored }),
    memories: await listMemories(env)
  };

  return Response.json(response);
};
