import { useCallback, useEffect, useRef, useState } from "react";
import type { ThemeMode } from "@/types";

interface WidgetRendererProps {
  title: string;
  html: string;
  theme: ThemeMode;
  onSendPrompt?: (text: string) => void;
}

const THEME_CSS = `
:root {
  --color-background-primary: #ffffff;
  --color-background-secondary: #f7f6f3;
  --color-background-tertiary: #efeee9;
  --color-background-info: #E6F1FB;
  --color-background-danger: #FCEBEB;
  --color-background-success: #EAF3DE;
  --color-background-warning: #FAEEDA;

  --color-text-primary: #1a1a1a;
  --color-text-secondary: #73726c;
  --color-text-tertiary: #9c9a92;
  --color-text-info: #185FA5;
  --color-text-danger: #A32D2D;
  --color-text-success: #3B6D11;
  --color-text-warning: #854F0B;

  --color-border-primary: rgba(0, 0, 0, 0.4);
  --color-border-secondary: rgba(0, 0, 0, 0.3);
  --color-border-tertiary: rgba(0, 0, 0, 0.15);
  --color-border-info: #185FA5;
  --color-border-danger: #A32D2D;
  --color-border-success: #3B6D11;
  --color-border-warning: #854F0B;

  --font-sans: "Manrope", "Avenir Next", "Segoe UI", sans-serif;
  --font-serif: "Fraunces", Georgia, serif;
  --font-mono: "JetBrains Mono", "SF Mono", monospace;

  --border-radius-md: 8px;
  --border-radius-lg: 12px;
  --border-radius-xl: 16px;

  --p: var(--color-text-primary);
  --s: var(--color-text-secondary);
  --t: var(--color-text-tertiary);
  --bg2: var(--color-background-secondary);
  --b: var(--color-border-tertiary);
}

:root[data-theme='dark'] {
  --color-background-primary: #17161c;
  --color-background-secondary: #211f29;
  --color-background-tertiary: #2b2835;
  --color-background-info: #12345f;
  --color-background-danger: #4c1f25;
  --color-background-success: #1f3e2e;
  --color-background-warning: #493414;

  --color-text-primary: #f2f1f8;
  --color-text-secondary: #a5a1b8;
  --color-text-tertiary: #7d7891;
  --color-text-info: #9ec6ff;
  --color-text-danger: #ffb1bb;
  --color-text-success: #9fe8bf;
  --color-text-warning: #f5ce8c;

  --color-border-primary: rgba(255, 255, 255, 0.4);
  --color-border-secondary: rgba(255, 255, 255, 0.27);
  --color-border-tertiary: rgba(255, 255, 255, 0.14);
  --color-border-info: #9ec6ff;
  --color-border-danger: #ffb1bb;
  --color-border-success: #9fe8bf;
  --color-border-warning: #f5ce8c;
}
`;

const SVG_CLASSES_CSS = `
svg text.t   { font: 400 14px var(--font-sans); fill: var(--p); }
svg text.ts  { font: 400 12px var(--font-sans); fill: var(--s); }
svg text.th  { font: 500 14px var(--font-sans); fill: var(--p); }

svg .box > rect, svg .box > circle, svg .box > ellipse { fill: var(--bg2); stroke: var(--b); }
svg .node { cursor: pointer; }
svg .node:hover { opacity: 0.8; }
svg .arr { stroke: var(--s); stroke-width: 1.5; fill: none; }
svg .leader { stroke: var(--t); stroke-width: 0.5; stroke-dasharray: 4 4; fill: none; }

svg .c-purple > rect, svg .c-purple > circle, svg .c-purple > ellipse,
svg rect.c-purple, svg circle.c-purple, svg ellipse.c-purple { fill: #EEEDFE; stroke: #534AB7; }
svg .c-purple text.th, svg .c-purple text.t { fill: #3C3489; }
svg .c-purple text.ts { fill: #534AB7; }

svg .c-teal > rect, svg .c-teal > circle, svg .c-teal > ellipse,
svg rect.c-teal, svg circle.c-teal, svg ellipse.c-teal { fill: #E1F5EE; stroke: #0F6E56; }
svg .c-teal text.th, svg .c-teal text.t { fill: #085041; }
svg .c-teal text.ts { fill: #0F6E56; }

svg .c-coral > rect, svg .c-coral > circle, svg .c-coral > ellipse,
svg rect.c-coral, svg circle.c-coral, svg ellipse.c-coral { fill: #FAECE7; stroke: #993C1D; }
svg .c-coral text.th, svg .c-coral text.t { fill: #712B13; }
svg .c-coral text.ts { fill: #993C1D; }

svg .c-pink > rect, svg .c-pink > circle, svg .c-pink > ellipse,
svg rect.c-pink, svg circle.c-pink, svg ellipse.c-pink { fill: #FBEAF0; stroke: #993556; }
svg .c-pink text.th, svg .c-pink text.t { fill: #72243E; }
svg .c-pink text.ts { fill: #993556; }

svg .c-gray > rect, svg .c-gray > circle, svg .c-gray > ellipse,
svg rect.c-gray, svg circle.c-gray, svg ellipse.c-gray { fill: #F1EFE8; stroke: #5F5E5A; }
svg .c-gray text.th, svg .c-gray text.t { fill: #444441; }
svg .c-gray text.ts { fill: #5F5E5A; }

svg .c-blue > rect, svg .c-blue > circle, svg .c-blue > ellipse,
svg rect.c-blue, svg circle.c-blue, svg ellipse.c-blue { fill: #E6F1FB; stroke: #185FA5; }
svg .c-blue text.th, svg .c-blue text.t { fill: #0C447C; }
svg .c-blue text.ts { fill: #185FA5; }

svg .c-green > rect, svg .c-green > circle, svg .c-green > ellipse,
svg rect.c-green, svg circle.c-green, svg ellipse.c-green { fill: #EAF3DE; stroke: #3B6D11; }
svg .c-green text.th, svg .c-green text.t { fill: #27500A; }
svg .c-green text.ts { fill: #3B6D11; }

svg .c-amber > rect, svg .c-amber > circle, svg .c-amber > ellipse,
svg rect.c-amber, svg circle.c-amber, svg ellipse.c-amber { fill: #FAEEDA; stroke: #854F0B; }
svg .c-amber text.th, svg .c-amber text.t { fill: #633806; }
svg .c-amber text.ts { fill: #854F0B; }

svg .c-red > rect, svg .c-red > circle, svg .c-red > ellipse,
svg rect.c-red, svg circle.c-red, svg ellipse.c-red { fill: #FCEBEB; stroke: #A32D2D; }
svg .c-red text.th, svg .c-red text.t { fill: #791F1F; }
svg .c-red text.ts { fill: #A32D2D; }

:root[data-theme='dark'] svg .c-purple > rect,
:root[data-theme='dark'] svg .c-purple > circle,
:root[data-theme='dark'] svg .c-purple > ellipse,
:root[data-theme='dark'] svg rect.c-purple,
:root[data-theme='dark'] svg circle.c-purple,
:root[data-theme='dark'] svg ellipse.c-purple { fill: #3C3489; stroke: #AFA9EC; }

:root[data-theme='dark'] svg .c-teal > rect,
:root[data-theme='dark'] svg .c-teal > circle,
:root[data-theme='dark'] svg .c-teal > ellipse,
:root[data-theme='dark'] svg rect.c-teal,
:root[data-theme='dark'] svg circle.c-teal,
:root[data-theme='dark'] svg ellipse.c-teal { fill: #085041; stroke: #5DCAA5; }

:root[data-theme='dark'] svg .c-coral > rect,
:root[data-theme='dark'] svg .c-coral > circle,
:root[data-theme='dark'] svg .c-coral > ellipse,
:root[data-theme='dark'] svg rect.c-coral,
:root[data-theme='dark'] svg circle.c-coral,
:root[data-theme='dark'] svg ellipse.c-coral { fill: #712B13; stroke: #F0997B; }

:root[data-theme='dark'] svg .c-pink > rect,
:root[data-theme='dark'] svg .c-pink > circle,
:root[data-theme='dark'] svg .c-pink > ellipse,
:root[data-theme='dark'] svg rect.c-pink,
:root[data-theme='dark'] svg circle.c-pink,
:root[data-theme='dark'] svg ellipse.c-pink { fill: #72243E; stroke: #ED93B1; }

:root[data-theme='dark'] svg .c-gray > rect,
:root[data-theme='dark'] svg .c-gray > circle,
:root[data-theme='dark'] svg .c-gray > ellipse,
:root[data-theme='dark'] svg rect.c-gray,
:root[data-theme='dark'] svg circle.c-gray,
:root[data-theme='dark'] svg ellipse.c-gray { fill: #444441; stroke: #B4B2A9; }

:root[data-theme='dark'] svg .c-blue > rect,
:root[data-theme='dark'] svg .c-blue > circle,
:root[data-theme='dark'] svg .c-blue > ellipse,
:root[data-theme='dark'] svg rect.c-blue,
:root[data-theme='dark'] svg circle.c-blue,
:root[data-theme='dark'] svg ellipse.c-blue { fill: #0C447C; stroke: #85B7EB; }

:root[data-theme='dark'] svg .c-green > rect,
:root[data-theme='dark'] svg .c-green > circle,
:root[data-theme='dark'] svg .c-green > ellipse,
:root[data-theme='dark'] svg rect.c-green,
:root[data-theme='dark'] svg circle.c-green,
:root[data-theme='dark'] svg ellipse.c-green { fill: #27500A; stroke: #97C459; }

:root[data-theme='dark'] svg .c-amber > rect,
:root[data-theme='dark'] svg .c-amber > circle,
:root[data-theme='dark'] svg .c-amber > ellipse,
:root[data-theme='dark'] svg rect.c-amber,
:root[data-theme='dark'] svg circle.c-amber,
:root[data-theme='dark'] svg ellipse.c-amber { fill: #633806; stroke: #EF9F27; }

:root[data-theme='dark'] svg .c-red > rect,
:root[data-theme='dark'] svg .c-red > circle,
:root[data-theme='dark'] svg .c-red > ellipse,
:root[data-theme='dark'] svg rect.c-red,
:root[data-theme='dark'] svg circle.c-red,
:root[data-theme='dark'] svg ellipse.c-red { fill: #791F1F; stroke: #F09595; }
`;

const FORM_STYLES_CSS = `
* { box-sizing: border-box; margin: 0; }
html, body {
  background: var(--color-background-primary);
}
body {
  font-family: var(--font-sans);
  font-size: 16px;
  line-height: 1.7;
  color: var(--color-text-primary);
  -webkit-font-smoothing: antialiased;
  padding: 20px 24px;
}
button {
  font-family: inherit;
  font-size: 14px;
  padding: 6px 16px;
  border: 0.5px solid var(--color-border-secondary);
  border-radius: var(--border-radius-md);
  background: transparent;
  color: var(--color-text-primary);
  cursor: pointer;
  transition: background 0.15s, transform 0.1s;
}
button:hover { background: var(--color-background-secondary); }
button:active { transform: scale(0.98); }

input[type='text'],
input[type='number'],
input[type='email'],
input[type='search'],
textarea,
select {
  font-family: inherit;
  font-size: 14px;
  padding: 6px 12px;
  height: 36px;
  border: 0.5px solid var(--color-border-tertiary);
  border-radius: var(--border-radius-md);
  background: var(--color-background-primary);
  color: var(--color-text-primary);
  transition: border-color 0.15s;
}
input:hover, textarea:hover, select:hover { border-color: var(--color-border-secondary); }
input:focus, textarea:focus, select:focus {
  outline: none;
  border-color: var(--color-border-primary);
  box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.06);
}
textarea { height: auto; min-height: 80px; resize: vertical; }
input::placeholder, textarea::placeholder { color: var(--color-text-tertiary); }

input[type='range'] {
  -webkit-appearance: none;
  appearance: none;
  height: 4px;
  background: var(--color-border-tertiary);
  border-radius: 2px;
  border: none;
  outline: none;
}
input[type='range']::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--color-background-primary);
  border: 0.5px solid var(--color-border-secondary);
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
input[type='range']::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--color-background-primary);
  border: 0.5px solid var(--color-border-secondary);
  cursor: pointer;
}

a { color: var(--color-text-info); text-decoration: none; }
a:hover { text-decoration: underline; }

#content > * { animation: fadeSlideIn 0.4s ease-out both; }
#content > *:nth-child(1) { animation-delay: 0s; }
#content > *:nth-child(2) { animation-delay: 0.06s; }
#content > *:nth-child(3) { animation-delay: 0.12s; }
#content > *:nth-child(4) { animation-delay: 0.18s; }
#content > *:nth-child(5) { animation-delay: 0.24s; }
#content > *:nth-child(n+6) { animation-delay: 0.3s; }

@keyframes fadeSlideIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
  }
}
`;

const BRIDGE_JS = `
window.sendPrompt = function(text) {
  window.parent.postMessage({ type: 'send-prompt', text: text }, '*');
};

window.openLink = function(url) {
  window.parent.postMessage({ type: 'open-link', url: url }, '*');
};

document.addEventListener('click', function(e) {
  var target = e.target;
  var anchor = target instanceof Element ? target.closest('a[href]') : null;
  if (anchor && anchor.href && anchor.href.startsWith('http')) {
    e.preventDefault();
    window.parent.postMessage({ type: 'open-link', url: anchor.href }, '*');
  }
});

function reportHeight() {
  var content = document.getElementById('content');
  var height = content
    ? Math.max(content.offsetHeight, content.scrollHeight)
    : Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);
  if (height > 0) {
    window.parent.postMessage({ type: 'widget-resize', height: height }, '*');
  }
}

try {
  var resizeObserver = new ResizeObserver(reportHeight);
  resizeObserver.observe(document.getElementById('content') || document.body);
} catch(e) {}

window.addEventListener('load', function() {
  reportHeight();
  setTimeout(reportHeight, 100);
  setTimeout(reportHeight, 500);
  setTimeout(reportHeight, 1500);
});

var resizeInterval = setInterval(reportHeight, 300);
setTimeout(function() { clearInterval(resizeInterval); }, 30000);
`;

const LOADING_PHRASES = [
  "Charting complexity",
  "Animating data structures",
  "Walking the state graph",
  "Rendering algorithm flow",
  "Synchronizing pointers",
  "Building visual intuition",
  "Refining step playback",
];

function useLoadingPhrase(active: boolean) {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (!active) {
      return;
    }
    setIndex(0);
    const interval = window.setInterval(() => {
      setIndex((current) => (current + 1) % LOADING_PHRASES.length);
    }, 1800);
    return () => window.clearInterval(interval);
  }, [active]);

  return LOADING_PHRASES[index];
}

const ERROR_HANDLER_JS = `
window.onerror = function(msg, src, line, col, err) {
  var el = document.createElement('div');
  el.style.cssText = 'margin:12px 0;padding:10px 14px;background:var(--color-background-danger);border:0.5px solid var(--color-border-danger);border-radius:var(--border-radius-md);font-size:13px;color:var(--color-text-danger);font-family:var(--font-mono);white-space:pre-wrap;word-break:break-word;';
  el.textContent = 'Visualization error: ' + msg + (line ? ' (line ' + line + ')' : '');
  var content = document.getElementById('content');
  if (content) { content.prepend(el); } else { document.body.prepend(el); }
  return true;
};
window.addEventListener('unhandledrejection', function(e) {
  var el = document.createElement('div');
  el.style.cssText = 'margin:12px 0;padding:10px 14px;background:var(--color-background-danger);border:0.5px solid var(--color-border-danger);border-radius:var(--border-radius-md);font-size:13px;color:var(--color-text-danger);font-family:var(--font-mono);white-space:pre-wrap;word-break:break-word;';
  el.textContent = 'Visualization error: ' + (e.reason ? e.reason.message || e.reason : 'Unknown');
  var content = document.getElementById('content');
  if (content) { content.prepend(el); } else { document.body.prepend(el); }
});
`;

function assembleDocument(html: string, theme: ThemeMode): string {
  return `<!DOCTYPE html>
<html data-theme="${theme}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta http-equiv="Content-Security-Policy" content="
    default-src 'self';
    script-src 'unsafe-inline' 'unsafe-eval'
      https://cdnjs.cloudflare.com
      https://esm.sh
      https://cdn.jsdelivr.net
      https://unpkg.com;
    style-src 'unsafe-inline';
    img-src 'self' data: blob:;
    font-src 'self' data:;
    connect-src 'self';
  ">
  <style>
    ${THEME_CSS}
    ${SVG_CLASSES_CSS}
    ${FORM_STYLES_CSS}
  </style>
  <script>${ERROR_HANDLER_JS}</script>
</head>
<body>
  <div id="content">${html}</div>
  <script>${BRIDGE_JS}</script>
</body>
</html>`;
}

export function WidgetRenderer({ title, html, theme, onSendPrompt }: WidgetRendererProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const committedHtmlRef = useRef("");
  const lastThemeRef = useRef<ThemeMode>(theme);

  const handleMessage = useCallback(
    (event: MessageEvent) => {
      if (!iframeRef.current || event.source !== iframeRef.current.contentWindow) {
        return;
      }

      const payload = event.data as { type?: string; height?: number; text?: string; url?: string };
      if (payload.type === "widget-resize" && typeof payload.height === "number") {
        setHeight(Math.max(80, Math.min(payload.height + 48, 6000)));
        return;
      }

      if (payload.type === "open-link" && typeof payload.url === "string") {
        window.open(payload.url, "_blank", "noopener,noreferrer");
        return;
      }

      if (payload.type === "send-prompt" && typeof payload.text === "string") {
        onSendPrompt?.(payload.text);
      }
    },
    [onSendPrompt],
  );

  useEffect(() => {
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [handleMessage]);

  useEffect(() => {
    if (!iframeRef.current || !html) {
      return;
    }

    const shouldWrite = committedHtmlRef.current !== html || lastThemeRef.current !== theme;
    if (!shouldWrite) {
      return;
    }

    committedHtmlRef.current = html;
    lastThemeRef.current = theme;
    iframeRef.current.srcdoc = assembleDocument(html, theme);
    setLoaded(false);
    setHeight(0);
  }, [html, theme]);

  useEffect(() => {
    if (!html) return;

    if (loaded && height > 0) return;

    const fallback = window.setTimeout(() => {
      setLoaded(true);
      setHeight((current) => (current > 0 ? current : 520));
    }, 2500);

    return () => window.clearTimeout(fallback);
  }, [html, loaded, height]);

  const ready = loaded && height > 0;
  const showLoading = Boolean(html) && !ready;
  const loadingPhrase = useLoadingPhrase(showLoading);

  return (
    <div className="widget-shell">
      {showLoading ? (
        <div className="widget-loading" aria-live="polite">
          <div className="widget-loading-stripe" />
          <div className="widget-loading-body">
            <div className="widget-loading-spinner" />
            <span>{loadingPhrase}...</span>
          </div>
        </div>
      ) : null}

      <iframe
        ref={iframeRef}
        sandbox="allow-scripts allow-same-origin"
        className="widget-iframe"
        scrolling="no"
        onLoad={() => setLoaded(true)}
        style={{
          height: ready ? `${height}px` : "0px",
          opacity: ready ? 1 : 0,
          display: html ? "block" : "none",
        }}
        title={title}
      />
    </div>
  );
}
