import { NextRequest, NextResponse } from "next/server";
import { getAI } from "@/lib/gemini";
import { FileSearchDocument } from "@/lib/types";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ storeId: string }> }
) {
  try {
    const ai = getAI();
    const { storeId } = await params;
    const parent = `fileSearchStores/${storeId}`;

    const response = await ai.fileSearchStores.documents.list({ parent });

    const documents: FileSearchDocument[] = [];
    for await (const doc of response) {
      documents.push(doc as FileSearchDocument);
    }

    return NextResponse.json({ documents });
  } catch (error) {
    console.error("Error listing documents:", error);
    const message = error instanceof Error ? error.message : "Failed to list documents";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
