import { PrismaClient } from "@prisma/client";
export declare const prismaClient: PrismaClient<{
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
}, "error" | "info" | "query" | "warn", import("@prisma/client/runtime/library").DefaultArgs>;
//# sourceMappingURL=database.d.ts.map