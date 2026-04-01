import type { RoleCode } from "@/lib/data/contracts";

export const defaultBootstrapPassword = "tecnoglobal123";

export interface BootstrapAccount {
  email: string;
  fullName: string;
  role: RoleCode;
  technicianCode?: string;
}

export const bootstrapAccounts: BootstrapAccount[] = [
  {
    email: "admin@tecnoglobal.local",
    fullName: "Administrador Tecnoglobal",
    role: "admin",
  },
  {
    email: "oficina@tecnoglobal.local",
    fullName: "Oficina Planificacion",
    role: "office_planner",
  },
  {
    email: "ingenieria@tecnoglobal.local",
    fullName: "Ingenieria Tecnoglobal",
    role: "engineer",
  },
  {
    email: "comercial@tecnoglobal.local",
    fullName: "Comercial Tecnoglobal",
    role: "sales",
  },
  {
    email: "gerencia@tecnoglobal.local",
    fullName: "Gerencia Tecnoglobal",
    role: "management_readonly",
  },
  ...Array.from({ length: 8 }, (_, index) => ({
    email: `tecnico${index + 1}@tecnoglobal.local`,
    fullName: `Tecnico ${index + 1}`,
    role: "technician" as const,
    technicianCode: `tecnico${index + 1}`,
  })),
];

export function findBootstrapAccount(email: string) {
  const normalizedEmail = email.trim().toLowerCase();
  return bootstrapAccounts.find((account) => account.email.toLowerCase() === normalizedEmail) ?? null;
}
