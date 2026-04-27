import { Server } from "@hocuspocus/server";
import * as Y from "yjs";
import { persistence } from "./persistence.js";

const port = Number(process.env.PORT ?? 1234);

const server = new Server({
  port,
  async onLoadDocument({ documentName }) {
    const doc = new Y.Doc();
    const data = await persistence.load(documentName);

    if (data) {
      Y.applyUpdate(doc, data);
    }

    return doc;
  },
  async onStoreDocument({ document, documentName }) {
    const update = Y.encodeStateAsUpdate(document);
    await persistence.save(documentName, update);
    await persistence.saveSnapshot(documentName, document);
  },
  async onConnect({ documentName, request }) {
    const user = request?.headers?.["x-user-id"] ?? "anonymous";
    console.log(`[realtime] connect board=${documentName} user=${String(user)}`);
  }
});

await server.listen();
console.log(`[realtime] listening on ${port}`);
