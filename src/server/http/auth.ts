import { getAppSession } from "@/lib/auth/session";

export async function requireApiUser() {
  const session = await getAppSession();

  if (!session) {
    throw new Error("UNAUTHORIZED");
  }

  return {
    userId: session.userId,
    email: session.email,
    fullName: session.fullName,
    role: session.role,
    technicianId: session.technicianId,
  };
}
