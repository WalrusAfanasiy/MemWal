# MemoryWAL

Persistent AI Memory powered by Walrus.

MemoryWAL is a Cloudflare Pages application that demonstrates how a system prompt controls an AI agent's long-term memory lifecycle with Walrus Memory.

## Stack

- React + Vite + TypeScript
- TailwindCSS + shadcn-style UI primitives
- Cloudflare Pages Functions
- Walrus Memory SDK: `@mysten-incubation/memwal`

## Local Run

```bash
npm install
npm run build
npx wrangler pages dev dist --port=8788
```

Open:

```text
http://127.0.0.1:8788
```

## Production Secrets

Set these in Cloudflare Pages before production deploy:

```text
OPENAI_API_KEY
MEMWAL_PRIVATE_KEY
MEMWAL_ACCOUNT_ID
MEMWAL_SERVER_URL
MEMWAL_NAMESPACE
```

`MEMWAL_SERVER_URL` and `MEMWAL_NAMESPACE` are optional. The app defaults to the MemWal relayer and the `memorywal` namespace.

## Optional KV Bindings

For persistent prompt and visible memory index storage, add KV bindings:

```text
MEMORYWAL_PROMPT
MEMORYWAL_MEMORY
```

Without these bindings, local development uses an in-memory fallback. With Walrus credentials present, semantic recall and storage use Walrus Memory through the SDK.

## Deploy

```bash
npm run deploy
```
