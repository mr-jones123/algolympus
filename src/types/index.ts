export type ThemeMode = "light" | "dark";

export type ChatRole = "user" | "assistant";

export type ProviderId = "openai" | "gemini";

export interface ProviderConfig {
  id: ProviderId;
  label: string;
  baseURL: string;
  model: string;
  keyPrefix: string;
  keyPlaceholder: string;
}

export const PROVIDERS: Record<ProviderId, ProviderConfig> = {
  openai: {
    id: "openai",
    label: "OpenAI",
    baseURL: "https://api.openai.com/v1",
    model: "gpt-4.1-mini",
    keyPrefix: "sk-",
    keyPlaceholder: "sk-...",
  },
  gemini: {
    id: "gemini",
    label: "Gemini",
    baseURL: import.meta.env.DEV
      ? `${window.location.origin}/gemini-api/`
      : "https://generativelanguage.googleapis.com/v1beta/openai/",
    model: "gemini-2.5-flash",
    keyPrefix: "AI",
    keyPlaceholder: "AIza...",
  },
};

export type MessageSegment =
  | {
      id: string;
      kind: "text";
      content: string;
    }
  | {
      id: string;
      kind: "html";
      content: string;
      complete: boolean;
    };

export interface ChatMessage {
  id: string;
  role: ChatRole;
  raw: string;
  segments: MessageSegment[];
  createdAt: number;
}

export interface UseChatResult {
  messages: ChatMessage[];
  isStreaming: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
  resetChat: () => void;
}
