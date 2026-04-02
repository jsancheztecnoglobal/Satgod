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
  {
    email: "tecnico1@tecnoglobal.local",
    fullName: "Cristian Hernan Madera",
    role: "technician",
    technicianCode: "tecnico1",
  },
  {
    email: "tecnico2@tecnoglobal.local",
    fullName: "Daniel Esteban Moreno",
    role: "technician",
    technicianCode: "tecnico2",
  },
  {
    email: "tecnico3@tecnoglobal.local",
    fullName: "Pedro Casacuberta",
    role: "technician",
    technicianCode: "tecnico3",
  },
  {
    email: "tecnico4@tecnoglobal.local",
    fullName: "Miquel Puchol",
    role: "technician",
    technicianCode: "tecnico4",
  },
  {
    email: "tecnico5@tecnoglobal.local",
    fullName: "Carlos Gracia",
    role: "technician",
    technicianCode: "tecnico5",
  },
  {
    email: "tecnico6@tecnoglobal.local",
    fullName: "Alfredo Ferreyra",
    role: "technician",
    technicianCode: "tecnico6",
  },
  {
    email: "tecnico7@tecnoglobal.local",
    fullName: "Abel Jimenez",
    role: "technician",
    technicianCode: "tecnico7",
  },
  {
    email: "tecnico8@tecnoglobal.local",
    fullName: "Marco Chillon",
    role: "technician",
    technicianCode: "tecnico8",
  },
];

export function findBootstrapAccount(email: string) {
  const normalizedEmail = email.trim().toLowerCase();
  return bootstrapAccounts.find((account) => account.email.toLowerCase() === normalizedEmail) ?? null;
}
