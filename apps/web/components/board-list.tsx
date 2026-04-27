"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { BoardDto } from "@my-miro/contracts";

interface BoardListProps {
  workspaceId: string;
  boards: BoardDto[];
}

export function BoardList({ workspaceId, boards }: BoardListProps) {
  const [title, setTitle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  async function onCreateBoard(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      const response = await fetch(`/api/workspaces/${workspaceId}/boards`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ title })
      });

      if (!response.ok) {
        setError("Failed to create board");
        return;
      }

      setTitle("");
      router.refresh();
    });
  }

  return (
    <section className="card">
      <h2>Boards</h2>
      <form className="row" onSubmit={onCreateBoard}>
        <input
          placeholder="Sprint planning"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          required
          minLength={1}
          maxLength={120}
        />
        <button type="submit" disabled={isPending}>
          {isPending ? "Creating..." : "Create board"}
        </button>
      </form>
      {error ? <p>{error}</p> : null}
      <ul>
        {boards.map((board) => (
          <li key={board.id}>
            <a href={`/workspaces/${workspaceId}/boards/${board.id}`}>{board.title}</a>
          </li>
        ))}
      </ul>
    </section>
  );
}
