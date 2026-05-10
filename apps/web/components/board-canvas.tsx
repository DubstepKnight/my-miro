"use client";

import type { BoardDocument, BoardDto, BoardElement, FreehandPathElement, StickyNoteElement } from "@my-miro/contracts";
import { useEffect, useMemo, useRef, useState } from "react";

type Tool = "select" | "note" | "draw";
type SaveStatus = "saved" | "saving" | "unsaved" | "error";

interface BoardCanvasProps {
  board: BoardDto;
  initialState: BoardDocument;
  currentUserId: string;
}

const noteColors = ["#fff3bf", "#d3f9d8", "#d0ebff", "#ffe3e3"];
const pathColors = ["#1f2937", "#0b7285", "#c92a2a", "#6741d9"];

export function BoardCanvas({ board, initialState, currentUserId }: BoardCanvasProps) {
  const [document, setDocument] = useState<BoardDocument>(initialState);
  const [tool, setTool] = useState<Tool>("select");
  const [noteColor, setNoteColor] = useState(noteColors[0]);
  const [pathColor, setPathColor] = useState(pathColors[0]);
  const [strokeWidth, setStrokeWidth] = useState(4);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("saved");
  const [drag, setDrag] = useState<{ id: string; pointerId: number; offsetX: number; offsetY: number } | null>(null);
  const [activePathId, setActivePathId] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const lastSavedJsonRef = useRef(JSON.stringify(initialState));
  const canEdit = board.role === "OWNER" || board.role === "EDITOR";

  const elements = useMemo(
    () => Object.values(document.elements).sort((a, b) => a.zIndex - b.zIndex),
    [document.elements]
  );
  const maxZIndex = useMemo(() => elements.reduce((highest, element) => Math.max(highest, element.zIndex), 0), [elements]);

  useEffect(() => {
    if (!canEdit) return;

    const currentJson = JSON.stringify(document);
    if (currentJson === lastSavedJsonRef.current) {
      setSaveStatus("saved");
      return;
    }

    setSaveStatus("unsaved");
    const timeout = window.setTimeout(async () => {
      setSaveStatus("saving");
      try {
        const response = await fetch(`/api/boards/${board.id}/state`, {
          method: "PUT",
          headers: { "content-type": "application/json" },
          body: currentJson
        });

        if (!response.ok) {
          throw new Error(`Save failed: ${response.status}`);
        }

        const saved = (await response.json()) as BoardDocument;
        lastSavedJsonRef.current = JSON.stringify(saved);
        setSaveStatus("saved");
      } catch {
        setSaveStatus("error");
      }
    }, 700);

    return () => window.clearTimeout(timeout);
  }, [board.id, canEdit, document]);

  function createId(prefix: string) {
    return `${prefix}_${crypto.randomUUID()}`;
  }

  function now() {
    return new Date().toISOString();
  }

  function pointerToCanvas(event: React.PointerEvent<HTMLElement>) {
    const rect = canvasRef.current?.getBoundingClientRect();
    return {
      x: event.clientX - (rect?.left ?? 0),
      y: event.clientY - (rect?.top ?? 0)
    };
  }

  function updateElement(id: string, updater: (element: BoardElement) => BoardElement) {
    setDocument((current) => {
      const element = current.elements[id];
      if (!element) return current;

      return {
        ...current,
        elements: {
          ...current.elements,
          [id]: updater(element)
        }
      };
    });
  }

  function addNote(x: number, y: number) {
    const timestamp = now();
    const id = createId("note");
    const note: StickyNoteElement = {
      id,
      type: "note",
      x: Math.max(0, x - 110),
      y: Math.max(0, y - 70),
      zIndex: maxZIndex + 1,
      createdById: currentUserId,
      createdAt: timestamp,
      updatedAt: timestamp,
      width: 220,
      height: 140,
      text: "",
      color: noteColor
    };

    setDocument((current) => ({
      ...current,
      elements: {
        ...current.elements,
        [id]: note
      }
    }));
    setTool("select");
  }

  function startPath(point: { x: number; y: number }) {
    const timestamp = now();
    const id = createId("path");
    const path: FreehandPathElement = {
      id,
      type: "path",
      x: 0,
      y: 0,
      zIndex: maxZIndex + 1,
      createdById: currentUserId,
      createdAt: timestamp,
      updatedAt: timestamp,
      points: [point],
      stroke: pathColor,
      strokeWidth
    };

    setDocument((current) => ({
      ...current,
      elements: {
        ...current.elements,
        [id]: path
      }
    }));
    setActivePathId(id);
  }

  function appendPathPoint(id: string, point: { x: number; y: number }) {
    updateElement(id, (element) => {
      if (element.type !== "path") return element;
      return {
        ...element,
        points: [...element.points, point],
        updatedAt: now()
      };
    });
  }

  function handleCanvasPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (!canEdit || event.target !== event.currentTarget) return;

    const point = pointerToCanvas(event);
    if (tool === "note") {
      addNote(point.x, point.y);
      return;
    }

    if (tool === "draw") {
      event.currentTarget.setPointerCapture(event.pointerId);
      startPath(point);
    }
  }

  function handleCanvasPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (!activePathId) return;
    appendPathPoint(activePathId, pointerToCanvas(event));
  }

  function handleCanvasPointerUp(event: React.PointerEvent<HTMLDivElement>) {
    if (!activePathId) return;
    appendPathPoint(activePathId, pointerToCanvas(event));
    setActivePathId(null);
  }

  function handleNotePointerDown(event: React.PointerEvent<HTMLDivElement>, note: StickyNoteElement) {
    if (!canEdit || event.button !== 0 || event.target instanceof HTMLTextAreaElement || event.target instanceof HTMLButtonElement) return;

    event.currentTarget.setPointerCapture(event.pointerId);
    const point = pointerToCanvas(event);
    setDrag({
      id: note.id,
      pointerId: event.pointerId,
      offsetX: point.x - note.x,
      offsetY: point.y - note.y
    });
    updateElement(note.id, (element) => ({ ...element, zIndex: maxZIndex + 1, updatedAt: now() }));
  }

  function handleNotePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (!drag || drag.pointerId !== event.pointerId) return;

    const point = pointerToCanvas(event);
    updateElement(drag.id, (element) => ({
      ...element,
      x: Math.max(0, point.x - drag.offsetX),
      y: Math.max(0, point.y - drag.offsetY),
      updatedAt: now()
    }));
  }

  function handleNotePointerUp(event: React.PointerEvent<HTMLDivElement>) {
    if (!drag || drag.pointerId !== event.pointerId) return;
    setDrag(null);
  }

  function updateNoteText(id: string, text: string) {
    updateElement(id, (element) => {
      if (element.type !== "note") return element;
      return {
        ...element,
        text,
        updatedAt: now()
      };
    });
  }

  function deleteElement(id: string) {
    setDocument((current) => {
      const nextElements = { ...current.elements };
      delete nextElements[id];
      return {
        ...current,
        elements: nextElements
      };
    });
  }

  return (
    <div className="board-page">
      <header className="board-header">
        <div>
          <a href={`/workspaces/${board.workspaceId}`}>Back to workspace</a>
          <h1>{board.title}</h1>
        </div>
        <span className={`save-status save-status-${saveStatus}`}>{saveStatus}</span>
      </header>

      <div className="board-toolbar" aria-label="Board tools">
        <button className={tool === "select" ? "active" : ""} type="button" onClick={() => setTool("select")}>
          Select
        </button>
        <button className={tool === "note" ? "active" : ""} type="button" disabled={!canEdit} onClick={() => setTool("note")}>
          Note
        </button>
        <button className={tool === "draw" ? "active" : ""} type="button" disabled={!canEdit} onClick={() => setTool("draw")}>
          Draw
        </button>
        <div className="toolbar-group" aria-label="Note color">
          {noteColors.map((color) => (
            <button
              aria-label={`Use note color ${color}`}
              className={noteColor === color ? "swatch active" : "swatch"}
              key={color}
              style={{ background: color }}
              type="button"
              onClick={() => setNoteColor(color)}
            />
          ))}
        </div>
        <div className="toolbar-group" aria-label="Stroke color">
          {pathColors.map((color) => (
            <button
              aria-label={`Use stroke color ${color}`}
              className={pathColor === color ? "swatch active" : "swatch"}
              key={color}
              style={{ background: color }}
              type="button"
              onClick={() => setPathColor(color)}
            />
          ))}
        </div>
        <label className="stroke-control">
          Stroke
          <input min="2" max="14" type="range" value={strokeWidth} onChange={(event) => setStrokeWidth(Number(event.target.value))} />
        </label>
      </div>

      <div
        className={`canvas-viewport tool-${tool}`}
        ref={canvasRef}
        onPointerDown={handleCanvasPointerDown}
        onPointerMove={handleCanvasPointerMove}
        onPointerUp={handleCanvasPointerUp}
        onPointerCancel={() => setActivePathId(null)}
      >
        <svg className="drawing-layer" aria-hidden="true">
          {elements.map((element) => {
            if (element.type !== "path") return null;

            const points = element.points.map((point) => `${point.x},${point.y}`).join(" ");
            return (
              <polyline
                fill="none"
                key={element.id}
                points={points}
                stroke={element.stroke}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={element.strokeWidth}
              />
            );
          })}
        </svg>

        {elements.map((element) => {
          if (element.type !== "note") return null;

          return (
            <div
              className="sticky-note"
              key={element.id}
              style={{
                background: element.color,
                height: element.height,
                left: element.x,
                top: element.y,
                width: element.width,
                zIndex: element.zIndex
              }}
              onPointerDown={(event) => handleNotePointerDown(event, element)}
              onPointerMove={handleNotePointerMove}
              onPointerUp={handleNotePointerUp}
              onPointerCancel={() => setDrag(null)}
            >
              {canEdit ? (
                <button className="note-delete" type="button" onClick={() => deleteElement(element.id)} aria-label="Delete note">
                  x
                </button>
              ) : null}
              <textarea
                aria-label="Sticky note text"
                disabled={!canEdit}
                maxLength={500}
                placeholder="Write a note"
                value={element.text}
                onChange={(event) => updateNoteText(element.id, event.target.value)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
