import "server-only";

import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

function getUploadRoot() {
  return process.env.TECNOGLOBAL_UPLOAD_DIR
    ? path.resolve(process.env.TECNOGLOBAL_UPLOAD_DIR)
    : path.join(/* turbopackIgnore: true */ process.cwd(), "data", "uploads");
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
