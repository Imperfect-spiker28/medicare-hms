import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import type { Role } from "./db/types";

const SESSION_COOKIE = "mch_session";
const secretKey = process.env.JWT_SECRET || "dev-only-insecure-secret-change-me-which-is-at-least-256-bits-long-for-hmac-sha-security";
const rawKey = new TextEncoder().encode(secretKey);
const encodedKey = new Uint8Array(Math.max(rawKey.length, 32));
encodedKey.set(rawKey);

export interface SessionPayload {
  userId: string;
  role: Role;
  fullName: string;
  [key: string]: unknown;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createSessionToken(payload: SessionPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(encodedKey);
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, encodedKey);
    return {
      userId: (payload.userId || payload.sub) as string,
      role: payload.role as Role,
      fullName: payload.fullName as string,
      ...payload,
    };
  } catch {
    return null;
  }
}

export async function setSessionCookie(token: string) {
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export const SESSION_COOKIE_NAME = SESSION_COOKIE;
