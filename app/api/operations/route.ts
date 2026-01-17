import { NextRequest, NextResponse } from "next/server";
import { getAI } from "@/lib/gemini";

export async function GET(request: NextRequest) {
  try {
    const ai = getAI();
    const url = new URL(request.url);
    const operationName = url.searchParams.get("name");

    if (!operationName) {
      return NextResponse.json(
        { error: "Operation name is required" },
        { status: 400 }
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const operation = await ai.operations.get({ operation: operationName as any });

    return NextResponse.json({ operation });
  } catch (error) {
    console.error("Error getting operation:", error);
    const message = error instanceof Error ? error.message : "Failed to get operation";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
