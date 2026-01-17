import { NextRequest } from "next/server";
import { getAI, DEFAULT_MODEL } from "@/lib/gemini";
import { ChatRequest, GroundingMetadata } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const ai = getAI();
    const body: ChatRequest = await request.json();
    const { storeId, messages, model = DEFAULT_MODEL, metadataFilter } = body;

    if (!storeId) {
      return new Response(JSON.stringify({ error: "storeId is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!messages || messages.length === 0) {
      return new Response(JSON.stringify({ error: "messages are required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const fileSearchStoreName = `fileSearchStores/${storeId}`;

    // Build the contents from messages
    const contents = messages.map((msg) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }));

    // Build file search tool config
    const fileSearchConfig: Record<string, unknown> = {
      fileSearchStoreNames: [fileSearchStoreName],
    };
    if (metadataFilter) {
      fileSearchConfig.metadataFilter = metadataFilter;
    }

    // Use streaming API
    const stream = await ai.models.generateContentStream({
      model,
      contents,
      config: {
        tools: [
          {
            fileSearch: fileSearchConfig,
          },
        ],
      },
    });

    // Create SSE response
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          let groundingMetadata: GroundingMetadata | undefined;

          for await (const chunk of stream) {
            // Extract only text parts from the response
            // Skip executableCode and codeExecutionResult as those are internal
            // file search operations that shouldn't be shown to users
            const parts = chunk.candidates?.[0]?.content?.parts || [];
            for (const part of parts) {
              if ("text" in part && part.text) {
                controller.enqueue(
                  encoder.encode(
                    `data: ${JSON.stringify({ type: "text", content: part.text })}\n\n`
                  )
                );
              }
            }

            // Check for grounding metadata in the chunk
            const chunkMetadata = chunk.candidates?.[0]
              ?.groundingMetadata as GroundingMetadata | undefined;
            if (chunkMetadata) {
              groundingMetadata = chunkMetadata;
            }
          }

          // Send final message with metadata
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "done",
                groundingMetadata,
                citations: groundingMetadata?.groundingChunks,
              })}\n\n`
            )
          );
          controller.close();
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Stream error";
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: "error", message })}\n\n`
            )
          );
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Error in chat:", error);
    const message =
      error instanceof Error ? error.message : "Failed to generate response";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
