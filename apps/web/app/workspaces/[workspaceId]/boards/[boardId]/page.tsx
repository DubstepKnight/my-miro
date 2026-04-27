interface BoardPageProps {
  params: Promise<{ workspaceId: string; boardId: string }>;
}

export default async function BoardPage({ params }: BoardPageProps) {
  const { workspaceId, boardId } = await params;
  const realtimeUrl = process.env.NEXT_PUBLIC_REALTIME_URL ?? "ws://localhost:1234";

  return (
    <main>
      <h1>Board {boardId}</h1>
      <p>
        Workspace: <strong>{workspaceId}</strong>
      </p>
      <p>
        Realtime room endpoint: <code>{`${realtimeUrl}/${boardId}`}</code>
      </p>
      <section className="card">
        <h2>Editor integration checkpoint</h2>
        <p>
          `tldraw` + `Yjs` client integration goes here. This route is now in place for Phase 2 realtime MVP.
        </p>
      </section>
    </main>
  );
}
