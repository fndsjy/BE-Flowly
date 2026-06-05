export const DOMAIN_AUDITED_ROUTE_ENTITIES = [
  "CASE",
  "CASE_ATTACHMENT",
  "CASE_DEPARTMENT",
  "CASE_FISHBONE",
  "CASE_FISHBONE_CAUSE",
  "CASE_FISHBONE_ITEM",
  "CASE_PDCA",
  "CHART",
  "CHART_MEMBER",
  "EMPLOYEE",
  "EMPLOYEE_JOB_DESC",
  "FISHBONE",
  "FISHBONE_CATEGORY",
  "FISHBONE_CAUSE",
  "FISHBONE_ITEM",
  "MASTER_IK",
  "ONBOARDING_START_EMPLOYEES",
  "PILAR",
  "PROCEDURE_IK",
  "PROCEDURE_SOP",
  "PROCEDURE_SOP_IK",
  "SBU",
  "SBU_SUB",
] as const;

const domainAuditedRouteEntitySet = new Set<string>(DOMAIN_AUDITED_ROUTE_ENTITIES);

export const normalizeAuditRouteEntity = (path: string) => {
  const parts = path
    .split("/")
    .filter(Boolean)
    .slice(0, 2);

  return (parts.length > 0 ? parts.join("_") : "API")
    .replace(/-/g, "_")
    .toUpperCase()
    .slice(0, 50);
};

export const isDomainAuditedRoute = (path: string) =>
  domainAuditedRouteEntitySet.has(normalizeAuditRouteEntity(path));
