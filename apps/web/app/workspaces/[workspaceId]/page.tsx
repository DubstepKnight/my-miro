import { BoardList } from "../../../components/board-list";
import { listBoards } from "../../../lib/api";

interface WorkspacePageProps {
  params: Promise<{ workspaceId: string }>;
}

export default async function WorkspacePage({ params }: WorkspacePageProps) {
  const { workspaceId } = await params;
  const boards = await listBoards(workspaceId);

  return (
    <main>
      <h1>Workspace {workspaceId}</h1>
      <p>Board shell with API-backed CRUD.</p>
      <p>
        <a href="/" className="secondary">
          Back
        </a>
      </p>
      <BoardList workspaceId={workspaceId} boards={boards} />
    </main>
  );
}
