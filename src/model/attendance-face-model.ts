export type FaceAttendanceEventType = "CHECK_IN" | "CHECK_OUT" | "FAILED" | "SPOOF";
export type FaceAttendanceScanStatus = "SUCCESS" | "FAILED" | "SPOOF";
export type FaceSpoofType = "PHOTO" | "VIDEO_REPLAY" | "HANDPHONE" | "PROFILE_MISMATCH";

export interface FaceAttendanceEmployeeResponse {
  badgeNum: string;
  name: string | null;
}

export interface EnrollFaceProfileRequest {
  userId?: number;
  badgeNum?: string;
  faceDescriptor: number[];
  faceImage?: string | null;
}

export interface DeleteFaceProfileRequest {
  userId: number;
}

export interface RecordFaceScanSuccessRequest {
  faceDescriptor: number[];
}

export interface MatchFaceProfileRequest {
  faceDescriptor: number[];
}

export interface MatchFaceProfileResponse {
  badgeNum: string;
  name: string | null;
  matchConfidence: number;
}

export interface RecordFaceScanFailureRequest {
  scanStatus: Exclude<FaceAttendanceScanStatus, "SUCCESS">;
  spoofType?: FaceSpoofType | null;
  failureReason: string;
}

export interface FaceScanLogResponse {
  faceScanLogId: string;
  employeeName: string | null;
  badgeNum: string | null;
  eventType: FaceAttendanceEventType;
  scanStatus: FaceAttendanceScanStatus;
  scanTime: Date;
  matchConfidence: number | null;
  livenessPassed: boolean;
  spoofType: FaceSpoofType | null;
  failureReason: string | null;
}

export interface RecordFaceScanSuccessResponse {
  log: FaceScanLogResponse;
  attendance: {
    employeeAttendanceId: number;
    eventType: Extract<FaceAttendanceEventType, "CHECK_IN" | "CHECK_OUT">;
    scanTime: Date;
  };
}
