import { PrismaClient as FlowlyClient } from "../generated/flowly/client.js";
import { PrismaClient as EmployeeClient } from "../generated/employee/client.js";
export declare const prismaFlowly: FlowlyClient<{
    log: ({
        emit: "event";
        level: "query";
    } | {
        emit: "event";
        level: "error";
    } | {
        emit: "event";
        level: "info";
    } | {
        emit: "event";
        level: "warn";
    })[];
}, "error" | "info" | "query" | "warn", import("../generated/flowly/runtime/library.js").DefaultArgs>;
export declare const prismaEmployee: EmployeeClient<{
    log: ({
        emit: "event";
        level: "query";
    } | {
        emit: "event";
        level: "error";
    } | {
        emit: "event";
        level: "info";
    } | {
        emit: "event";
        level: "warn";
    })[];
}, "error" | "info" | "query" | "warn", import("../generated/employee/runtime/library.js").DefaultArgs>;
//# sourceMappingURL=database.d.ts.map