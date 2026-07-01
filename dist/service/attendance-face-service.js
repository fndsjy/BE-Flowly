import { prismaEmployee } from "../application/database.js";
import { ResponseError } from "../error/response-error.js";
import {} from "../model/attendance-face-model.js";
import { Validation } from "../validation/validation.js";
import { AttendanceFaceValidation } from "../validation/attendance-face-validation.js";
const FACE_MODEL_NAME = "vladmandic-face-api";
const FACE_MODEL_VERSION = "1.7";
const FACE_SOURCE = "FACE_WEB";
const PUBLIC_ATTENDANCE_ACTOR = "PUBLIC_ABSENSI";
const FACE_MATCH_THRESHOLD = 0.5;
const parseDescriptor = (value) => {
    if (!value) {
        return null;
    }
    try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed) &&
            parsed.length === 128 &&
            parsed.every((item) => typeof item === "number" && Number.isFinite(item))) {
            return parsed;
        }
    }
    catch {
        return null;
    }
    return null;
};
const normalizeImage = (value) => {
    const trimmed = value?.trim();
    return trimmed && trimmed.length > 0 ? trimmed : null;
};
const toEmployeeResponse = (row) => ({
    badgeNum: row.badgeNum,
    name: row.name ?? null,
});
const toScanLogResponse = (row) => ({
    faceScanLogId: String(row.faceScanLogId),
    employeeName: row.employeeName ?? null,
    badgeNum: row.badgeNum ?? null,
    eventType: row.scanEventType,
    scanStatus: row.scanStatus,
    scanTime: row.scanTime,
    matchConfidence: row.matchConfidence ?? null,
    livenessPassed: Boolean(row.livenessPassed),
    spoofType: row.spoofType,
    failureReason: row.failureReason ?? null,
});
const euclideanDistance = (left, right) => {
    let total = 0;
    for (let index = 0; index < left.length; index += 1) {
        const delta = (left[index] ?? 0) - (right[index] ?? 0);
        total += delta * delta;
    }
    return Math.sqrt(total);
};
const getTodayBounds = (value) => {
    const start = new Date(value);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    return { start, end };
};
export class AttendanceFaceService {
    static async getActiveEmployeeOrThrow(userId) {
        const rows = await prismaEmployee.$queryRaw `
      SELECT TOP 1
        [UserId] AS [userId],
        [BadgeNum] AS [badgeNum],
        [Name] AS [name],
        [ResignDate] AS [resignDate],
        [status] AS [status]
      FROM [dbo].[em_employee]
      WHERE [UserId] = ${userId}
    `;
        const employee = rows[0];
        if (!employee) {
            throw new ResponseError(404, "Employee not found");
        }
        const normalizedStatus = employee.status?.trim().toUpperCase();
        if (employee.resignDate || normalizedStatus === "I" || normalizedStatus === "N") {
            throw new ResponseError(400, "Employee is not active");
        }
        return employee;
    }
    static async getActiveEmployeeByBadgeOrThrow(badgeNum) {
        const normalizedBadge = badgeNum.trim();
        const rows = await prismaEmployee.$queryRaw `
      SELECT TOP 1
        [UserId] AS [userId],
        [BadgeNum] AS [badgeNum],
        [Name] AS [name],
        [ResignDate] AS [resignDate],
        [status] AS [status]
      FROM [dbo].[em_employee]
      WHERE LTRIM(RTRIM([BadgeNum])) = ${normalizedBadge}
    `;
        const employee = rows[0];
        if (!employee) {
            throw new ResponseError(404, "Employee not found");
        }
        const normalizedStatus = employee.status?.trim().toUpperCase();
        if (employee.resignDate || normalizedStatus === "I" || normalizedStatus === "N") {
            throw new ResponseError(400, "Employee is not active");
        }
        return employee;
    }
    static async getScanLogById(faceScanLogId) {
        const rows = await prismaEmployee.$queryRaw `
      SELECT TOP 1
        logs.[face_scan_log_id] AS [faceScanLogId],
        emp.[Name] AS [employeeName],
        emp.[BadgeNum] AS [badgeNum],
        logs.[scan_event_type] AS [scanEventType],
        logs.[scan_status] AS [scanStatus],
        logs.[scan_time] AS [scanTime],
        logs.[match_confidence] AS [matchConfidence],
        logs.[liveness_passed] AS [livenessPassed],
        logs.[spoof_type] AS [spoofType],
        logs.[failure_reason] AS [failureReason]
      FROM [dbo].[att_face_scan_logs] logs
      LEFT JOIN [dbo].[em_employee] emp ON emp.[UserId] = logs.[employee_user_id]
      WHERE logs.[face_scan_log_id] = ${faceScanLogId}
        AND logs.[is_deleted] = 0
    `;
        const row = rows[0];
        if (!row) {
            throw new ResponseError(404, "Face scan log not found");
        }
        return toScanLogResponse(row);
    }
    static async findBestFaceProfileMatch(faceDescriptor) {
        const rows = await prismaEmployee.$queryRaw `
      SELECT
        emp.[UserId] AS [userId],
        emp.[BadgeNum] AS [badgeNum],
        emp.[Name] AS [name],
        profile.[employee_face_profile_id] AS [employeeFaceProfileId],
        profile.[face_descriptor] AS [faceDescriptor]
      FROM [dbo].[em_employee] emp
      CROSS APPLY (
        SELECT TOP 1
          fp.[employee_face_profile_id],
          fp.[face_descriptor]
        FROM [dbo].[att_employee_face_profiles] fp
        WHERE fp.[employee_user_id] = emp.[UserId]
          AND fp.[profile_status] = 'ACTIVE'
          AND fp.[is_deleted] = 0
          AND fp.[deleted_at] IS NULL
          AND fp.[face_descriptor] IS NOT NULL
        ORDER BY fp.[updated_at] DESC, fp.[employee_face_profile_id] DESC
      ) profile
      WHERE emp.[ResignDate] IS NULL
        AND (emp.[status] IS NULL OR UPPER(emp.[status]) NOT IN ('I', 'N'))
    `;
        let bestMatch = null;
        let bestDistance = Number.POSITIVE_INFINITY;
        for (const row of rows) {
            const enrolledDescriptor = parseDescriptor(row.faceDescriptor);
            if (!enrolledDescriptor) {
                continue;
            }
            const distance = euclideanDistance(faceDescriptor, enrolledDescriptor);
            if (distance < bestDistance) {
                bestDistance = distance;
                bestMatch = {
                    userId: row.userId,
                    badgeNum: row.badgeNum,
                    name: row.name ?? null,
                    employeeFaceProfileId: row.employeeFaceProfileId,
                    score: Number((1 - distance).toFixed(4)),
                };
            }
        }
        if (!bestMatch || bestDistance > FACE_MATCH_THRESHOLD) {
            throw new ResponseError(400, "Wajah belum cocok dengan profile karyawan.");
        }
        return bestMatch;
    }
    static async listEmployees() {
        const rows = await prismaEmployee.$queryRaw `
      SELECT
        emp.[BadgeNum] AS [badgeNum],
        emp.[Name] AS [name]
      FROM [dbo].[em_employee] emp
      WHERE emp.[ResignDate] IS NULL
        AND (emp.[status] IS NULL OR UPPER(emp.[status]) NOT IN ('I', 'N'))
      ORDER BY emp.[Name] ASC, emp.[BadgeNum] ASC
    `;
        return rows.map(toEmployeeResponse);
    }
    static async enroll(request) {
        const validated = Validation.validate(AttendanceFaceValidation.ENROLL, request);
        const employee = validated.userId
            ? await this.getActiveEmployeeOrThrow(validated.userId)
            : await this.getActiveEmployeeByBadgeOrThrow(validated.badgeNum ?? "");
        const descriptorJson = JSON.stringify(validated.faceDescriptor);
        const faceImage = normalizeImage(validated.faceImage);
        const now = new Date();
        const createdRows = await prismaEmployee.$transaction(async (tx) => {
            await tx.$executeRaw `
        UPDATE [dbo].[att_employee_face_profiles]
        SET [profile_status] = 'REPLACED',
            [updated_at] = ${now}
        WHERE [employee_user_id] = ${employee.userId}
          AND [profile_status] = 'ACTIVE'
          AND [is_deleted] = 0
          AND [deleted_at] IS NULL
      `;
            return tx.$queryRaw `
        INSERT INTO [dbo].[att_employee_face_profiles] (
          [employee_user_id],
          [face_descriptor],
          [face_image],
          [model_name],
          [model_version],
          [profile_status],
          [enrolled_at],
          [enrolled_by],
          [updated_at]
        )
        OUTPUT INSERTED.[employee_face_profile_id] AS [employeeFaceProfileId]
        VALUES (
          ${employee.userId},
          ${descriptorJson},
          ${faceImage},
          ${FACE_MODEL_NAME},
          ${FACE_MODEL_VERSION},
          'ACTIVE',
          ${now},
          ${PUBLIC_ATTENDANCE_ACTOR},
          ${now}
        )
      `;
        });
        const createdProfile = createdRows[0];
        if (!createdProfile) {
            throw new ResponseError(500, "Failed to create face profile");
        }
        return {
            employeeFaceProfileId: String(createdProfile.employeeFaceProfileId),
            badgeNum: employee.badgeNum,
            name: employee.name ?? null,
            enrolledAt: now,
        };
    }
    static async deleteProfile(request) {
        const validated = Validation.validate(AttendanceFaceValidation.DELETE_PROFILE, request);
        await this.getActiveEmployeeOrThrow(validated.userId);
        const now = new Date();
        await prismaEmployee.$executeRaw `
      UPDATE [dbo].[att_employee_face_profiles]
      SET [profile_status] = 'INACTIVE',
          [is_deleted] = ${true},
          [deleted_at] = ${now},
          [deleted_by] = ${PUBLIC_ATTENDANCE_ACTOR},
          [updated_at] = ${now}
      WHERE [employee_user_id] = ${validated.userId}
        AND [profile_status] = 'ACTIVE'
        AND [is_deleted] = 0
        AND [deleted_at] IS NULL
    `;
        return { message: "Face profile deleted" };
    }
    static async matchProfile(request) {
        const validated = Validation.validate(AttendanceFaceValidation.MATCH_PROFILE, request);
        const match = await this.findBestFaceProfileMatch(validated.faceDescriptor);
        return {
            badgeNum: match.badgeNum,
            name: match.name,
            matchConfidence: match.score,
        };
    }
    static async recordSuccess(request) {
        const validated = Validation.validate(AttendanceFaceValidation.SCAN_SUCCESS, request);
        const match = await this.findBestFaceProfileMatch(validated.faceDescriptor);
        await this.getActiveEmployeeOrThrow(match.userId);
        const scanTime = new Date();
        const { start, end } = getTodayBounds(scanTime);
        const result = await prismaEmployee.$transaction(async (tx) => {
            const openAttendances = await tx.$queryRaw `
        SELECT TOP 1 [Id] AS [employeeAttendanceId]
        FROM [dbo].[em_absensi]
        WHERE [faceId] = ${match.userId}
          AND [inDate] >= ${start}
          AND [inDate] < ${end}
          AND [outDate] IS NULL
        ORDER BY [inDate] DESC, [Id] DESC
      `;
            let employeeAttendanceId;
            let scanEventType;
            if (openAttendances[0]) {
                employeeAttendanceId = openAttendances[0].employeeAttendanceId;
                scanEventType = "CHECK_OUT";
                await tx.$executeRaw `
          UPDATE [dbo].[em_absensi]
          SET [outDate] = ${scanTime}
          WHERE [Id] = ${employeeAttendanceId}
        `;
            }
            else {
                scanEventType = "CHECK_IN";
                const attendanceRows = await tx.$queryRaw `
          INSERT INTO [dbo].[em_absensi] ([faceId], [inDate], [fileImage])
          OUTPUT INSERTED.[Id] AS [employeeAttendanceId]
          VALUES (${match.userId}, ${scanTime}, NULL)
        `;
                const attendance = attendanceRows[0];
                if (!attendance) {
                    throw new ResponseError(500, "Failed to create attendance record");
                }
                employeeAttendanceId = attendance.employeeAttendanceId;
            }
            const logRows = await tx.$queryRaw `
        INSERT INTO [dbo].[att_face_scan_logs] (
          [employee_user_id],
          [employee_face_profile_id],
          [employee_attendance_id],
          [scan_event_type],
          [scan_status],
          [scan_time],
          [match_confidence],
          [liveness_passed],
          [captured_image],
          [scan_source],
          [created_at]
        )
        OUTPUT INSERTED.[face_scan_log_id] AS [faceScanLogId]
        VALUES (
          ${match.userId},
          ${match.employeeFaceProfileId},
          ${employeeAttendanceId},
          ${scanEventType},
          'SUCCESS',
          ${scanTime},
          ${match.score},
          ${true},
          NULL,
          ${FACE_SOURCE},
          ${scanTime}
        )
      `;
            const log = logRows[0];
            if (!log) {
                throw new ResponseError(500, "Failed to create face scan log");
            }
            return {
                employeeAttendanceId,
                scanEventType,
                faceScanLogId: log.faceScanLogId,
            };
        });
        return {
            log: await this.getScanLogById(result.faceScanLogId),
            attendance: {
                employeeAttendanceId: result.employeeAttendanceId,
                eventType: result.scanEventType,
                scanTime,
            },
        };
    }
    static async recordFailure(request) {
        const validated = Validation.validate(AttendanceFaceValidation.SCAN_FAILURE, request);
        const scanTime = new Date();
        const scanEventType = validated.scanStatus === "SPOOF" ? "SPOOF" : "FAILED";
        const rows = await prismaEmployee.$queryRaw `
      INSERT INTO [dbo].[att_face_scan_logs] (
        [employee_user_id],
        [employee_face_profile_id],
        [scan_event_type],
        [scan_status],
        [scan_time],
        [match_confidence],
        [liveness_passed],
        [spoof_type],
        [failure_reason],
        [captured_image],
        [scan_source],
        [created_at]
      )
      OUTPUT INSERTED.[face_scan_log_id] AS [faceScanLogId]
      VALUES (
        NULL,
        NULL,
        ${scanEventType},
        ${validated.scanStatus},
        ${scanTime},
        NULL,
        ${false},
        ${validated.spoofType ?? null},
        ${validated.failureReason},
        NULL,
        ${FACE_SOURCE},
        ${scanTime}
      )
    `;
        const log = rows[0];
        if (!log) {
            throw new ResponseError(500, "Failed to create face scan log");
        }
        return await this.getScanLogById(log.faceScanLogId);
    }
    static async listLogs(limit) {
        const safeLimit = Math.max(1, Math.min(200, Math.trunc(limit) || 80));
        const rows = await prismaEmployee.$queryRaw `
      SELECT TOP (${safeLimit})
        logs.[face_scan_log_id] AS [faceScanLogId],
        emp.[Name] AS [employeeName],
        emp.[BadgeNum] AS [badgeNum],
        logs.[scan_event_type] AS [scanEventType],
        logs.[scan_status] AS [scanStatus],
        logs.[scan_time] AS [scanTime],
        logs.[match_confidence] AS [matchConfidence],
        logs.[liveness_passed] AS [livenessPassed],
        logs.[spoof_type] AS [spoofType],
        logs.[failure_reason] AS [failureReason]
      FROM [dbo].[att_face_scan_logs] logs
      LEFT JOIN [dbo].[em_employee] emp ON emp.[UserId] = logs.[employee_user_id]
      WHERE logs.[is_deleted] = 0
      ORDER BY logs.[scan_time] DESC, logs.[face_scan_log_id] DESC
    `;
        return rows.map(toScanLogResponse);
    }
}
//# sourceMappingURL=attendance-face-service.js.map