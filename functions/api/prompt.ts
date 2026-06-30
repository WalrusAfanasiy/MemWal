import { getPrompt, setPrompt, type Env } from "./_memory";

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  return Response.json(await getPrompt(env));
};

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const body = (await request.json()) as { content?: string };
  if (!body.content || body.content.trim().length < 80) {
    return new Response("Prompt must contain at least 80 characters.", { status: 400 });
  }

  return Response.json(await setPrompt(env, body.content.trim()));
};
