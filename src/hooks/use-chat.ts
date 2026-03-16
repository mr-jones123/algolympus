import { useCallback, useRef, useState } from "react";
import { createClient } from "@/lib/openai";
import { SYSTEM_PROMPT } from "@/lib/prompts/system-prompt";
import type { ChatMessage, MessageSegment, ProviderConfig, UseChatResult } from "@/types";

function findClosingFence(raw: string, searchFrom: number): number {
  let pos = searchFrom;
  while (pos < raw.length) {
    const idx = raw.indexOf("```", pos);
    if (idx === -1) return -1;

    const before = idx > 0 ? raw[idx - 1] : "\n";
    const after = idx + 3 < raw.length ? raw[idx + 3] : "\n";
    const isStandalone = (before === "\n" || before === "\r") && (after === "\n" || after === "\r" || after === undefined);
    const isEndOfString = idx + 3 >= raw.length;

    if (isStandalone || isEndOfString) return idx;
    pos = idx + 3;
  }
  return -1;
}

function parseMessageSegments(raw: string): MessageSegment[] {
  const segments: MessageSegment[] = [];
  const HTML_OPEN = "```html";
  let segIndex = 0;
  let cursor = 0;

  while (cursor < raw.length) {
    const htmlStart = raw.indexOf(HTML_OPEN, cursor);

    if (htmlStart === -1) {
      const remaining = raw.slice(cursor).trim();
      if (remaining.length > 0) {
        segments.push({ id: `seg-${segIndex++}`, kind: "text", content: remaining });
      }
      break;
    }

    const textBefore = raw.slice(cursor, htmlStart).trim();
    if (textBefore.length > 0) {
      segments.push({ id: `seg-${segIndex++}`, kind: "text", content: textBefore });
    }

    const contentStart = htmlStart + HTML_OPEN.length;
    const closingFence = findClosingFence(raw, contentStart);

    if (closingFence === -1) {
      segments.push({
        id: `seg-${segIndex++}`,
        kind: "html",
        content: raw.slice(contentStart).trim(),
        complete: false,
      });
      break;
    }

    const htmlContent = raw.slice(contentStart, closingFence).trim();
    if (htmlContent.length > 0) {
      segments.push({
        id: `seg-${segIndex++}`,
        kind: "html",
        content: htmlContent,
        complete: true,
      });
    }

    cursor = closingFence + 3;
  }

  if (segments.length === 0 && raw.trim().length > 0) {
    segments.push({ id: "seg-0", kind: "text", content: raw.trim() });
  }

  return segments;
}

export function useChat(apiKey: string, provider: ProviderConfig): UseChatResult {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isMountedRef = useRef(true);

  const resetChat = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  const sendMessage = useCallback(
    async (content: string) => {
      const trimmed = content.trim();
      if (!trimmed || isStreaming) return;

      if (!apiKey || !apiKey.startsWith(provider.keyPrefix)) {
        setError(`Set a valid ${provider.label} API key before sending messages.`);
        return;
      }

      setError(null);

      const userMessage: ChatMessage = {
        id: `msg-${crypto.randomUUID()}`,
        role: "user",
        raw: trimmed,
        segments: [{ id: "seg-0", kind: "text", content: trimmed }],
        createdAt: Date.now(),
      };

      const assistantMessageId = `msg-${crypto.randomUUID()}`;
      const assistantMessage: ChatMessage = {
        id: assistantMessageId,
        role: "assistant",
        raw: "",
        segments: [],
        createdAt: Date.now(),
      };

      setMessages((current) => [...current, userMessage, assistantMessage]);
      setIsStreaming(true);

      try {
        const client = createClient(apiKey, provider);
        const stream = await client.chat.completions.create({
          model: provider.model,
          stream: true,
          temperature: 0.4,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...messages.map((m) => ({ role: m.role, content: m.raw })),
            { role: "user", content: trimmed },
          ],
        });

        let accumulated = "";
        for await (const chunk of stream) {
          const delta = chunk.choices[0]?.delta?.content;
          if (!delta || !isMountedRef.current) continue;

          accumulated += delta;
          const parsed = parseMessageSegments(accumulated);

          setMessages((current) =>
            current.map((m) =>
              m.id === assistantMessageId
                ? { ...m, raw: accumulated, segments: parsed }
                : m,
            ),
          );
        }
      } catch (requestError) {
        const msg = requestError instanceof Error ? requestError.message : "Request failed.";
        setError(msg);
      } finally {
        if (isMountedRef.current) setIsStreaming(false);
      }
    },
    [apiKey, provider, isStreaming, messages],
  );

  return { messages, isStreaming, error, sendMessage, resetChat };
}
