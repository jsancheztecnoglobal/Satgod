import type { RoleCode } from "@/lib/data/contracts";

export const routeAccess: Array<{
  prefix: string;
  roles: RoleCode[];
}> = [
  {
    prefix: "/ordenes/",
    roles: ["admin", "office_planner", "engineer", "sales", "technician", "management_readonly"],
  },
  {
    prefix: "/trabajos/",
    roles: ["admin", "office_planner", "engineer", "sales", "technician", "management_readonly"],
  },
  {
    prefix: "/tecnico",
    roles: ["admin", "office_planner", "engineer", "technician"],
  },
  {
    prefix: "/dashboard",
    roles: ["admin", "office_planner", "engineer", "sales", "management_readonly"],
  },
  {
    prefix: "/crear",
    roles: ["admin", "office_planner", "engineer", "sales"],
  },
  {
    prefix: "/clientes",
    roles: ["admin", "office_planner", "engineer", "sales", "management_readonly"],
  },
  {
    prefix: "/equipos",
    roles: ["admin", "office_planner", "engineer", "sales", "management_readonly"],
  },
  {
    prefix: "/ordenes",
    roles: ["admin", "office_planner", "engineer", "sales", "management_readonly"],
  },
  {
    prefix: "/trabajos",
    roles: ["admin", "office_planner", "engineer", "sales", "management_readonly"],
  },
  {
    prefix: "/planificacion",
    roles: ["admin", "office_planner", "engineer", "management_readonly"],
  },
  {
    prefix: "/tecnicos",
    roles: ["admin", "office_planner", "engineer", "management_readonly"],
  },
];

export function canAccessPath(role: RoleCode, pathname: string) {
  const accessRule = [...routeAccess].sort((left, right) => right.prefix.length - left.prefix.length).find((entry) => pathname.startsWith(entry.prefix));
  if (!accessRule) return true;
  return accessRule.roles.includes(role);
}

export function getDefaultPathForRole(role: RoleCode) {
  return role === "technician" ? "/tecnico" : "/dashboard";
}
