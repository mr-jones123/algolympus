import { useCallback, useEffect, useMemo, useState } from "react";
import { KEY_PREFIX } from "@/types";

const STORAGE_KEY = "algolympus.gemini.apiKey";

function isValidKey(value: string): boolean {
  const trimmed = value.trim();
  return trimmed.startsWith(KEY_PREFIX) && trimmed.length >= 20;
}

export function useApiKey() {
  const [apiKey, setApiKeyState] = useState<string>("");

  useEffect(() => {
    setApiKeyState(localStorage.getItem(STORAGE_KEY) ?? "");
  }, []);

  const hasApiKey = useMemo(() => isValidKey(apiKey), [apiKey]);

  const setApiKey = useCallback((nextKey: string) => {
    const normalized = nextKey.trim();
    setApiKeyState(normalized);
    if (normalized.length === 0) {
      localStorage.removeItem(STORAGE_KEY);
      return;
    }
    localStorage.setItem(STORAGE_KEY, normalized);
  }, []);

  const removeApiKey = useCallback(() => {
    setApiKeyState("");
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const isValidApiKeyFormat = useCallback((value: string) => isValidKey(value), []);

  return { apiKey, hasApiKey, setApiKey, removeApiKey, isValidApiKeyFormat };
}
