import { NextResponse } from "next/server";
import type { BoardDocument } from "@my-miro/contracts";
import { getBoardState, saveBoardState } from "../../../../../lib/api";

interface BoardStateRouteProps {
  params: Promise<{ boardId: string }>;
}

export async function GET(_request: Request, { params }: BoardStateRouteProps) {
  const { boardId } = await params;
  const state = await getBoardState(boardId);

  if (!state) {
    return NextResponse.json({ message: "Board state not found" }, { status: 404 });
  }

  return NextResponse.json(state);
}

export async function PUT(request: Request, { params }: BoardStateRouteProps) {
  const { boardId } = await params;
  const body = (await request.json()) as BoardDocument;

  try {
    const state = await saveBoardState(boardId, body);
    return NextResponse.json(state);
  } catch (error) {
    const statusMatch = /(\d+)$/.exec(String(error));
    const status = statusMatch ? Number(statusMatch[1]) : 400;
    return NextResponse.json({ message: "Failed to save board state" }, { status });
  }
}
