import "server-only";
import { createHash, timingSafeEqual } from "node:crypto";
import type { Role } from "@/lib/config";

// The only two accounts. Fixed on the backend, read from env so they never land in git.
const ACCOUNTS: { role: Role; username?: string; password?: string }[] = [
  { role: "author", username: process.env.AUTHOR_USERNAME, password: process.env.AUTHOR_PASSWORD },
  { role: "reader", username: process.env.READER_USERNAME, password: process.env.READER_PASSWORD },
];

function safeEqual(a: string, b: string): boolean {
  const digest = (s: string) => createHash("sha256").update(s).digest();
  return timingSafeEqual(digest(a), digest(b));
}

export function verifyCredentials(username: string, password: string): Role | null {
  const name = username.trim().toLowerCase();
  let match: Role | null = null;
  for (const account of ACCOUNTS) {
    if (!account.username || !account.password) continue;
    const ok = safeEqual(name, account.username.trim().toLowerCase()) && safeEqual(password, account.password);
    if (ok) match = account.role;
  }
  return match;
}
