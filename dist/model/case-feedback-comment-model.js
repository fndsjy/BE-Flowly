export function toCaseFeedbackCommentResponse(comment) {
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
export const toCaseFeedbackCommentListResponse = toCaseFeedbackCommentResponse;
//# sourceMappingURL=case-feedback-comment-model.js.map