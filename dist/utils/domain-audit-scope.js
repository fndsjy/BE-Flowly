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
];
const domainAuditedRouteEntitySet = new Set(DOMAIN_AUDITED_ROUTE_ENTITIES);
export const normalizeAuditRouteEntity = (path) => {
    const parts = path
        .split("/")
        .filter(Boolean)
        .slice(0, 2);
    return (parts.length > 0 ? parts.join("_") : "API")
        .replace(/-/g, "_")
        .toUpperCase()
        .slice(0, 50);
};
export const isDomainAuditedRoute = (path) => domainAuditedRouteEntitySet.has(normalizeAuditRouteEntity(path));
//# sourceMappingURL=domain-audit-scope.js.map