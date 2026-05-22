# VedaAI — Assignment Generator

Full-stack AI question paper generator with **dual LLM support** (OpenAI → Gemini automatic fallback).

## Stack

- **Frontend:** Next.js 16, TypeScript, Tailwind CSS v4, Redux Toolkit, Socket.IO client
- **Backend:** Express, MongoDB, Redis, BullMQ, Socket.IO
- **AI:** OpenAI GPT-3.5-turbo (primary), Gemini 1.5 Pro (fallback)

## Prerequisites

- Node.js 18+
- Docker (for MongoDB + Redis)
- API keys: [OpenAI](https://platform.openai.com/api-keys), [Gemini](https://aistudio.google.com/apikey) (free)

## Quick Start

### 1. Start databases

```bash
npm run docker:up
```

### 2. Configure environment

```bash
cp backend/.env.example backend/.env
cp .env.local.example .env.local
```

Edit `backend/.env` with your API keys:

```
OPENAI_API_KEY=sk-...
GEMINI_API_KEY=...
GEMINI_MODEL=gemini-2.0-flash,gemini-1.5-flash
```

**OpenAI quota exceeded (429)?** Add billing at [OpenAI](https://platform.openai.com/settings/organization/billing), or use Gemini only:

```
SKIP_OPENAI=true
GEMINI_API_KEY=your_key_from_aistudio.google.com
```

### 3. Install dependencies

```bash
npm install
cd backend && npm install
```

### 4. Run everything

From project root:

```bash
npm run dev:all
```

Or in separate terminals:

```bash
docker-compose up -d
cd backend && npm run dev      # API on :4000
cd backend && npm run worker   # BullMQ worker
npm run dev                    # Next.js on :3000
```

### 5. Use the app

1. Open http://localhost:3000
2. Click **Create Assignment**
3. Fill the form → **Create & Generate Paper**
4. Watch real-time progress on the output page
5. See which LLM was used (OpenAI or Gemini badge)
6. Click **Regenerate** to generate again (may use a different provider)

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/assignments` | Create assignment |
| GET | `/api/assignments` | List all |
| GET | `/api/assignments/:id` | Get with generated paper |
| DELETE | `/api/assignments/:id` | Delete assignment + papers |
| POST | `/api/generate/:id` | Start generation (`?regenerate=true` to bypass cache) |
| GET | `/api/generation/status/:jobId` | Poll job status |

## LLM Fallback Flow

1. Worker tries **OpenAI** (30s timeout)
2. On failure/timeout → emits `generation:fallback` → tries **Gemini** (30s timeout)
3. Successful response cached in Redis (1 hour) unless regenerating
4. Provider stored in `assignment.llmUsed` and shown in UI

## Socket.IO Events

Join room: `emit('join', { assignmentId })`

| Event | Payload |
|-------|---------|
| `generation:started` | `{ jobId, assignmentId, llmAttempting }` |
| `generation:progress` | `{ jobId, progress, stage }` |
| `generation:fallback` | `{ from, to, reason }` |
| `generation:completed` | `{ jobId, assignmentId, paperId, llmUsed }` |
| `generation:failed` | `{ jobId, error }` |
