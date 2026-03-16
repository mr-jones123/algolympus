import OpenAI from "openai";
import type { ProviderConfig } from "@/types";

export function createClient(apiKey: string, provider: ProviderConfig): OpenAI {
  return new OpenAI({
    apiKey,
    baseURL: provider.baseURL,
    dangerouslyAllowBrowser: true,
  });
}
