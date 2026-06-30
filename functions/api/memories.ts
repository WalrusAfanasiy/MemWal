import { listMemories, type Env } from "./_memory";

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  return Response.json(await listMemories(env));
};
