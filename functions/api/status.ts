import { getWalrusStatus } from "./_walrus";
import type { Env } from "./_memory";

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  return Response.json({
    app: "MemoryWAL",
    walrusMemory: getWalrusStatus(env)
  });
};
