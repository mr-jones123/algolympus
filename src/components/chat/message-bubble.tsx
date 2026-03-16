import { Fragment, useMemo } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import { WidgetRenderer } from "@/components/visualization/widget-renderer";
import type { ChatMessage, ThemeMode } from "@/types";

interface MessageBubbleProps {
  message: ChatMessage;
  theme: ThemeMode;
  onSendPromptFromWidget: (text: string) => void;
}

function LoadingSpinner() {
  return (
    <svg className="widget-spinner-svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
      {Array.from({ length: 8 }).map((_, i) => (
        <circle
          key={i}
          cx="12"
          cy="3"
          r="1.5"
          fill="var(--green)"
          opacity={0.15 + (i / 8) * 0.85}
          transform={`rotate(${i * 45} 12 12)`}
        />
      ))}
    </svg>
  );
}

export function MessageBubble({ message, theme, onSendPromptFromWidget }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const codeTheme = theme === "dark" ? oneDark : oneLight;

  const renderedSegments = useMemo(() => {
    if (isUser) return null;

    return message.segments.map((segment) => {
      if (segment.kind === "text") {
        return (
          <div key={segment.id} className="assistant-copy">
            <Markdown
              remarkPlugins={[remarkGfm]}
              components={{
                code(props) {
                  const { children, className, ...rest } = props;
                  const langMatch = /language-(\w+)/.exec(className ?? "");
                  const lang = langMatch ? langMatch[1] : undefined;
                  const codeString = String(children).replace(/\n$/, "");

                  if (!lang) {
                    return <code className={className} {...rest}>{children}</code>;
                  }

                  return (
                    <SyntaxHighlighter
                      style={codeTheme}
                      language={lang}
                      PreTag="div"
                      customStyle={{
                        margin: "0.5rem 0",
                        borderRadius: "var(--radius-md)",
                        fontSize: "0.85rem",
                      }}
                    >
                      {codeString}
                    </SyntaxHighlighter>
                  );
                },
                table(props) {
                  return (
                    <div style={{ overflowX: "auto", margin: "0.5rem 0" }}>
                      <table
                        style={{
                          width: "100%",
                          borderCollapse: "collapse",
                          fontSize: "0.88rem",
                        }}
                        {...props}
                      />
                    </div>
                  );
                },
                th(props) {
                  return (
                    <th
                      style={{
                        textAlign: "left",
                        padding: "6px 10px",
                        borderBottom: "1px solid var(--color-border)",
                        fontWeight: 500,
                        color: "var(--color-text-soft)",
                        fontSize: "0.82rem",
                      }}
                      {...props}
                    />
                  );
                },
                td(props) {
                  return (
                    <td
                      style={{
                        padding: "6px 10px",
                        borderBottom: "0.5px solid var(--color-border)",
                      }}
                      {...props}
                    />
                  );
                },
              }}
            >
              {segment.content}
            </Markdown>
          </div>
        );
      }

      if (segment.kind === "html") {
        if (!segment.complete) {
          return (
            <div key={segment.id} className="widget-loading-inline">
              <LoadingSpinner />
              <span>Adding the interactive bits...</span>
            </div>
          );
        }

        return (
          <WidgetRenderer
            key={segment.id}
            title="Algorithm visualization"
            html={segment.content}
            theme={theme}
            onSendPrompt={onSendPromptFromWidget}
          />
        );
      }

      return null;
    });
  }, [message.segments, isUser, theme, codeTheme, onSendPromptFromWidget]);

  if (!isUser) {
    return (
      <article className="message-row message-row-assistant">
        <div className="message-content-assistant">
          <Fragment>{renderedSegments}</Fragment>
        </div>
      </article>
    );
  }

  return (
    <article className="message-row message-row-user">
      <div className="message-bubble bubble-user">
        <p>{message.raw}</p>
      </div>
    </article>
  );
}
