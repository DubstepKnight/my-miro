import { notFound, redirect } from "next/navigation";
import { BoardCanvas } from "../../../../../components/board-canvas";
import { getBoard, getBoardState, me } from "../../../../../lib/api";

interface BoardPageProps {
  params: Promise<{ workspaceId: string; boardId: string }>;
}

export default async function BoardPage({ params }: BoardPageProps) {
  const { boardId } = await params;
  const user = await me();
  if (!user) {
    redirect("/");
  }

  const [board, state] = await Promise.all([getBoard(boardId), getBoardState(boardId)]);
  if (!board || !state) {
    notFound();
  }

  return <BoardCanvas board={board} currentUserId={user.id} initialState={state} />;
}
