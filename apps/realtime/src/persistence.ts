import type { Doc } from "yjs";

export interface RealtimePersistence {
  load(documentName: string): Promise<Uint8Array | null>;
  save(documentName: string, state: Uint8Array): Promise<void>;
  saveSnapshot(documentName: string, doc: Doc): Promise<void>;
}

const inMemoryState = new Map<string, Uint8Array>();

export const persistence: RealtimePersistence = {
  async load(documentName) {
    return inMemoryState.get(documentName) ?? null;
  },
  async save(documentName, state) {
    inMemoryState.set(documentName, state);
  },
  async saveSnapshot() {
    // TODO: Persist snapshots to Postgres/GCS and store metadata in board_versions.
  }
};
