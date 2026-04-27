import { NextResponse } from "next/server";
import { createBoard } from "../../../../../lib/api";

interface RouteContext {
  params: Promise<{ workspaceId: string }>;
}

export async function POST(request: Request, context: RouteContext) {
  const body = (await request.json()) as { title: string };
  const { workspaceId } = await context.params;
  const board = await createBoard(workspaceId, body.title);
  return NextResponse.json(board);
}
