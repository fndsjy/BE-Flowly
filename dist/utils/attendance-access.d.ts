export type AttendanceAccessLevel = "READ" | "CRUD";
export declare const resolveAttendanceAccessLevel: (requesterUserId: string) => Promise<AttendanceAccessLevel>;
export declare const ensureAttendanceReadAccess: (requesterUserId: string) => Promise<void>;
export declare const ensureAttendanceCrudAccess: (requesterUserId: string) => Promise<void>;
//# sourceMappingURL=attendance-access.d.ts.map