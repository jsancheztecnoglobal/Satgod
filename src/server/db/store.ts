import "server-only";

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

import { createSeedDatabase } from "@/server/db/seed";
import type { DatabaseState } from "@/server/db/types";

let writeQueue = Promise.resolve();

function resolveDbPath() {
  return process.env.TECNOGLOBAL_DB_FILE
    ? path.resolve(process.env.TECNOGLOBAL_DB_FILE)
    : path.join(/* turbopackIgnore: true */ process.cwd(), "data", "runtime-db.json");
}

async function ensureDbFile() {
  const dbPath = resolveDbPath();
  const directory = path.dirname(dbPath);
  await mkdir(directory, { recursive: true });

  try {
    await readFile(dbPath, "utf8");
  } catch {
    const initial = JSON.stringify(createSeedDatabase(), null, 2);
    await writeFile(dbPath, initial, "utf8");
  }

  return dbPath;
}

export async function readDatabase(): Promise<DatabaseState> {
  const dbPath = await ensureDbFile();
  const raw = await readFile(dbPath, "utf8");
  return JSON.parse(raw) as DatabaseState;
}

export async function writeDatabase(nextState: DatabaseState) {
  const dbPath = await ensureDbFile();
  writeQueue = writeQueue.then(async () => {
    await writeFile(dbPath, `${JSON.stringify(nextState, null, 2)}\n`, "utf8");
  });

  await writeQueue;
}

export async function updateDatabase(
  updater: (current: DatabaseState) => DatabaseState | Promise<DatabaseState>,
) {
  const current = await readDatabase();
  const next = await updater(current);
  await writeDatabase(next);
  return next;
}

export function createId(prefix: string) {
  return `${prefix}-${randomUUID()}`;
}
