import { useCallback, useEffect, useRef } from "react";
import { ChatInput } from "@/components/chat/chat-input";
import { MessageBubble } from "@/components/chat/message-bubble";
import { WelcomeScreen } from "@/components/chat/welcome-screen";
import type { ChatMessage, ThemeMode } from "@/types";

interface ChatContainerProps {
  messages: ChatMessage[];
  isStreaming: boolean;
  hasApiKey: boolean;
  theme: ThemeMode;
  error: string | null;
  onSendMessage: (content: string) => void;
}

export function ChatContainer({
  messages,
  isStreaming,
  hasApiKey,
  theme,
  error,
  onSendMessage,
}: ChatContainerProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!scrollerRef.current) {
      return;
    }
    scrollerRef.current.scrollTo({ top: scrollerRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isStreaming]);

  const handleSendFromWidget = useCallback(
    (text: string) => {
      onSendMessage(text);
    },
    [onSendMessage],
  );

  return (
    <section className="chat-shell">
      <div ref={scrollerRef} className="chat-scroller">
        {messages.length === 0 ? (
          <WelcomeScreen onSelectExample={onSendMessage} />
        ) : (
          <div className="message-stack">
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                theme={theme}
                onSendPromptFromWidget={handleSendFromWidget}
              />
            ))}
            {isStreaming ? <div className="typing-indicator">Generating solutions and visualizations...</div> : null}
          </div>
        )}
      </div>

      <footer className="chat-footer">
        {error ? <p className="chat-error">{error}</p> : null}
        <ChatInput
          disabled={!hasApiKey}
          isStreaming={isStreaming}
          onSend={onSendMessage}
          placeholder={!hasApiKey ? "Set API key to start" : "Paste a coding problem and ask for visualized solutions"}
        />
      </footer>
    </section>
  );
}
