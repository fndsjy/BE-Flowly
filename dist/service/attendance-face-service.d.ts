import { type DeleteFaceProfileRequest, type EnrollFaceProfileRequest, type FaceAttendanceEmployeeResponse, type FaceScanLogResponse, type MatchFaceProfileRequest, type MatchFaceProfileResponse, type RecordFaceScanFailureRequest, type RecordFaceScanSuccessRequest, type RecordFaceScanSuccessResponse } from "../model/attendance-face-model.js";
export declare class AttendanceFaceService {
    private static getActiveEmployeeOrThrow;
    private static getActiveEmployeeByBadgeOrThrow;
    private static getScanLogById;
    private static findBestFaceProfileMatch;
    static listEmployees(): Promise<FaceAttendanceEmployeeResponse[]>;
    static enroll(request: EnrollFaceProfileRequest): Promise<{
        employeeFaceProfileId: string;
        badgeNum: string;
        name: string | null;
        enrolledAt: Date;
    }>;
    static deleteProfile(request: DeleteFaceProfileRequest): Promise<{
        message: string;
    }>;
    static matchProfile(request: MatchFaceProfileRequest): Promise<MatchFaceProfileResponse>;
    static recordSuccess(request: RecordFaceScanSuccessRequest): Promise<RecordFaceScanSuccessResponse>;
    static recordFailure(request: RecordFaceScanFailureRequest): Promise<FaceScanLogResponse>;
    static listLogs(limit: number): Promise<FaceScanLogResponse[]>;
}
//# sourceMappingURL=attendance-face-service.d.ts.map