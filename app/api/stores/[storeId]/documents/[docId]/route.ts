import { NextRequest, NextResponse } from "next/server";
import { getAI } from "@/lib/gemini";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ storeId: string; docId: string }> }
) {
  try {
    const ai = getAI();
    const { storeId, docId } = await params;
    const name = `fileSearchStores/${storeId}/documents/${docId}`;

    await ai.fileSearchStores.documents.delete({
      name,
      config: { force: true },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting document:", error);
    const message = error instanceof Error ? error.message : "Failed to delete document";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
