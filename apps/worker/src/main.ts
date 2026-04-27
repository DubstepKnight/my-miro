const intervalMs = Number(process.env.WORKER_INTERVAL_MS ?? 30000);

async function runCompactionTick() {
  // TODO: Read pending boards and compact Yjs updates into version checkpoints.
  console.log("[worker] compaction tick", new Date().toISOString());
}

async function bootstrap() {
  await runCompactionTick();
  setInterval(runCompactionTick, intervalMs);
}

bootstrap();
