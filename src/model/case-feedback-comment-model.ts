
export type CaseFeedbackCommentResponse = {
  caseFeedbackCommentId: string;
  caseId: string;
  commentText: string;
  commenterName: string;
  commenterType: string | null;
  commenterId: string | null;
  commenterEmployeeId: number | null;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type CaseFeedbackCommentListResponse = CaseFeedbackCommentResponse;

export type CreateCaseFeedbackCommentRequest = {
  caseId: string;
  commentText: string;
};

type CaseFeedbackCommentEntity = {
  caseFeedbackCommentId: string;
  caseId: string;
  commentText: string;
  commenterName: string;
  commenterType?: string | null;
  commenterId?: string | null;
  commenterEmployeeId?: number | null;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export function toCaseFeedbackCommentResponse(
  comment: CaseFeedbackCommentEntity
): CaseFeedbackCommentResponse {
  return {
    caseFeedbackCommentId: comment.caseFeedbackCommentId,
    caseId: comment.caseId,
    commentText: comment.commentText,
    commenterName: comment.commenterName,
    commenterType: comment.commenterType ?? null,
    commenterId: comment.commenterId ?? null,
    commenterEmployeeId: comment.commenterEmployeeId ?? null,
    isActive: comment.isActive,
    isDeleted: comment.isDeleted,
    createdAt: comment.createdAt,
    updatedAt: comment.updatedAt,
  };
}

export const toCaseFeedbackCommentListResponse =
  toCaseFeedbackCommentResponse;
