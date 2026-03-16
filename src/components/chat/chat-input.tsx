import { KeyboardEvent, useCallback, useState } from "react";

interface ChatInputProps {
  disabled: boolean;
  isStreaming: boolean;
  onSend: (content: string) => void;
  placeholder?: string;
}

function SendIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2L7 9M14 2l-4.5 12-2.5-5-5-2.5L14 2Z" />
    </svg>
  );
}

export function ChatInput({ disabled, isStreaming, onSend, placeholder }: ChatInputProps) {
  const [value, setValue] = useState("");

  const submit = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed || disabled || isStreaming) {
      return;
    }
    onSend(trimmed);
    setValue("");
  }, [disabled, isStreaming, onSend, value]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        submit();
      }
    },
    [submit],
  );

  return (
    <div className="chat-input-shell">
      <textarea
        className="chat-input"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder ?? "Paste a coding problem to begin..."}
        disabled={disabled || isStreaming}
        rows={2}
      />
      <button type="button" className="btn-primary send-btn" onClick={submit} disabled={disabled || isStreaming}>
        {isStreaming ? (
          "..."
        ) : (
          <SendIcon />
        )}
      </button>
    </div>
  );
}
