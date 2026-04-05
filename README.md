# AI Proxy API

A self-hosted reverse proxy that exposes a unified API for OpenAI and Anthropic models, with Bearer token authentication.

## Features

- `/v1/chat/completions` — OpenAI-compatible endpoint (routes to OpenAI or Anthropic automatically by model name)
- `/v1/messages` — Native Anthropic Messages API endpoint
- `/v1/models` — Lists all available models
- Automatic prompt caching for Anthropic models (reduces token costs)
- Extended Thinking / reasoning support for Claude models
- Streaming support for all endpoints

## Deployment

### Option A — Replit (Recommended, no API keys needed)

1. **Fork** this project on Replit
2. Go to **Tools → Integrations** and enable:
   - **OpenAI** integration
   - **Anthropic** integration
3. Go to **Tools → Secrets** and add:
   - `PROXY_API_KEY` = any secret string you choose (this is what clients use to authenticate)
4. Click **Deploy**

Replit AI Integrations handle billing through your Replit Credits — no separate OpenAI or Anthropic API keys needed.

---

### Option B — Any Platform (VPS, Railway, Fly.io, Docker, etc.)

Set the following environment variables:

```env
# Required — your chosen auth token for clients
PROXY_API_KEY=your-secret-token-here

# OpenAI
OPENAI_API_KEY=sk-...
# Optional: only set if using a custom OpenAI-compatible endpoint
# OPENAI_BASE_URL=https://api.openai.com/v1

# Anthropic
ANTHROPIC_API_KEY=sk-ant-...
# Optional: only set if using a custom Anthropic-compatible endpoint
# ANTHROPIC_BASE_URL=https://api.anthropic.com
```

Then run:

```bash
pnpm install
pnpm --filter @workspace/api-server run dev   # development
pnpm --filter @workspace/api-server run build  # production build
```

The server listens on the `PORT` environment variable (default: 3000).

---

## Client Setup

### CherryStudio

1. Settings → AI Providers → click **+**
2. Type: **OpenAI**
3. Base URL: `https://your-deployment-domain`
4. API Key: your `PROXY_API_KEY` value
5. Save and test connection

### curl

```bash
curl https://your-deployment-domain/v1/chat/completions \
  -H "Authorization: Bearer YOUR_PROXY_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "claude-sonnet-4-6",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'
```

## Available Models

| Model | Provider |
|-------|----------|
| `gpt-5.2` | OpenAI |
| `gpt-5-mini` | OpenAI |
| `gpt-5-nano` | OpenAI |
| `o4-mini` | OpenAI |
| `o3` | OpenAI |
| `claude-opus-4-6` | Anthropic |
| `claude-sonnet-4-6` | Anthropic |
| `claude-haiku-4-5` | Anthropic |

## Extended Thinking (Claude only)

Add `thinking` to your request:

```json
{
  "model": "claude-opus-4-6",
  "thinking": { "type": "enabled", "budget_tokens": 8000 },
  "max_tokens": 16000,
  "messages": [...]
}
```

The response includes a `reasoning_content` field with the thinking output.
