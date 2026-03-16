import { useCallback, useEffect, useState } from "react";
import { PROVIDERS, type ProviderId } from "@/types";

const PROVIDER_STORAGE_KEY = "algolympus.provider";

function readStoredProvider(): ProviderId {
  if (typeof window === "undefined") {
    return "gemini";
  }
  const stored = localStorage.getItem(PROVIDER_STORAGE_KEY);
  if (stored === "openai" || stored === "gemini") {
    return stored;
  }
  return "gemini";
}

export function useProvider() {
  const [providerId, setProviderIdState] = useState<ProviderId>("gemini");

  useEffect(() => {
    setProviderIdState(readStoredProvider());
  }, []);

  const setProviderId = useCallback((next: ProviderId) => {
    setProviderIdState(next);
    localStorage.setItem(PROVIDER_STORAGE_KEY, next);
  }, []);

  const provider = PROVIDERS[providerId];

  return { providerId, provider, setProviderId };
}
