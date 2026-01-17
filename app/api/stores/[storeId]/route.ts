import { NextRequest, NextResponse } from "next/server";
import { getAI } from "@/lib/gemini";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ storeId: string }> }
) {
  try {
    const ai = getAI();
    const { storeId } = await params;
    const name = `fileSearchStores/${storeId}`;

    const store = await ai.fileSearchStores.get({ name });

    return NextResponse.json({ store });
  } catch (error) {
    console.error("Error getting store:", error);
    const message = error instanceof Error ? error.message : "Failed to get store";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ storeId: string }> }
) {
  try {
    const ai = getAI();
    const { storeId } = await params;
    const name = `fileSearchStores/${storeId}`;

    const url = new URL(request.url);
    const force = url.searchParams.get("force") === "true";

    await ai.fileSearchStores.delete({
      name,
      config: { force },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting store:", error);
    const message = error instanceof Error ? error.message : "Failed to delete store";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
