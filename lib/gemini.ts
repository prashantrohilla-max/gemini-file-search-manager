import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn("GEMINI_API_KEY is not set in environment variables");
}

export const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export function getAI(): GoogleGenAI {
  if (!ai) {
    throw new Error(
      "GEMINI_API_KEY is not configured. Please add it to your .env.local file."
    );
  }
  return ai;
}

export const SUPPORTED_MODELS = [
  { id: "gemini-3-pro-preview", name: "Gemini 3 Pro Preview" },
  { id: "gemini-3-flash-preview", name: "Gemini 3 Flash Preview" },
  { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash" },
  { id: "gemini-2.5-pro", name: "Gemini 2.5 Pro" },
  { id: "gemini-2.0-flash", name: "Gemini 2.0 Flash" },
] as const;

export const DEFAULT_MODEL = "gemini-3-flash-preview";
