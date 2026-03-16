# Algolympus

**From brute force to optimal.** An AI-powered algorithm tutor that generates layered solutions, complexity analysis, and interactive visualizations for any coding problem.

![Algolympus](public/algolympus.jpg)

## What it does

Drop any coding problem — LeetCode, HackerRank, or plain English — and Algolympus will:

- Generate **multiple solutions** from brute force to optimized, with trade-off analysis
- Create **interactive HTML/SVG visualizations** you can step through
- Explain **time and space complexity** with intuitive breakdowns
- Provide **Python implementations** with detailed comments

## Stack

- **React 19** + **TypeScript** — UI framework
- **Vite** — Build tooling
- **OpenAI SDK** — API client (compatible with both OpenAI and Gemini)
- **react-markdown** + **Prism** — Rich content rendering
- **Sandboxed iframes** — Safe visualization execution

## BYOK (Bring Your Own Key)

Algolympus runs entirely in your browser. No backend, no data collection. You provide your own API key, which is stored in `localStorage` and sent directly to the provider.

Supported providers:

| Provider | Model | Key format |
|----------|-------|------------|
| OpenAI | gpt-4.1-mini | `sk-...` |
| Google Gemini | gemini-2.5-flash | `AIza...` |

## Getting started

```bash
# Install dependencies
bun install

# Start dev server
bun dev

# Build for production
bun run build

# Deploy to GitHub Pages
bun run deploy
```

## How it works

1. Your prompt is sent to the AI with a specialized system prompt that enforces structured output
2. The AI streams back markdown + fenced HTML blocks
3. The parser extracts HTML visualizations in real-time as they stream
4. Each visualization renders in a sandboxed iframe with theme bridging, resize observers, and inter-frame communication

## License

[MIT](LICENSE)
