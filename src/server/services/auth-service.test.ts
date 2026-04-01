import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  getAuthenticatedUserByToken,
  listLoginUsers,
  loginWithPassword,
  logoutByToken,
} from "@/server/services/auth-service";

let tempDir = "";

beforeEach(async () => {
  tempDir = await mkdtemp(path.join(os.tmpdir(), "tecnoglobal-auth-"));
  process.env.TECNOGLOBAL_DB_FILE = path.join(tempDir, "db.json");
});

afterEach(async () => {
  delete process.env.TECNOGLOBAL_DB_FILE;
  if (tempDir) {
    await rm(tempDir, { recursive: true, force: true });
  }
});

describe("auth-service", () => {
  it("allows login with seeded credentials and resolves a session user", async () => {
    const accounts = await listLoginUsers();
    expect(accounts.length).toBeGreaterThan(0);

    const result = await loginWithPassword("oficina@tecnoglobal.local", "tecnoglobal123");
    expect(result.ok).toBe(true);

    if (!result.ok) {
      throw new Error("expected valid login");
    }

    const user = await getAuthenticatedUserByToken(result.token);
    expect(user?.email).toBe("oficina@tecnoglobal.local");
    expect(user?.role).toBe("office_planner");
  });

  it("rejects invalid credentials and invalidates sessions on logout", async () => {
    const invalid = await loginWithPassword("oficina@tecnoglobal.local", "bad-password");
    expect(invalid.ok).toBe(false);

    const valid = await loginWithPassword("tecnico1@tecnoglobal.local", "tecnoglobal123");
    expect(valid.ok).toBe(true);

    if (!valid.ok) {
      throw new Error("expected valid login");
    }

    await logoutByToken(valid.token);
    const user = await getAuthenticatedUserByToken(valid.token);
    expect(user).toBeNull();
  });
});
