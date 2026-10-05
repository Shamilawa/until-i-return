import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { SignJWT, jwtVerify } from "jose";
import type { Role } from "@/lib/config";

export const SESSION_COOKIE = "session";
// Long enough to cover the whole time apart without signing in again.
const SESSION_DAYS = 200;

function secretKey(): Uint8Array {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 16) throw new Error("SESSION_SECRET is missing or too short. See .env.example.");
  return new TextEncoder().encode(secret);
}

export async function createSession(role: Role): Promise<void> {
  const expires = new Date(Date.now() + SESSION_DAYS * 86_400_000);
  const token = await new SignJWT({ role })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expires)
    .sign(secretKey());

  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires,
  });
}

export async function destroySession(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE);
}

/** The signed-in role, or null. Verified once per request. */
export const getRole = cache(async (): Promise<Role | null> => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey(), { algorithms: ["HS256"] });
    return payload.role === "author" || payload.role === "reader" ? payload.role : null;
  } catch {
    return null;
  }
});

export async function requireRole(): Promise<Role> {
  const role = await getRole();
  if (!role) redirect("/login");
  return role;
}

/** Author-only pages and actions. The reader gets a 404, as if the page did not exist. */
export async function requireAuthor(): Promise<void> {
  const role = await requireRole();
  if (role !== "author") notFound();
}
