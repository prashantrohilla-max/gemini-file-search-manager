import { NextRequest, NextResponse } from "next/server";
import { getAI } from "@/lib/gemini";
import { ChunkingConfig, CustomMetadata } from "@/lib/types";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ storeId: string }> }
) {
  try {
    const ai = getAI();
    const { storeId } = await params;
    const fileSearchStoreName = `fileSearchStores/${storeId}`;

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const displayName = formData.get("displayName") as string | null;
    const chunkingConfigStr = formData.get("chunkingConfig") as string | null;
    const customMetadataStr = formData.get("customMetadata") as string | null;

    if (!file) {
      return NextResponse.json({ error: "File is required" }, { status: 400 });
    }

    // Parse optional configs
    let chunkingConfig: ChunkingConfig | undefined;
    if (chunkingConfigStr) {
      try {
        const parsed = JSON.parse(chunkingConfigStr);
        if (parsed.maxTokensPerChunk || parsed.maxOverlapTokens) {
          chunkingConfig = parsed;
        }
      } catch {
        // Ignore invalid JSON
      }
    }

    let customMetadata: CustomMetadata[] | undefined;
    if (customMetadataStr) {
      try {
        customMetadata = JSON.parse(customMetadataStr);
      } catch {
        // Ignore invalid JSON
      }
    }

    // Build upload config
    const config: Record<string, unknown> = {};
    if (displayName) {
      config.displayName = displayName;
    }
    if (chunkingConfig) {
      config.chunkingConfig = {
        whiteSpaceConfig: {
          maxTokensPerChunk: chunkingConfig.maxTokensPerChunk,
          maxOverlapTokens: chunkingConfig.maxOverlapTokens,
        },
      };
    }
    if (customMetadata && customMetadata.length > 0) {
      config.customMetadata = customMetadata;
    }

    // Create a Blob from the file for the SDK
    // Browsers often don't set correct MIME type for certain files (e.g., .md files)
    const arrayBuffer = await file.arrayBuffer();
    let mimeType = file.type;

    if (!mimeType || mimeType === "application/octet-stream") {
      const ext = file.name.toLowerCase().split(".").pop();
      const mimeMap: Record<string, string> = {
        md: "text/markdown",
        markdown: "text/markdown",
        txt: "text/plain",
        html: "text/html",
        htm: "text/html",
        pdf: "application/pdf",
        json: "application/json",
        csv: "text/csv",
        xml: "application/xml",
        yaml: "text/yaml",
        yml: "text/yaml",
      };
      mimeType = mimeMap[ext || ""] || "application/octet-stream";
    }

    const blob = new Blob([arrayBuffer], { type: mimeType });

    const operation = await ai.fileSearchStores.uploadToFileSearchStore({
      fileSearchStoreName,
      file: blob,
      config: Object.keys(config).length > 0 ? config : undefined,
    });

    // Return operation with done: true to skip client polling
    // The document list refreshes every 5 seconds and shows real status
    return NextResponse.json({
      operation: {
        ...operation,
        done: true,
      },
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    const message = error instanceof Error ? error.message : "Failed to upload file";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
