"use client";

import { useState, useCallback, useRef } from "react";
import { ChatMessage, StreamChunk, GroundingChunk } from "@/lib/types";

interface UseChatStreamOptions {
  storeId: string;
  model?: string;
  metadataFilter?: string;
}

interface UseChatStreamReturn {
  messages: ChatMessage[];
  isStreaming: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
  clearMessages: () => void;
  abortStream: () => void;
}

export function useChatStream({
  storeId,
  model,
  metadataFilter,
}: UseChatStreamOptions): UseChatStreamReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isStreaming) return;

      setError(null);
      setIsStreaming(true);

      const userMessage: ChatMessage = { role: "user", content: content.trim() };
      const newMessages = [...messages, userMessage];
      setMessages(newMessages);

      // Create placeholder for assistant message
      const assistantMessage: ChatMessage = { role: "assistant", content: "" };
      setMessages([...newMessages, assistantMessage]);

      abortControllerRef.current = new AbortController();

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            storeId,
            messages: newMessages,
            model,
            metadataFilter: metadataFilter || undefined,
          }),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to send message");
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error("No response body");

        const decoder = new TextDecoder();
        let accumulatedContent = "";
        let citations: GroundingChunk[] | undefined;
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");

          // Keep the last incomplete line in the buffer
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const chunk: StreamChunk = JSON.parse(line.slice(6));

                if (chunk.type === "text") {
                  accumulatedContent += chunk.content;
                  setMessages((prev) => {
                    const updated = [...prev];
                    updated[updated.length - 1] = {
                      role: "assistant",
                      content: accumulatedContent,
                    };
                    return updated;
                  });
                } else if (chunk.type === "done") {
                  citations = chunk.citations;
                  setMessages((prev) => {
                    const updated = [...prev];
                    updated[updated.length - 1] = {
                      role: "assistant",
                      content: accumulatedContent,
                      citations,
                    };
                    return updated;
                  });
                } else if (chunk.type === "error") {
                  throw new Error(chunk.message);
                }
              } catch (parseError) {
                // Skip malformed JSON lines
                if (parseError instanceof Error && parseError.message !== "Unexpected end of JSON input") {
                  console.warn("Failed to parse SSE chunk:", line);
                }
              }
            }
          }
        }
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          // Stream was aborted, keep partial content
          return;
        }
        setError(err instanceof Error ? err.message : "Failed to send message");
        // Remove the assistant message on error
        setMessages(newMessages);
      } finally {
        setIsStreaming(false);
        abortControllerRef.current = null;
      }
    },
    [messages, isStreaming, storeId, model, metadataFilter]
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  const abortStream = useCallback(() => {
    abortControllerRef.current?.abort();
  }, []);

  return {
    messages,
    isStreaming,
    error,
    sendMessage,
    clearMessages,
    abortStream,
  };
}

export type { ChatMessage };
