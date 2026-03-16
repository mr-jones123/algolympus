export type ThemeMode = "light" | "dark";

export type ChatRole = "user" | "assistant";

export const MODEL = "gemini-3-flash-preview";
export const MODEL_LABEL = "Gemini 3 Flash";
export const KEY_PREFIX = "AI";
export const KEY_PLACEHOLDER = "AIza...";

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
