import "server-only";
import { randomUUID } from "node:crypto";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { del, get, put } from "@vercel/blob";

// Without a Blob token (local dev) photos live on disk under .data/uploads.
const LOCAL_PREFIX = "local:";
const LOCAL_DIR = path.join(process.cwd(), ".data", "uploads");
// On Vercel always use Blob: the store may authenticate with a token or with
// BLOB_STORE_ID + OIDC, and the deployment's disk is read-only anyway.
const blobEnabled = () =>
  Boolean(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID || process.env.VERCEL);

// Stays under the server action body limit in next.config.ts.
export const MAX_PHOTO_BYTES = 3 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export function isAcceptablePhoto(file: File): boolean {
  return ALLOWED_TYPES.has(file.type) && file.size > 0 && file.size <= MAX_PHOTO_BYTES;
}

/** Stores the file privately and returns the reference to keep in photos.blob_url. */
export async function storePhoto(file: File): Promise<string> {
  const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const name = `${randomUUID()}.${ext}`;
  if (blobEnabled()) {
    const blob = await put(`photos/${name}`, file, { access: "private", contentType: file.type });
    return blob.url;
  }
  await mkdir(LOCAL_DIR, { recursive: true });
  await writeFile(path.join(LOCAL_DIR, name), Buffer.from(await file.arrayBuffer()));
  return LOCAL_PREFIX + name;
}

export async function readPhoto(blobUrl: string): Promise<ReadableStream<Uint8Array> | Uint8Array<ArrayBuffer> | null> {
  if (blobUrl.startsWith(LOCAL_PREFIX)) {
    try {
      return new Uint8Array(await readFile(path.join(LOCAL_DIR, path.basename(blobUrl.slice(LOCAL_PREFIX.length)))));
    } catch {
      return null;
    }
  }
  const result = await get(blobUrl, { access: "private" });
  return result?.statusCode === 200 ? result.stream : null;
}

export async function deleteStoredPhotos(blobUrls: string[]): Promise<void> {
  const local = blobUrls.filter((u) => u.startsWith(LOCAL_PREFIX));
  const remote = blobUrls.filter((u) => !u.startsWith(LOCAL_PREFIX));
  await Promise.all(
    local.map((u) => unlink(path.join(LOCAL_DIR, path.basename(u.slice(LOCAL_PREFIX.length)))).catch(() => {})),
  );
  if (remote.length > 0 && blobEnabled()) await del(remote);
}
