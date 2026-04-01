import "server-only";

import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import os from "node:os";

function getUploadRoot() {
  const runtimeRoot =
    process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME
      ? path.join(os.tmpdir(), "tecnoglobal-fsm", "uploads")
      : path.join(/* turbopackIgnore: true */ process.cwd(), "data", "uploads");

  return process.env.TECNOGLOBAL_UPLOAD_DIR
    ? path.resolve(process.env.TECNOGLOBAL_UPLOAD_DIR)
    : runtimeRoot;
}

export async function saveBinaryFile(relativePath: string, content: Uint8Array) {
  const absolutePath = path.join(getUploadRoot(), relativePath);
  await mkdir(path.dirname(absolutePath), { recursive: true });
  await writeFile(absolutePath, content);
  return absolutePath;
}

export async function readBinaryFile(relativePath: string) {
  const absolutePath = path.join(getUploadRoot(), relativePath);
  return readFile(absolutePath);
}

export async function deleteBinaryFile(relativePath: string) {
  const absolutePath = path.join(getUploadRoot(), relativePath);
  await unlink(absolutePath).catch(() => undefined);
}
