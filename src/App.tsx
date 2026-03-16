import { useCallback, useEffect, useMemo, useState } from "react";
import { ChatContainer } from "@/components/chat/chat-container";
import { ApiKeyModal } from "@/components/settings/api-key-modal";
import { useApiKey } from "@/hooks/use-api-key";
import { useChat } from "@/hooks/use-chat";
import { useProvider } from "@/hooks/use-provider";

function KeyIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <circle cx="5.5" cy="10.5" r="3" />
      <path d="M8 8l5.5-5.5M11 5l2 2M9.5 6.5l2 2" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M2.5 4.5h11M5.5 4.5V3a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v1.5M12 4.5l-.5 8a1.5 1.5 0 0 1-1.5 1.5H6a1.5 1.5 0 0 1-1.5-1.5l-.5-8" />
    </svg>
  );
}

export default function App() {
  const { providerId, provider, setProviderId } = useProvider();
  const { apiKey, hasApiKey, setApiKey, removeApiKey, isValidApiKeyFormat } = useApiKey(provider);
  const { messages, isStreaming, error, sendMessage, resetChat } = useChat(apiKey, provider);
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);

  useEffect(() => {
    if (!hasApiKey) {
      setIsKeyModalOpen(true);
    }
  }, [hasApiKey]);

  const headerSubline = useMemo(() => {
    if (!hasApiKey) {
      return "BYOK required";
    }
    return `${provider.label} · ${provider.model}`;
  }, [hasApiKey, provider]);

  const handleSend = useCallback(
    (content: string) => {
      void sendMessage(content);
    },
    [sendMessage],
  );

  return (
    <main className="app-shell">
      <header className="app-header">
        <p className="brand-subline">{headerSubline}</p>
        <div className="header-actions">
          <button type="button" className="icon-btn" onClick={() => setIsKeyModalOpen(true)} aria-label="API key settings">
            <KeyIcon />
          </button>
          <button type="button" className="icon-btn" onClick={resetChat} aria-label="Clear conversation">
            <TrashIcon />
          </button>
        </div>
      </header>

      <ChatContainer
        messages={messages}
        isStreaming={isStreaming}
        hasApiKey={hasApiKey}
        theme="dark"
        error={error}
        onSendMessage={handleSend}
      />

      <ApiKeyModal
        isOpen={isKeyModalOpen}
        providerId={providerId}
        initialValue={apiKey}
        onSave={setApiKey}
        onClose={() => setIsKeyModalOpen(false)}
        onRemove={removeApiKey}
        onChangeProvider={setProviderId}
        validate={isValidApiKeyFormat}
      />
    </main>
  );
}
