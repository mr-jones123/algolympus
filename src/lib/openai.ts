import { GoogleGenAI } from "@google/genai";

export function createClient(apiKey: string): GoogleGenAI {
  return new GoogleGenAI({ apiKey });
}
