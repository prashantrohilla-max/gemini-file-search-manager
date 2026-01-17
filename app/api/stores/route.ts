import { NextRequest, NextResponse } from "next/server";
import { getAI } from "@/lib/gemini";
import { FileSearchStore } from "@/lib/types";

export async function GET() {
  try {
    const ai = getAI();
    const response = await ai.fileSearchStores.list();

    const stores: FileSearchStore[] = [];
    for await (const store of response) {
      stores.push(store as FileSearchStore);
    }

    return NextResponse.json({ stores });
  } catch (error) {
    console.error("Error listing stores:", error);
    const message = error instanceof Error ? error.message : "Failed to list stores";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const ai = getAI();
    const body = await request.json();
    const { displayName } = body;

    if (!displayName) {
      return NextResponse.json(
        { error: "displayName is required" },
        { status: 400 }
      );
    }

    const store = await ai.fileSearchStores.create({
      config: { displayName },
    });

    return NextResponse.json({ store });
  } catch (error) {
    console.error("Error creating store:", error);
    const message = error instanceof Error ? error.message : "Failed to create store";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
