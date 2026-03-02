import { prismaEmployee, prismaFlowly } from "../application/database.js";
import { Validation } from "../validation/validation.js";
import { CaseFeedbackApprovalValidation } from "../validation/case-feedback-approval-validation.js";
import { ResponseError } from "../error/response-error.js";
import { resolveCaseAccess } from "../utils/case-access.js";

const FEEDBACK_ALLOWED_CASE_TYPES = new Set(["PROBLEM", "PROJECT"]);

export class CaseFeedbackApprovalService {
  static async approve(requesterId: string, reqBody: { caseId: string }) {
    const request = Validation.validate(
      CaseFeedbackApprovalValidation.APPROVE,
      reqBody
    );

    const access = await resolveCaseAccess(requesterId);
    if (access.actorType !== "EMPLOYEE" || access.employeeId === undefined) {
      throw new ResponseError(
        403,
        "Only PIC of requester SBU Sub can approve"
      );
    }

    const caseHeader = await prismaFlowly.caseHeader.findUnique({
      where: { caseId: request.caseId },
      select: {
        caseId: true,
        caseType: true,
        originSbuSubId: true,
        feedbackApprovedAt: true,
        isDeleted: true,
      },
    });

    if (!caseHeader || caseHeader.isDeleted) {
      throw new ResponseError(404, "Case not found");
    }

    if (!FEEDBACK_ALLOWED_CASE_TYPES.has(caseHeader.caseType)) {
      throw new ResponseError(
        400,
        "Feedback only available for PROBLEM/PROJECT case"
      );
    }

    if (caseHeader.feedbackApprovedAt) {
      throw new ResponseError(400, "Case already closed");
    }

    if (!caseHeader.originSbuSubId) {
      throw new ResponseError(400, "Origin SBU Sub not set");
    }

    const pic = await prismaEmployee.em_sbu_sub.findFirst({
      where: {
        id: caseHeader.originSbuSubId,
        pic: access.employeeId,
        status: "A",
        OR: [{ isDeleted: false }, { isDeleted: null }],
      },
      select: { id: true },
    });

    if (!pic) {
      throw new ResponseError(
        403,
        "Only PIC of requester SBU Sub can approve"
      );
    }

    const now = new Date();
    await prismaFlowly.caseHeader.update({
      where: { caseId: request.caseId },
      data: {
        feedbackApprovedAt: now,
        feedbackApprovedBy: requesterId,
        feedbackApprovedByEmployeeId: access.employeeId,
        status: "DONE",
        updatedAt: now,
        updatedBy: requesterId,
      },
    });

    return { message: "Case closed", feedbackApprovedAt: now };
  }
}
