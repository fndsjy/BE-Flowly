export interface StartEmployeeOnboardingRequest {
  portalKey?: string;
  userIds: number[];
  startedAt?: Date | string | null;
  durationDay?: number | null;
  note?: string | null;
}

export interface EmployeeOnboardingStartItem {
  userId: number;
  employeeName: string | null;
  onboardingAssignmentId: string;
  portalKey: string;
  status: string;
  startedAt: Date;
  dueAt: Date;
  currentStageOrder: number | null;
}

export interface EmployeeOnboardingSkipItem {
  userId: number;
  employeeName: string | null;
  reason: string;
}

export interface StartEmployeeOnboardingResponse {
  portalKey: string;
  started: EmployeeOnboardingStartItem[];
  skipped: EmployeeOnboardingSkipItem[];
}

export interface EmployeeOnboardingSummaryResponse {
  userId: number;
  employeeName: string | null;
  onboardingAssignmentId: string;
  portalKey: string;
  status: string;
  startedAt: Date;
  dueAt: Date;
  currentStageOrder: number | null;
  hasActiveAssignment: boolean;
  canStart: boolean;
}

export interface ListEmployeeOnboardingSummaryRequest {
  portalKey?: string;
}

export interface OnboardingWorkspaceMaterialFileResponse {
  id: number;
  title: string | null;
  fileName: string;
  url: string | null;
  fileType: number | null;
  progressId: string | null;
  status: string;
  readAt: Date | null;
  lastReadAt: Date | null;
  completedAt: Date | null;
  openCount: number;
}

export interface OnboardingWorkspaceMaterialResponse {
  assignmentId: string;
  materialId: number;
  materialCode: string;
  materialTitle: string;
  materialDescription: string | null;
  materialTypes: string[];
  isRequired: boolean;
  orderIndex: number;
  totalFileCount: number;
  fileCount: number;
  selectedFileIds: number[];
  fileSelectionMode: "ALL" | "SELECTED";
  status: string;
  readAt: Date | null;
  lastReadAt: Date | null;
  completedAt: Date | null;
  files: OnboardingWorkspaceMaterialFileResponse[];
  note: string | null;
}

export interface OnboardingWorkspaceStageResponse {
  onboardingStageProgressId: string;
  onboardingStageTemplateId: string;
  stageOrder: number;
  stageCode: string;
  stageName: string;
  stageDescription: string | null;
  status: string;
  remedialCount: number;
  startedAt: Date | null;
  passedAt: Date | null;
  completedAt: Date | null;
  failedAt: Date | null;
  note: string | null;
  materials: OnboardingWorkspaceMaterialResponse[];
}

export interface OnboardingWorkspacePortalResponse {
  onboardingAssignmentId: string;
  onboardingPortalTemplateId: string;
  portalKey: string;
  portalName: string;
  status: string;
  startedAt: Date;
  durationDay: number;
  dueAt: Date;
  currentStageOrder: number | null;
  note: string | null;
  stages: OnboardingWorkspaceStageResponse[];
}

export interface MyOnboardingWorkspaceResponse {
  portals: OnboardingWorkspacePortalResponse[];
}

export interface AdminOnboardingMonitoringMaterialResponse {
  onboardingStageMaterialId: string;
  materialId: number;
  materialCode: string;
  materialTitle: string;
  materialDescription: string | null;
  isRequired: boolean;
  orderIndex: number;
  totalFileCount: number;
  fileCount: number;
  selectedFileIds: number[];
  fileSelectionMode: "ALL" | "SELECTED";
  readFileCount: number;
  status: string;
  readAt: Date | null;
  lastReadAt: Date | null;
  completedAt: Date | null;
  openCount: number;
  note: string | null;
}

export interface AdminOnboardingMonitoringStageTemplateResponse {
  onboardingStageTemplateId: string;
  stageOrder: number;
  stageCode: string;
  stageName: string;
  stageDescription: string | null;
  materialCount: number;
}

export interface AdminOnboardingMonitoringStageResponse {
  onboardingStageProgressId: string | null;
  onboardingStageTemplateId: string;
  stageOrder: number;
  stageCode: string;
  stageName: string;
  stageDescription: string | null;
  status: string;
  remedialCount: number;
  startedAt: Date | null;
  passedAt: Date | null;
  completedAt: Date | null;
  failedAt: Date | null;
  note: string | null;
  totalMaterialCount: number;
  readMaterialCount: number;
  totalOpenCount: number;
  firstReadAt: Date | null;
  lastReadAt: Date | null;
  materials: AdminOnboardingMonitoringMaterialResponse[];
}

export interface AdminOnboardingMonitoringParticipantResponse {
  participantId: string;
  participantReferenceType: string;
  participantReferenceId: string;
  participantName: string;
  cardNumber: string | null;
  badgeNumber: string | null;
  departmentName: string | null;
  phone: string | null;
  email: string | null;
  status: string;
  startedAt: Date;
  dueAt: Date;
  currentStageOrder: number | null;
  currentStageName: string | null;
  totalMaterialCount: number;
  readMaterialCount: number;
  totalOpenCount: number;
  firstReadAt: Date | null;
  lastReadAt: Date | null;
  stages: AdminOnboardingMonitoringStageResponse[];
}

export interface AdminOnboardingMonitoringPortalResponse {
  onboardingPortalTemplateId: string;
  portalKey: string;
  portalName: string;
  totalStageCount: number;
  totalParticipants: number;
  activeParticipants: number;
  completedParticipants: number;
  totalOpenCount: number;
  firstReadAt: Date | null;
  lastReadAt: Date | null;
  stages: AdminOnboardingMonitoringStageTemplateResponse[];
  participants: AdminOnboardingMonitoringParticipantResponse[];
}

export interface AdminOnboardingMonitoringResponse {
  portals: AdminOnboardingMonitoringPortalResponse[];
}

export interface StartOnboardingMaterialReadRequest {
  onboardingAssignmentId: string;
  onboardingStageProgressId: string;
  onboardingStageMaterialId: string;
  sourceFileId?: number | null;
  fileName?: string | null;
  fileTitle?: string | null;
}

export interface StartOnboardingMaterialReadResponse {
  onboardingMaterialProgressId: string;
  onboardingAssignmentId: string;
  onboardingStageProgressId: string;
  onboardingStageMaterialId: string;
  sourceFileId: number;
  status: string;
  stageStatus: string;
  readAt: Date | null;
  lastReadAt: Date | null;
  openCount: number;
}
