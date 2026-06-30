import type { StoredMemory } from "../../src/types/memory";
import type { Env } from "./_memory";

const DEFAULT_NAMESPACE = "memorywal";
const DEFAULT_RELAYER = "https://relayer.memory.walrus.xyz";

export function hasWalrusEnv(env: Env) {
  return Boolean(env.MEMWAL_PRIVATE_KEY && env.MEMWAL_ACCOUNT_ID);
}

async function createClient(env: Env) {
  if (!hasWalrusEnv(env)) return null;

  const { MemWal } = await import("@mysten-incubation/memwal");
  return MemWal.create({
    key: env.MEMWAL_PRIVATE_KEY!,
    accountId: env.MEMWAL_ACCOUNT_ID!,
    serverUrl: env.MEMWAL_SERVER_URL ?? DEFAULT_RELAYER,
    namespace: env.MEMWAL_NAMESPACE ?? DEFAULT_NAMESPACE
  });
}

export function getWalrusStatus(env: Env) {
  return {
    configured: hasWalrusEnv(env),
    accountId: env.MEMWAL_ACCOUNT_ID ? maskId(env.MEMWAL_ACCOUNT_ID) : null,
    namespace: env.MEMWAL_NAMESPACE ?? DEFAULT_NAMESPACE,
    serverUrl: env.MEMWAL_SERVER_URL ?? DEFAULT_RELAYER
  };
}

export async function recallFromWalrus(env: Env, query: string): Promise<StoredMemory[]> {
  const client = await createClient(env);
  if (!client) return [];

  try {
    const result = await client.recall({
      query,
      topK: 6,
      maxDistance: 0.75,
      namespace: env.MEMWAL_NAMESPACE ?? DEFAULT_NAMESPACE
    });

    return result.results.map((memory) => ({
      id: memory.blob_id,
      type: "Context",
      content: memory.text,
      createdAt: new Date().toISOString(),
      status: "active"
    }));
  } finally {
    client.destroy();
  }
}

export async function rememberInWalrus(env: Env, text: string): Promise<string | undefined> {
  const client = await createClient(env);
  if (!client) return undefined;

  try {
    const result = await client.rememberAndWait(text, env.MEMWAL_NAMESPACE ?? DEFAULT_NAMESPACE, { timeoutMs: 30_000 });
    return result.blob_id || result.id;
  } finally {
    client.destroy();
  }
}

function maskId(value: string) {
  if (value.length <= 14) return value;
  return `${value.slice(0, 8)}...${value.slice(-6)}`;
}
