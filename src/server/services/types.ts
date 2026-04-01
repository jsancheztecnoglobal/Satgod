import type { RoleCode } from "@/lib/data/contracts";

export interface AuthenticatedUser {
  userId: string;
  email: string;
  fullName: string;
  role: RoleCode;
  technicianId?: string;
}
