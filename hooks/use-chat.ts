"use client";

import { useMutation } from "@tanstack/react-query";
import { ChatMessage, ChatResponse, GroundingMetadata } from "@/lib/types";

interface ChatParams {
  storeId: string;
  messages: ChatMessage[];
  model?: string;
  metadataFilter?: string;
}

async function sendChat(params: ChatParams): Promise<ChatResponse> {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to send message");
  }

  return response.json();
}

export function useChat() {
  return useMutation({
    mutationFn: sendChat,
  });
}

export type { ChatMessage, ChatResponse, GroundingMetadata };
