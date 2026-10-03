import { NextRequest, NextResponse } from "next/server";
import {
  getAllMemories,
  deleteMemory,
  clearMemories,
  addLearnedMemory,
} from "@/lib/memoryStore";

export const runtime = "nodejs";

export async function GET() {
  try {
    const memories = getAllMemories();
    return NextResponse.json({
      success: true,
      count: memories.length,
      memories,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch memories";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (id === "all") {
      clearMemories();
      return NextResponse.json({ success: true, message: "All memories cleared" });
    }

    if (!id) {
      return NextResponse.json({ error: "Memory ID required" }, { status: 400 });
    }

    const deleted = deleteMemory(id);
    if (!deleted) {
      return NextResponse.json({ error: "Memory not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: `Memory ${id} deleted` });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to delete memory";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { topic, category, insight, source, contextSnippet } = body;

    if (!topic || !insight) {
      return NextResponse.json(
        { error: "Topic and insight are required." },
        { status: 400 }
      );
    }

    const memory = addLearnedMemory({
      topic,
      category: category || "user_insight",
      insight,
      source: source || "user_prompt",
      contextSnippet,
    });

    return NextResponse.json({ success: true, memory });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to add memory";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
