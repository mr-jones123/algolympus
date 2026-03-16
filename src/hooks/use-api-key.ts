import { useCallback, useEffect, useMemo, useState } from "react";
import type { ProviderId, ProviderConfig } from "@/types";

function storageKey(providerId: ProviderId): string {
  return `algolympus.${providerId}.apiKey`;
}

function readStoredApiKey(providerId: ProviderId): string {
  if (typeof window === "undefined") {
    return "";
  }
  return localStorage.getItem(storageKey(providerId)) ?? "";
}

function isValidKey(value: string, provider: ProviderConfig): boolean {
  const trimmed = value.trim();
  return trimmed.startsWith(provider.keyPrefix) && trimmed.length >= 20;
}

export function useApiKey(provider: ProviderConfig) {
  const [apiKey, setApiKeyState] = useState<string>("");

  useEffect(() => {
    setApiKeyState(readStoredApiKey(provider.id));
  }, [provider.id]);

  const hasApiKey = useMemo(() => isValidKey(apiKey, provider), [apiKey, provider]);

  const setApiKey = useCallback(
    (nextKey: string) => {
      const normalized = nextKey.trim();
      setApiKeyState(normalized);
      if (normalized.length === 0) {
        localStorage.removeItem(storageKey(provider.id));
        return;
      }
      localStorage.setItem(storageKey(provider.id), normalized);
    },
    [provider.id],
  );

  const removeApiKey = useCallback(() => {
    setApiKeyState("");
    localStorage.removeItem(storageKey(provider.id));
  }, [provider.id]);

  const isValidApiKeyFormat = useCallback(
    (value: string) => isValidKey(value, provider),
    [provider],
  );

  return {
    apiKey,
    hasApiKey,
    setApiKey,
    removeApiKey,
    isValidApiKeyFormat,
  };
}
