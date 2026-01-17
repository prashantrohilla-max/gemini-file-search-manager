import { NextRequest, NextResponse } from "next/server";
import { getAI, DEFAULT_MODEL } from "@/lib/gemini";
import { ChatRequest, ChatMessage, GroundingMetadata } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const ai = getAI();
    const body: ChatRequest = await request.json();
    const { storeId, messages, model = DEFAULT_MODEL, metadataFilter } = body;

    if (!storeId) {
      return NextResponse.json(
        { error: "storeId is required" },
        { status: 400 }
      );
    }

    if (!messages || messages.length === 0) {
      return NextResponse.json(
        { error: "messages are required" },
        { status: 400 }
      );
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

    const response = await ai.models.generateContent({
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

    const responseText = response.text || "";
    const groundingMetadata = response.candidates?.[0]
      ?.groundingMetadata as GroundingMetadata | undefined;

    const assistantMessage: ChatMessage = {
      role: "assistant",
      content: responseText,
      citations: groundingMetadata?.groundingChunks,
    };

    return NextResponse.json({
      message: assistantMessage,
      groundingMetadata,
    });
  } catch (error) {
    console.error("Error in chat:", error);
    const message = error instanceof Error ? error.message : "Failed to generate response";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
