import "server-only";

import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

import { readDatabase, updateDatabase } from "@/server/db/store";
import type { SessionRecord } from "@/server/db/types";
import type { AuthenticatedUser } from "@/server/services/types";

function hashPassword(password: string, salt: string) {
  return scryptSync(password, salt, 64).toString("hex");
}

function constantTimeEquals(left: string, right: string) {
  return timingSafeEqual(Buffer.from(left, "hex"), Buffer.from(right, "hex"));
}

function buildAuthenticatedUser(
  user: Awaited<ReturnType<typeof readDatabase>>["users"][number],
): AuthenticatedUser {
  return {
    userId: user.id,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
    technicianId: user.technicianId,
  };
}

export async function loginWithPassword(email: string, password: string) {
  const database = await readDatabase();
  const normalizedEmail = email.trim().toLowerCase();
  const user = database.users.find((item) => item.email.toLowerCase() === normalizedEmail && item.active);

  if (!user) {
    return { ok: false as const, message: "Credenciales invalidas." };
  }

  const candidateHash = hashPassword(password, user.passwordSalt);
  if (!constantTimeEquals(candidateHash, user.passwordHash)) {
    return { ok: false as const, message: "Credenciales invalidas." };
  }

  const token = randomBytes(48).toString("hex");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString();

  await updateDatabase((current) => {
    const session: SessionRecord = {
      id: `session-${Date.now()}`,
      userId: user.id,
      token,
      expiresAt,
      createdAt: new Date().toISOString(),
    };

    return {
      ...current,
      sessions: [...current.sessions.filter((item) => item.userId !== user.id), session],
      audit: [
        ...current.audit,
        {
          id: `audit-${Date.now()}`,
          entityType: "session",
          entityId: session.id,
          action: "login",
          userId: user.id,
          createdAt: new Date().toISOString(),
        },
      ],
    };
  });

  return {
    ok: true as const,
    token,
    expiresAt,
    user: buildAuthenticatedUser(user),
  };
}

export async function getAuthenticatedUserByToken(token?: string | null) {
  if (!token) return null;

  const database = await readDatabase();
  const session = database.sessions.find((item) => item.token === token);

  if (!session) return null;
  if (new Date(session.expiresAt).getTime() <= Date.now()) {
    return null;
  }

  const user = database.users.find((item) => item.id === session.userId && item.active);
  if (!user) return null;

  return buildAuthenticatedUser(user);
}

export async function logoutByToken(token?: string | null) {
  if (!token) return;

  await updateDatabase((current) => ({
    ...current,
    sessions: current.sessions.filter((item) => item.token !== token),
  }));
}

export async function listLoginUsers() {
  const database = await readDatabase();
  return database.users.map((user) => ({
    email: user.email,
    role: user.role,
    fullName: user.fullName,
  }));
}
