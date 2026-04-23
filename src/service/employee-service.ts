import { prismaFlowly, prismaEmployee } from "../application/database.js";
import { ResponseError } from "../error/response-error.js";
import {
  toEmployeeDepartmentResponse,
  toEmployeeResponse,
  type EmployeeRecordInput,
  type CreateEmployeeRequest,
  type DeleteEmployeeRequest,
  type UpdateEmployeeJobDescRequest,
  type UpdateEmployeeRequest,
} from "../model/employee-model.js";
import {
  buildChanges,
  pickSnapshot,
  resolveActorType,
  writeAuditLog,
} from "../utils/audit-log.js";
import { ensureHrdCrudAccess } from "../utils/hrd-access.js";
import { Validation } from "../validation/validation.js";
import { EmployeeValidation } from "../validation/employee-validation.js";

const employeeSelect = {
  UserId: true,
  BadgeNum: true,
  Name: true,
  Gender: true,
  BirthDay: true,
  HireDay: true,
  Street: true,
  Religion: true,
  Tipe: true,
  isLokasi: true,
  Phone: true,
  DeptId: true,
  CardNo: true,
  Shift: true,
  isMem: true,
  AddBy: true,
  isMemDate: true,
  isFirstLogin: true,
  ImgName: true,
  SbuSub: true,
  Nik: true,
  ResignDate: true,
  statusLMS: true,
  roleId: true,
  jobDesc: true,
  city: true,
  state: true,
  email: true,
  IPMsnFinger: true,
  BPJSKshtn: true,
  BPJSKtngkerjaan: true,
  Created_at: true,
  Lastupdate: true,
} as const;

const EMPLOYEE_AUDIT_FIELDS = [
  "UserId",
  "BadgeNum",
  "Name",
  "Gender",
  "BirthDay",
  "HireDay",
  "DeptId",
  "Nik",
  "statusLMS",
  "jobDesc",
  "state",
  "email",
  "ResignDate",
] as const;

const getEmployeeSnapshot = (record: Record<string, unknown>) =>
  pickSnapshot(record, EMPLOYEE_AUDIT_FIELDS as unknown as string[]);

const normalizeOptionalText = (value?: string | null) => {
  if (value === undefined) return undefined;
  if (value === null) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const normalizeEmailText = (value?: string | null) => {
  const normalized = normalizeOptionalText(value);
  return normalized ? normalized.toLowerCase() : normalized;
};

const normalizeIdentifierForCompare = (value?: string | null) => {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed.toUpperCase() : null;
};

const normalizePhoneForCompare = (value?: string | null) => {
  const digits = value?.replace(/\D+/g, "") ?? "";
  return digits.length > 0 ? digits : null;
};

const normalizeEmailForCompare = (value?: string | null) => {
  const normalized = normalizeEmailText(value);
  return normalized && normalized !== "-" ? normalized : null;
};

const normalizeRequiredText = (value: string | undefined, fallback: string) => {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : fallback;
};

const normalizeGenderInput = (value?: string | null) => {
  if (value === undefined) return undefined;
  if (value === null) return null;

  const trimmed = value.trim();
  if (!trimmed) return null;

  const normalized = trimmed.toLowerCase().replace(/[\s_-]/g, "");
  if (
    ["l", "m", "male", "man", "lakilaki", "lelaki", "pria"].includes(normalized)
  ) {
    return "male";
  }

  if (
    ["p", "f", "female", "woman", "perempuan", "wanita"].includes(normalized)
  ) {
    return "female";
  }

  return trimmed;
};

const normalizeStatusLmsInput = (value?: string | null) => {
  const normalized = value?.trim().toLowerCase();
  if (!normalized) {
    return false;
  }

  return normalized === "1" || normalized === "true" || normalized === "yes";
};

const toLegacyActorId = (value: string) => {
  const normalized = value.replace(/[^a-zA-Z0-9]/g, "").trim();
  return normalized ? normalized.slice(0, 5) : null;
};

const getDepartmentMap = async () => {
  const departments = await prismaEmployee.em_dept.findMany({
    select: {
      DEPTID: true,
      DEPTNAME: true,
    },
  });

  return new Map<number, string | null>(
    departments.map((department) => [department.DEPTID, department.DEPTNAME ?? null])
  );
};

const withDepartmentName = async (employee: EmployeeRecordInput) => {
  const deptName =
    employee.DeptId !== null && employee.DeptId !== undefined
      ? (
          await prismaEmployee.em_dept.findUnique({
            where: { DEPTID: employee.DeptId },
            select: { DEPTNAME: true },
          })
        )?.DEPTNAME ?? null
      : null;

  return toEmployeeResponse({
    ...employee,
    DeptName: deptName,
  });
};

const ensureDepartmentExists = async (deptId?: number | null) => {
  if (deptId === undefined || deptId === null) {
    return;
  }

  const department = await prismaEmployee.em_dept.findUnique({
    where: { DEPTID: deptId },
    select: { DEPTID: true },
  });

  if (!department) {
    throw new ResponseError(400, "Department not found");
  }
};

type EmployeeUniquenessCandidate = {
  UserId: number;
  BadgeNum: string;
  CardNo: string | null;
  Nik: string | null;
  Phone: string | null;
  email: string | null;
};

const listEmployeeUniquenessCandidates = async (
  excludeUserId?: number
): Promise<EmployeeUniquenessCandidate[]> => {
  const where = excludeUserId ? { UserId: { not: excludeUserId } } : undefined;

  return prismaEmployee.em_employee.findMany({
    ...(where ? { where } : {}),
    select: {
      UserId: true,
      BadgeNum: true,
      CardNo: true,
      Nik: true,
      Phone: true,
      email: true,
    },
  });
};

const hasMatchingIdentifier = (
  employee: EmployeeUniquenessCandidate,
  normalizedValue: string
) =>
  normalizeIdentifierForCompare(employee.BadgeNum) === normalizedValue ||
  normalizeIdentifierForCompare(employee.CardNo) === normalizedValue;

const ensureEmployeeUniqueFields = async (params: {
  badgeNum: string;
  cardNo: string;
  nik: string;
  phone: string;
  email: string;
  excludeUserId?: number;
}) => {
  const candidates = await listEmployeeUniquenessCandidates(params.excludeUserId);
  const normalizedBadgeNum = normalizeIdentifierForCompare(params.badgeNum);
  const normalizedCardNo = normalizeIdentifierForCompare(params.cardNo);
  const normalizedNik = normalizeIdentifierForCompare(params.nik);
  const normalizedPhone = normalizePhoneForCompare(params.phone);
  const normalizedEmail = normalizeEmailForCompare(params.email);

  if (
    normalizedBadgeNum &&
    candidates.some((employee) =>
      hasMatchingIdentifier(employee, normalizedBadgeNum)
    )
  ) {
    throw new ResponseError(400, "Badge number sudah dipakai karyawan lain");
  }

  if (
    normalizedCardNo &&
    candidates.some((employee) =>
      hasMatchingIdentifier(employee, normalizedCardNo)
    )
  ) {
    throw new ResponseError(400, "Card number sudah dipakai karyawan lain");
  }

  if (
    normalizedNik &&
    candidates.some(
      (employee) => normalizeIdentifierForCompare(employee.Nik) === normalizedNik
    )
  ) {
    throw new ResponseError(400, "NIK sudah dipakai karyawan lain");
  }

  if (
    normalizedPhone &&
    candidates.some(
      (employee) => normalizePhoneForCompare(employee.Phone) === normalizedPhone
    )
  ) {
    throw new ResponseError(400, "Nomor telepon sudah dipakai karyawan lain");
  }

  if (
    normalizedEmail &&
    candidates.some(
      (employee) => normalizeEmailForCompare(employee.email) === normalizedEmail
    )
  ) {
    throw new ResponseError(400, "Email sudah dipakai karyawan lain");
  }
};

const buildEmployeeCreateData = (
  request: CreateEmployeeRequest,
  requesterUserId: string
) => {
  const now = new Date();
  const badgeNum = request.BadgeNum.trim();
  const cardNo = request.CardNo.trim();

  return {
    BadgeNum: badgeNum,
    Name: normalizeOptionalText(request.Name) ?? null,
    Gender: normalizeGenderInput(request.Gender) ?? null,
    BirthDay: request.BirthDay ?? null,
    HireDay: request.HireDay ?? null,
    Street: normalizeOptionalText(request.Street) ?? null,
    Religion: normalizeOptionalText(request.Religion) ?? null,
    Tipe: normalizeOptionalText(request.Tipe) ?? null,
    isLokasi: normalizeOptionalText(request.isLokasi) ?? null,
    Phone: normalizeOptionalText(request.Phone) ?? null,
    DeptId: request.DeptId ?? null,
    Password: null,
    CardNo: cardNo,
    Shift: request.Shift ?? null,
    isMem: request.isMem ?? false,
    AddBy: toLegacyActorId(requesterUserId),
    Created_at: now,
    Lastupdate: now,
    isMemDate: request.isMem ? request.isMemDate ?? null : null,
    isFirstLogin: 1,
    ImgName: "domas.png",
    SbuSub: request.SbuSub ?? null,
    Nik: normalizeOptionalText(request.Nik) ?? null,
    ResignDate: request.ResignDate ?? null,
    status: "-",
    statusLMS: normalizeStatusLmsInput(request.statusLMS),
    roleId: request.roleId ?? null,
    jobDesc: normalizeOptionalText(request.jobDesc) ?? null,
    city: normalizeOptionalText(request.city) ?? null,
    state: normalizeRequiredText(request.state, "Indonesia"),
    email: normalizeEmailText(request.email) ?? null,
    IPMsnFinger: normalizeRequiredText(request.IPMsnFinger, "-"),
    BPJSKshtn: normalizeOptionalText(request.BPJSKshtn) ?? null,
    BPJSKtngkerjaan: normalizeOptionalText(request.BPJSKtngkerjaan) ?? null,
  };
};

const buildEmployeeUpdateData = (request: UpdateEmployeeRequest) => {
  const badgeNum = request.BadgeNum.trim();
  const cardNo = request.CardNo.trim();
  const data: Record<string, unknown> = {
    Lastupdate: new Date(),
    BadgeNum: badgeNum,
    Name: normalizeOptionalText(request.Name) ?? null,
    Gender: normalizeGenderInput(request.Gender) ?? null,
    BirthDay: request.BirthDay ?? null,
    HireDay: request.HireDay ?? null,
    Street: normalizeOptionalText(request.Street) ?? null,
    Religion: normalizeOptionalText(request.Religion) ?? null,
    Tipe: normalizeOptionalText(request.Tipe) ?? null,
    isLokasi: normalizeOptionalText(request.isLokasi) ?? null,
    Phone: normalizeOptionalText(request.Phone) ?? null,
    DeptId: request.DeptId ?? null,
    CardNo: cardNo,
    Shift: request.Shift ?? null,
    isMem: request.isMem ?? false,
    isMemDate: request.isMem ? request.isMemDate ?? null : null,
    SbuSub: request.SbuSub ?? null,
    Nik: normalizeOptionalText(request.Nik) ?? null,
    ResignDate: request.ResignDate ?? null,
    statusLMS: normalizeStatusLmsInput(request.statusLMS),
    roleId: request.roleId ?? null,
    jobDesc: normalizeOptionalText(request.jobDesc) ?? null,
    city: normalizeOptionalText(request.city) ?? null,
    state: normalizeRequiredText(request.state, "Indonesia"),
    email: normalizeEmailText(request.email) ?? null,
    IPMsnFinger: normalizeRequiredText(request.IPMsnFinger, "-"),
    BPJSKshtn: normalizeOptionalText(request.BPJSKshtn) ?? null,
    BPJSKtngkerjaan: normalizeOptionalText(request.BPJSKtngkerjaan) ?? null,
  };

  return data;
};

const ensureEmployeeCanBeDeleted = async (userId: number) => {
  const [
    chartMemberCount,
    caseRequesterCount,
    caseFeedbackApproverCount,
    caseAssigneeCount,
    caseAssigneeMemberCount,
    notificationOutboxCount,
    notificationMessageCount,
    pdcaOwnerCount,
    feedbackCommentCount,
    pilarPicCount,
    sbuPicCount,
    sbuSubPicCount,
  ] = await Promise.all([
    prismaFlowly.chartMember.count({
      where: {
        userId,
        isDeleted: false,
      },
    }),
    prismaFlowly.caseHeader.count({
      where: {
        requesterEmployeeId: userId,
        isDeleted: false,
      },
    }),
    prismaFlowly.caseHeader.count({
      where: {
        feedbackApprovedByEmployeeId: userId,
        isDeleted: false,
      },
    }),
    prismaFlowly.caseDepartment.count({
      where: {
        assigneeEmployeeId: userId,
        isDeleted: false,
      },
    }),
    prismaFlowly.caseDepartmentAssignee.count({
      where: {
        employeeId: userId,
        isDeleted: false,
      },
    }),
    prismaFlowly.caseNotificationOutbox.count({
      where: {
        recipientEmployeeId: userId,
        isDeleted: false,
      },
    }),
    prismaFlowly.caseNotificationMessage.count({
      where: {
        recipientEmployeeId: userId,
        isDeleted: false,
      },
    }),
    prismaFlowly.casePdcaItem.count({
      where: {
        ownerEmployeeId: userId,
        isDeleted: false,
      },
    }),
    prismaFlowly.caseFeedbackComment.count({
      where: {
        commenterEmployeeId: userId,
        isDeleted: false,
      },
    }),
    prismaEmployee.em_pilar.count({
      where: {
        pic: userId,
        OR: [{ isDeleted: false }, { isDeleted: null }],
      },
    }),
    prismaEmployee.em_sbu.count({
      where: {
        pic: userId,
        OR: [{ isDeleted: false }, { isDeleted: null }],
      },
    }),
    prismaEmployee.em_sbu_sub.count({
      where: {
        pic: userId,
        OR: [{ isDeleted: false }, { isDeleted: null }],
      },
    }),
  ]);

  const references = [
    { label: "chart member", count: chartMemberCount },
    { label: "case requester", count: caseRequesterCount },
    { label: "case feedback approver", count: caseFeedbackApproverCount },
    { label: "case department assignee", count: caseAssigneeCount },
    { label: "case department assignee member", count: caseAssigneeMemberCount },
    { label: "case notification outbox", count: notificationOutboxCount },
    { label: "case notification message", count: notificationMessageCount },
    { label: "case PDCA owner", count: pdcaOwnerCount },
    { label: "case feedback comment", count: feedbackCommentCount },
    { label: "pilar PIC", count: pilarPicCount },
    { label: "SBU PIC", count: sbuPicCount },
    { label: "SBU Sub PIC", count: sbuSubPicCount },
  ].filter((item) => item.count > 0);

  if (references.length > 0) {
    throw new ResponseError(
      400,
      `Employee cannot be deleted because it is still used in ${references
        .map((item) => `${item.label} (${item.count})`)
        .join(", ")}`
    );
  }
};

export class EmployeeService {
  static async listForPIC() {
    const [employees, departmentMap] = await Promise.all([
      prismaEmployee.em_employee.findMany({
        select: employeeSelect,
        orderBy: [{ Name: "asc" }, { BadgeNum: "asc" }],
      }),
      getDepartmentMap(),
    ]);

    return employees.map((employee) =>
      toEmployeeResponse({
        ...employee,
        DeptName:
          employee.DeptId !== null && employee.DeptId !== undefined
            ? departmentMap.get(employee.DeptId) ?? null
            : null,
      })
    );
  }

  static async listDepartments() {
    const departments = await prismaEmployee.em_dept.findMany({
      select: {
        DEPTID: true,
        DEPTNAME: true,
      },
      orderBy: {
        DEPTNAME: "asc",
      },
    });

    return departments.map(toEmployeeDepartmentResponse);
  }

  static async create(requesterUserId: string, request: CreateEmployeeRequest) {
    await ensureHrdCrudAccess(requesterUserId);

    const validated = Validation.validate(
      EmployeeValidation.CREATE,
      request
    ) as CreateEmployeeRequest;

    await ensureDepartmentExists(validated.DeptId);
    await ensureEmployeeUniqueFields({
      badgeNum: validated.BadgeNum,
      cardNo: validated.CardNo,
      nik: validated.Nik,
      phone: validated.Phone,
      email: validated.email,
    });

    const created = await prismaEmployee.em_employee.create({
      data: buildEmployeeCreateData(validated, requesterUserId),
      select: employeeSelect,
    });

    const response = await withDepartmentName(created);

    await writeAuditLog({
      module: "HRD",
      entity: "EMPLOYEE",
      entityId: String(response.UserId),
      action: "CREATE",
      actorId: requesterUserId,
      actorType: resolveActorType(requesterUserId),
      snapshot: getEmployeeSnapshot(response as unknown as Record<string, unknown>),
    });

    return response;
  }

  static async update(requesterUserId: string, request: UpdateEmployeeRequest) {
    await ensureHrdCrudAccess(requesterUserId);

    const validated = Validation.validate(
      EmployeeValidation.UPDATE,
      request
    ) as UpdateEmployeeRequest;

    const existing = await prismaEmployee.em_employee.findUnique({
      where: { UserId: validated.userId },
      select: employeeSelect,
    });

    if (!existing) {
      throw new ResponseError(404, "Employee not found");
    }

    if (validated.DeptId !== undefined) {
      await ensureDepartmentExists(validated.DeptId);
    }

    await ensureEmployeeUniqueFields({
      badgeNum: validated.BadgeNum,
      cardNo: validated.CardNo,
      nik: validated.Nik,
      phone: validated.Phone,
      email: validated.email,
      excludeUserId: validated.userId,
    });

    const updated = await prismaEmployee.em_employee.update({
      where: { UserId: validated.userId },
      data: buildEmployeeUpdateData(validated),
      select: employeeSelect,
    });

    const response = await withDepartmentName(updated);
    const before = await withDepartmentName(existing);
    const changes = buildChanges(
      before as unknown as Record<string, unknown>,
      response as unknown as Record<string, unknown>,
      EMPLOYEE_AUDIT_FIELDS as unknown as string[]
    );

    if (changes.length > 0) {
      await writeAuditLog({
        module: "HRD",
        entity: "EMPLOYEE",
        entityId: String(response.UserId),
        action: "UPDATE",
        actorId: requesterUserId,
        actorType: resolveActorType(requesterUserId),
        changes,
      });
    }

    return response;
  }

  static async remove(requesterUserId: string, request: DeleteEmployeeRequest) {
    await ensureHrdCrudAccess(requesterUserId);

    const validated = Validation.validate(
      EmployeeValidation.DELETE,
      request
    ) as DeleteEmployeeRequest;

    const existing = await prismaEmployee.em_employee.findUnique({
      where: { UserId: validated.userId },
      select: employeeSelect,
    });

    if (!existing) {
      throw new ResponseError(404, "Employee not found");
    }

    await ensureEmployeeCanBeDeleted(validated.userId);

    await prismaEmployee.em_employee.delete({
      where: { UserId: validated.userId },
    });

    const snapshot = await withDepartmentName(existing);
    await writeAuditLog({
      module: "HRD",
      entity: "EMPLOYEE",
      entityId: String(snapshot.UserId),
      action: "DELETE",
      actorId: requesterUserId,
      actorType: resolveActorType(requesterUserId),
      snapshot: getEmployeeSnapshot(snapshot as unknown as Record<string, unknown>),
    });

    return { message: "Employee deleted" };
  }

  static async updateJobDesc(
    requesterUserId: string,
    request: UpdateEmployeeJobDescRequest
  ) {
    await ensureHrdCrudAccess(requesterUserId);

    const updateReq = Validation.validate(
      EmployeeValidation.UPDATE_JOB_DESC,
      request
    ) as UpdateEmployeeJobDescRequest;

    const employee = await prismaEmployee.em_employee.findUnique({
      where: { UserId: updateReq.userId },
      select: employeeSelect,
    });

    if (!employee) {
      throw new ResponseError(404, "Employee not found");
    }

    const updated = await prismaEmployee.em_employee.update({
      where: { UserId: updateReq.userId },
      data: {
        jobDesc: normalizeOptionalText(updateReq.jobDesc) ?? null,
        Lastupdate: new Date(),
      },
      select: employeeSelect,
    });

    const response = await withDepartmentName(updated);
    const before = await withDepartmentName(employee);
    const changes = buildChanges(
      before as unknown as Record<string, unknown>,
      response as unknown as Record<string, unknown>,
      ["jobDesc", "Lastupdate"]
    );

    if (changes.length > 0) {
      await writeAuditLog({
        module: "HRD",
        entity: "EMPLOYEE",
        entityId: String(response.UserId),
        action: "UPDATE",
        actorId: requesterUserId,
        actorType: resolveActorType(requesterUserId),
        changes,
      });
    }

    return response;
  }
}
