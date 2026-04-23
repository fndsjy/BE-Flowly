import bcrypt from "bcrypt";
import { prismaEmployee, prismaFlowly } from "../application/database.js";
import { logger } from "../application/logging.js";
import {
  invalidateProfileCache,
  withProfileCache,
} from "../application/profile-cache.js";
import { ResponseError } from "../error/response-error.js";
import {
  toLoginResponse,
  toUserListResponse,
  toUserResponse,
  type ChangePasswordRequest,
  type ChangeRoleRequest,
  type CreateUserRequest,
  type LoginRequest,
  type LoginResponse,
  type UpdateProfileRequest,
  type UserListResponse,
  type UserProfileResponse,
  type UserResponse,
} from "../model/user-model.js";
import { generateToken, getTokenExpiresIn } from "../utils/auth.js";
import { generateUserId } from "../utils/id-generator.js";
import { UserValidation } from "../validation/user-validation.js";
import { Validation } from "../validation/validation.js";

const SELF_EDITABLE_PROFILE_FIELDS = [
  "street",
  "city",
  "email",
  "phone",
] as const;

const ADMIN_EDITABLE_PROFILE_FIELDS = [
  ...SELF_EDITABLE_PROFILE_FIELDS,
  "name",
  "cardNumber",
  "gender",
  "nik",
  "birthDay",
  "religion",
  "hireDay",
  "state",
  "departmentId",
  "isMem",
  "isMemDate",
  "imgName",
  "tipe",
  "location",
  "statusLMS",
  "bpjsKesehatan",
  "bpjsKetenagakerjaan",
] as const;

type EditableProfileField =
  | (typeof SELF_EDITABLE_PROFILE_FIELDS)[number]
  | (typeof ADMIN_EDITABLE_PROFILE_FIELDS)[number];

type EmployeeProfileRecord = {
  UserId: number;
  CardNo: string | null;
  Name: string | null;
  Gender: string | null;
  BirthDay: Date | null;
  HireDay: Date | null;
  Street: string | null;
  Religion: string | null;
  Tipe: string | null;
  isLokasi: string | null;
  Phone: string | null;
  DeptId: number | null;
  Password: string | null;
  isMem: boolean | null;
  isMemDate: Date | null;
  ImgName: string | null;
  Nik: string | null;
  city: string | null;
  state: string;
  email: string | null;
  BPJSKshtn: string | null;
  BPJSKtngkerjaan: string | null;
  statusLMS: boolean;
  roleId: number | null;
  isFirstLogin: number | null;
};

type FlowlyUserWithRole = {
  userId: string;
  username: string;
  name: string;
  cardNumber: string;
  department: string | null;
  roleId: string;
  isActive: boolean;
  isDeleted: boolean;
  password: string;
  token: string | null;
  role: {
    roleName: string;
    roleLevel: number;
  };
};

type DemoPortalKey =
  | "SUPPLIER"
  | "CUSTOMER"
  | "AFFILIATE"
  | "INFLUENCER"
  | "COMMUNITY";

type DemoPortalUser = {
  userId: string;
  username: string;
  email: string;
  name: string;
  password: string;
  cardNumber: string;
  roleId: string;
  roleName: DemoPortalKey;
  roleLevel: number;
  department: string | null;
  jobDesc: string | null;
};

type ProfileContext = {
  flowlyUser: FlowlyUserWithRole | null;
  employee: EmployeeProfileRecord | null;
  roleId: string;
  roleName: string;
  roleLevel: number;
  userId: string;
  username: string;
  name: string;
  cardNumber: string | null;
  department: string | null;
};

type ProfilePerfTrace = {
  flowlyUserMs?: number;
  employeeByCardMs?: number;
  employeeByUserIdMs?: number;
  departmentMs?: number;
  resolutionPath?: "flowly" | "employee" | "demo";
  employeeMatch?: "cardNumber" | "userId" | "none";
};

const DEMO_PORTAL_USERS: DemoPortalUser[] = [
  {
    userId: "DEMO_SUPPLIER",
    username: "supplier.demo",
    email: "supplier.demo@oms.local",
    name: "Demo Supplier User",
    password: "Portal123!",
    cardNumber: "SUP-DEMO-001",
    roleId: "DEMO_SUPPLIER",
    roleName: "SUPPLIER",
    roleLevel: 4,
    department: "OMS Demo Supplier",
    jobDesc: "Demo portal supplier",
  },
  {
    userId: "DEMO_CUSTOMER",
    username: "customer.demo",
    email: "customer.demo@oms.local",
    name: "Demo Customer User",
    password: "Portal123!",
    cardNumber: "CUS-DEMO-001",
    roleId: "DEMO_CUSTOMER",
    roleName: "CUSTOMER",
    roleLevel: 4,
    department: "OMS Demo Customer",
    jobDesc: "Demo portal customer",
  },
  {
    userId: "DEMO_AFFILIATE",
    username: "affiliate.demo",
    email: "affiliate.demo@oms.local",
    name: "Demo Affiliate User",
    password: "Portal123!",
    cardNumber: "AFF-DEMO-001",
    roleId: "DEMO_AFFILIATE",
    roleName: "AFFILIATE",
    roleLevel: 4,
    department: "OMS Demo Affiliate",
    jobDesc: "Demo portal affiliate",
  },
  {
    userId: "DEMO_INFLUENCER",
    username: "influencer.demo",
    email: "influencer.demo@oms.local",
    name: "Demo Influencer User",
    password: "Portal123!",
    cardNumber: "INF-DEMO-001",
    roleId: "DEMO_INFLUENCER",
    roleName: "INFLUENCER",
    roleLevel: 4,
    department: "OMS Demo Influencer",
    jobDesc: "Demo portal influencer",
  },
  {
    userId: "DEMO_COMMUNITY",
    username: "community.demo",
    email: "community.demo@oms.local",
    name: "Demo Community User",
    password: "Portal123!",
    cardNumber: "COM-DEMO-001",
    roleId: "DEMO_COMMUNITY",
    roleName: "COMMUNITY",
    roleLevel: 4,
    department: "OMS Demo Community",
    jobDesc: "Demo portal community",
  },
];

const normalizeLoginIdentity = (value?: string | null) =>
  value?.trim().toLowerCase() ?? "";

const isEmailLoginIdentity = (value?: string | null) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value?.trim() ?? "");

const findDemoPortalUserByEmail = (value?: string | null) => {
  const normalized = normalizeLoginIdentity(value);
  if (!normalized) {
    return null;
  }

  return (
    DEMO_PORTAL_USERS.find(
      (user) => normalizeLoginIdentity(user.email) === normalized
    ) ?? null
  );
};

const findDemoPortalUserById = (userId: string) =>
  DEMO_PORTAL_USERS.find((user) => user.userId === userId) ?? null;

const isEmployeeFirstLogin = (value?: number | null) =>
  Number(value ?? 0) !== 0;

const employeeProfileSelect = {
  UserId: true,
  CardNo: true,
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
  Password: true,
  isMem: true,
  isMemDate: true,
  ImgName: true,
  Nik: true,
  city: true,
  state: true,
  email: true,
  BPJSKshtn: true,
  BPJSKtngkerjaan: true,
  statusLMS: true,
  roleId: true,
  isFirstLogin: true,
} as const;

const isEnabled = (value: string | undefined, defaultValue = false) => {
  const normalized = value?.trim().toLowerCase();
  if (!normalized) {
    return defaultValue;
  }

  return normalized === "1" || normalized === "true" || normalized === "yes";
};

const parsePositiveInteger = (value: string | undefined, fallback: number) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }

  return Math.floor(parsed);
};

const profilePerfVerbose = isEnabled(process.env.PROFILE_PERF_LOG, false);
const profileSlowThresholdMs = parsePositiveInteger(
  process.env.PROFILE_SLOW_THRESHOLD_MS,
  2000
);

const profilePerfNow = () => process.hrtime.bigint();

const profilePerfElapsedMs = (startedAt: bigint) =>
  Math.round((Number(process.hrtime.bigint() - startedAt) / 1_000_000) * 100) /
  100;

const shouldLogProfilePerf = (totalMs: number) =>
  profilePerfVerbose || totalMs >= profileSlowThresholdMs;

const logProfilePerf = (
  userId: string,
  totalMs: number,
  trace: ProfilePerfTrace
) => {
  if (!shouldLogProfilePerf(totalMs)) {
    return;
  }

  const level =
    totalMs >= profileSlowThresholdMs ? logger.warn.bind(logger) : logger.info.bind(logger);

  level("[PROFILE PERF]", {
    userId,
    totalMs,
    thresholdMs: profileSlowThresholdMs,
    resolutionPath: trace.resolutionPath ?? null,
    employeeMatch: trace.employeeMatch ?? null,
    flowlyUserMs: trace.flowlyUserMs ?? null,
    employeeByCardMs: trace.employeeByCardMs ?? null,
    employeeByUserIdMs: trace.employeeByUserIdMs ?? null,
    departmentMs: trace.departmentMs ?? null,
  });
};

const normalizeOptionalText = (value?: string | null) => {
  if (value === undefined) {
    return undefined;
  }
  if (value === null) {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const normalizeGenderInput = (value?: string | null) => {
  if (value === undefined) {
    return undefined;
  }
  if (value === null) {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

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

const normalizeProfileEmail = (value?: string | null) => {
  if (value === undefined || value === null) {
    return null;
  }

  const trimmed = value.trim();
  return trimmed && trimmed !== "-" ? trimmed : null;
};

const normalizeProfileEmailForCompare = (value?: string | null) => {
  const normalized = normalizeProfileEmail(value);
  return normalized ? normalized.toLowerCase() : null;
};

const normalizeProfileIdentifierForCompare = (value?: string | null) => {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed.toUpperCase() : null;
};

const normalizeProfilePhoneForCompare = (value?: string | null) => {
  const digits = value?.replace(/\D+/g, "") ?? "";
  return digits.length > 0 ? digits : null;
};

const getEditableProfileFields = (
  isAdmin: boolean,
  hasEmployeeProfile: boolean
): string[] => {
  if (!hasEmployeeProfile) {
    return [];
  }

  return isAdmin
    ? [...ADMIN_EDITABLE_PROFILE_FIELDS]
    : [...SELF_EDITABLE_PROFILE_FIELDS];
};

const findDepartmentName = async (
  departmentId?: number | null,
  trace?: ProfilePerfTrace
) => {
  if (departmentId === undefined || departmentId === null) {
    return null;
  }

  const startedAt = profilePerfNow();
  const department = await prismaEmployee.em_dept.findUnique({
    where: { DEPTID: departmentId },
    select: { DEPTNAME: true },
  });

  if (trace) {
    trace.departmentMs = profilePerfElapsedMs(startedAt);
  }

  return department?.DEPTNAME ?? null;
};

const ensureDepartmentExists = async (departmentId?: number | null) => {
  if (departmentId === undefined || departmentId === null) {
    return;
  }

  const department = await prismaEmployee.em_dept.findUnique({
    where: { DEPTID: departmentId },
    select: { DEPTID: true },
  });

  if (!department) {
    throw new ResponseError(400, "Department not found");
  }
};

type EmployeeProfileUniquenessCandidate = {
  UserId: number;
  BadgeNum: string | null;
  CardNo: string | null;
  Nik: string | null;
  Phone: string | null;
  email: string | null;
};

const listEmployeeProfileUniquenessCandidates = async (
  excludeUserId?: number
) => {
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

const hasMatchingProfileCardNumber = (
  employee: EmployeeProfileUniquenessCandidate,
  normalizedValue: string
) =>
  normalizeProfileIdentifierForCompare(employee.BadgeNum) === normalizedValue ||
  normalizeProfileIdentifierForCompare(employee.CardNo) === normalizedValue;

const ensureUniqueEmployeeProfileFields = async (params: {
  cardNumber?: string;
  nik?: string | null;
  phone?: string | null;
  email?: string | null;
  excludeUserId?: number;
}) => {
  const candidates = await listEmployeeProfileUniquenessCandidates(
    params.excludeUserId
  );
  const normalizedCardNumber = normalizeProfileIdentifierForCompare(
    params.cardNumber
  );
  const normalizedNik = normalizeProfileIdentifierForCompare(params.nik);
  const normalizedPhone = normalizeProfilePhoneForCompare(params.phone);
  const normalizedEmail = normalizeProfileEmailForCompare(params.email);

  if (
    normalizedCardNumber &&
    candidates.some((employee) =>
      hasMatchingProfileCardNumber(employee, normalizedCardNumber)
    )
  ) {
    throw new ResponseError(400, "Card number sudah dipakai karyawan lain");
  }

  if (
    normalizedNik &&
    candidates.some(
      (employee) =>
        normalizeProfileIdentifierForCompare(employee.Nik) === normalizedNik
    )
  ) {
    throw new ResponseError(400, "NIK sudah dipakai karyawan lain");
  }

  if (
    normalizedPhone &&
    candidates.some(
      (employee) =>
        normalizeProfilePhoneForCompare(employee.Phone) === normalizedPhone
    )
  ) {
    throw new ResponseError(400, "Nomor telepon sudah dipakai karyawan lain");
  }

  if (
    normalizedEmail &&
    candidates.some(
      (employee) =>
        normalizeProfileEmailForCompare(employee.email) === normalizedEmail
    )
  ) {
    throw new ResponseError(400, "Email sudah dipakai karyawan lain");
  }
};

const findEmployeeByUserId = async (
  employeeUserId: number,
  trace?: ProfilePerfTrace
): Promise<EmployeeProfileRecord | null> => {
  const startedAt = profilePerfNow();
  const employee = await prismaEmployee.em_employee.findUnique({
    where: { UserId: employeeUserId },
    select: employeeProfileSelect,
  });

  if (trace) {
    trace.employeeByUserIdMs = profilePerfElapsedMs(startedAt);
  }

  return employee;
};

const findEmployeeByCardNumber = async (
  cardNumber?: string | null,
  trace?: ProfilePerfTrace
): Promise<EmployeeProfileRecord | null> => {
  const normalized = cardNumber?.trim();
  if (!normalized) {
    return null;
  }

  const startedAt = profilePerfNow();
  const employee = await prismaEmployee.em_employee.findFirst({
    where: { CardNo: normalized },
    select: employeeProfileSelect,
  });

  if (trace) {
    trace.employeeByCardMs = profilePerfElapsedMs(startedAt);
  }

  return employee;
};

const findFlowlyUserById = async (
  userId: string,
  trace?: ProfilePerfTrace
): Promise<FlowlyUserWithRole | null> => {
  const startedAt = profilePerfNow();
  const user = await prismaFlowly.user.findUnique({
    where: { userId },
    include: {
      role: {
        select: {
          roleName: true,
          roleLevel: true,
        },
      },
    },
  });

  if (trace) {
    trace.flowlyUserMs = profilePerfElapsedMs(startedAt);
  }

  if (!user || user.isDeleted) {
    return null;
  }

  return {
    ...user,
    cardNumber: user.badgeNumber,
  };
};

const resolveProfileContext = async (
  userId: string,
  trace?: ProfilePerfTrace
): Promise<ProfileContext> => {
  const flowlyUser = await findFlowlyUserById(userId, trace);
  if (flowlyUser) {
    if (trace) {
      trace.resolutionPath = "flowly";
    }

    const employee = await findEmployeeByCardNumber(flowlyUser.cardNumber, trace);
    if (trace) {
      trace.employeeMatch = employee ? "cardNumber" : "none";
    }

    return {
      flowlyUser,
      employee,
      roleId: flowlyUser.roleId,
      roleName: flowlyUser.role.roleName,
      roleLevel: flowlyUser.role.roleLevel,
      userId: flowlyUser.userId,
      username: flowlyUser.username,
      name: employee?.Name ?? flowlyUser.name,
      cardNumber: employee?.CardNo ?? flowlyUser.cardNumber,
      department: flowlyUser.department,
    };
  }

  const employeeUserId = Number(userId);
  if (Number.isNaN(employeeUserId)) {
    throw new ResponseError(404, "User not found");
  }

  const employee = await findEmployeeByUserId(employeeUserId, trace);
  if (!employee) {
    throw new ResponseError(404, "User not found");
  }

  if (trace) {
    trace.resolutionPath = "employee";
    trace.employeeMatch = "userId";
  }

  const username = employee.CardNo?.trim() || String(employee.UserId);
  const name = employee.Name ?? username;

  return {
    flowlyUser: null,
    employee,
    roleId:
      employee.roleId !== null && employee.roleId !== undefined
        ? String(employee.roleId)
        : "EMPLOYEE",
    roleName: "Employee",
    roleLevel: 4,
    userId: String(employee.UserId),
    username,
    name,
    cardNumber: employee.CardNo ?? null,
    department: null,
  };
};

const toProfileResponse = async (
  context: ProfileContext,
  trace?: ProfilePerfTrace
): Promise<UserProfileResponse> => {
  const { employee, roleLevel } = context;
  const isAdmin = roleLevel === 1;
  const departmentName =
    employee?.DeptId !== null && employee?.DeptId !== undefined
      ? await findDepartmentName(employee.DeptId, trace)
      : context.department;

  return {
    userId: context.userId,
    username: context.username,
    name: employee?.Name ?? context.name,
    cardNumber: employee?.CardNo ?? context.cardNumber ?? null,
    department: departmentName ?? null,
    departmentId: employee?.DeptId ?? null,
    employeeUserId: employee?.UserId ?? null,
    roleId: context.roleId,
    roleName: context.roleName,
    roleLevel: context.roleLevel,
    gender: employee?.Gender ?? null,
    nik: employee?.Nik ?? null,
    birthDay: employee?.BirthDay ?? null,
    religion: employee?.Religion ?? null,
    hireDay: employee?.HireDay ?? null,
    street: employee?.Street ?? null,
    city: employee?.city ?? null,
    state: employee?.state ?? null,
    email: normalizeProfileEmail(employee?.email),
    phone: employee?.Phone ?? null,
    isMem: employee?.isMem ?? null,
    isMemDate: employee?.isMemDate ?? null,
    imgName: employee?.ImgName ?? null,
    tipe: employee?.Tipe ?? null,
    location: employee?.isLokasi ?? null,
    statusLMS: employee?.statusLMS ?? false,
    bpjsKesehatan: employee?.BPJSKshtn ?? null,
    bpjsKetenagakerjaan: employee?.BPJSKtngkerjaan ?? null,
    canEditProfile: Boolean(employee),
    canEditAllProfileFields: Boolean(employee) && isAdmin,
    canEditProfilePhoto: Boolean(employee) && isAdmin,
    canChangePassword: true,
    mustChangePassword: isEmployeeFirstLogin(employee?.isFirstLogin),
    editableFields: getEditableProfileFields(isAdmin, Boolean(employee)),
  };
};

const hasOwn = (value: object, key: string) =>
  Object.prototype.hasOwnProperty.call(value, key);

export class UserService {
  static async register(
    request: CreateUserRequest,
    requesterUserId: string
  ): Promise<UserResponse> {
    const registerRequest = Validation.validate(
      UserValidation.REGISTER,
      request
    ) as CreateUserRequest;

    const requester = await prismaFlowly.user.findUnique({
      where: { userId: requesterUserId },
      include: { role: true },
    });
    if (!requester || requester.isDeleted || requester.role.roleLevel !== 1) {
      throw new ResponseError(403, "Only Admin can register new users");
    }

    const existing = await prismaFlowly.user.findUnique({
      where: { username: registerRequest.username },
    });
    if (existing) {
      throw new ResponseError(400, "Username already taken");
    }

    let roleToAssign;
    if (registerRequest.roleId) {
      roleToAssign = await prismaFlowly.role.findUnique({
        where: { roleId: registerRequest.roleId, roleIsActive: true },
      });
      if (!roleToAssign) {
        throw new ResponseError(400, "Selected role is invalid or inactive");
      }
    } else {
      roleToAssign = await prismaFlowly.role.findFirst({
        where: { roleLevel: 4, roleIsActive: true },
      });
      if (!roleToAssign) {
        throw new ResponseError(500, "Default role (level 4) not found");
      }
    }

    const cardNumber = registerRequest.cardNumber.trim();
    if (!cardNumber) {
      throw new ResponseError(400, "Card number is required");
    }

    const userId = await generateUserId();
    const hashed = await bcrypt.hash(registerRequest.password, 10);
    const user = await prismaFlowly.user.create({
      data: {
        userId,
        ...registerRequest,
        password: hashed,
        roleId: roleToAssign.roleId,
        badgeNumber: cardNumber,
        createdBy: requesterUserId,
        updatedBy: requesterUserId,
        isActive: true,
        isDeleted: false,
      },
    });

    return toUserResponse(user);
  }

  static async login(request: LoginRequest): Promise<LoginResponse> {
    const loginRequest = Validation.validate(
      UserValidation.LOGIN,
      request
    ) as LoginRequest;

    const identity =
      loginRequest.identity?.trim() ||
      loginRequest.email?.trim() ||
      loginRequest.username?.trim() ||
      loginRequest.cardNo?.trim();

    if (!identity) {
      throw new ResponseError(400, "Login identity is required");
    }

    if (isEmailLoginIdentity(identity)) {
      const demoPortalUser = findDemoPortalUserByEmail(identity);
      if (!demoPortalUser) {
        throw new ResponseError(401, "Invalid email or password");
      }

      if (loginRequest.password !== demoPortalUser.password) {
        throw new ResponseError(401, "Invalid email or password");
      }

      const token = generateToken({
        userId: demoPortalUser.userId,
        username: demoPortalUser.email,
        roleId: demoPortalUser.roleId,
      });

        return toLoginResponse(
          {
            username: demoPortalUser.email,
            name: demoPortalUser.name,
            jobDesc: demoPortalUser.jobDesc,
            mustChangePassword: false,
          },
          token
        );
    }

    const user = await prismaFlowly.user.findFirst({
      where: {
        isDeleted: false,
        isActive: true,
        username: identity,
      },
      include: { role: true },
    });
    if (user) {
      const valid = await bcrypt.compare(loginRequest.password, user.password);
      if (!valid) {
        throw new ResponseError(401, "Invalid username or password");
      }

      let token = user.token;
      let expiresIn = 0;

      if (token) {
        expiresIn = getTokenExpiresIn(token);
        if (expiresIn <= 0) {
          token = null;
        }
      }

      if (!token) {
        token = generateToken(user);
        expiresIn = 3 * 60 * 60;

        await prismaFlowly.user.update({
          where: { userId: user.userId },
          data: {
            token,
            lastLogin: new Date(),
          },
        });
      }

      return toLoginResponse(user, token);
    }

      const employee = await prismaEmployee.em_employee.findFirst({
        where: { CardNo: identity },
        select: {
          UserId: true,
          CardNo: true,
          Name: true,
          Password: true,
          roleId: true,
          jobDesc: true,
          isFirstLogin: true,
        },
      });

    if (!employee || !employee.Password) {
      throw new ResponseError(401, "Invalid card number or password");
    }

    const isPasswordValid = await UserService.isEmployeePasswordValid(
      loginRequest.password,
      employee.Password
    );
    if (!isPasswordValid) {
      throw new ResponseError(401, "Invalid card number or password");
    }

    const employeeUsername = employee.CardNo?.trim() || identity;

    const token = generateToken({
      userId: String(employee.UserId),
      username: employeeUsername,
      roleId: String(employee.roleId ?? "EMPLOYEE"),
    });

    return toLoginResponse(
      {
        username: employeeUsername,
        name: employee.Name ?? employeeUsername,
        jobDesc: employee.jobDesc ?? null,
        mustChangePassword: isEmployeeFirstLogin(employee.isFirstLogin),
      },
      token
    );
  }

  private static async isEmployeePasswordValid(
    password: string,
    storedPassword: string
  ): Promise<boolean> {
    const normalized = storedPassword.trim();
    const bcryptHash = normalized.startsWith("$2y$")
      ? `$2b$${normalized.slice(4)}`
      : normalized;

    try {
      return await bcrypt.compare(password, bcryptHash);
    } catch {
      return password === normalized;
    }
  }

  static async getProfile(userId: string): Promise<UserProfileResponse> {
    const demoPortalUser = findDemoPortalUserById(userId);
    if (demoPortalUser) {
      return {
        userId: demoPortalUser.userId,
        username: demoPortalUser.email,
        name: demoPortalUser.name,
        cardNumber: demoPortalUser.cardNumber,
        department: demoPortalUser.department,
        departmentId: null,
        employeeUserId: null,
        roleId: demoPortalUser.roleId,
        roleName: demoPortalUser.roleName,
        roleLevel: demoPortalUser.roleLevel,
        gender: null,
        nik: null,
        birthDay: null,
        religion: null,
        hireDay: null,
        street: null,
        city: null,
        state: null,
        email: demoPortalUser.email,
        phone: null,
        isMem: null,
        isMemDate: null,
        imgName: null,
        tipe: null,
        location: null,
        statusLMS: false,
        bpjsKesehatan: null,
        bpjsKetenagakerjaan: null,
        canEditProfile: false,
        canEditAllProfileFields: false,
        canEditProfilePhoto: false,
        canChangePassword: false,
        mustChangePassword: false,
        editableFields: [],
      };
    }

    return withProfileCache(userId, async () => {
      const startedAt = profilePerfNow();
      const trace: ProfilePerfTrace = {};

      const context = await resolveProfileContext(userId, trace);
      const response = await toProfileResponse(context, trace);

      logProfilePerf(userId, profilePerfElapsedMs(startedAt), trace);
      return response;
    });
  }

  static async updateProfile(
    requesterUserId: string,
    request: UpdateProfileRequest
  ): Promise<UserProfileResponse> {
    const validated = Validation.validate(
      UserValidation.UPDATE_PROFILE,
      request
    ) as UpdateProfileRequest;

    const providedKeys = Object.entries(request)
      .filter(([, value]) => value !== undefined)
      .map(([key]) => key as EditableProfileField);

    if (providedKeys.length === 0) {
      throw new ResponseError(400, "No profile changes were provided");
    }

    const context = await resolveProfileContext(requesterUserId);
    if (!context.employee) {
      throw new ResponseError(404, "Employee profile not found");
    }

    const isAdmin = context.roleLevel === 1;
    const allowedFields = new Set<string>(
      getEditableProfileFields(isAdmin, true)
    );
    const unauthorizedFields = providedKeys.filter(
      (key) => !allowedFields.has(key)
    );

    if (unauthorizedFields.length > 0) {
      throw new ResponseError(
        403,
        `You are not allowed to update: ${unauthorizedFields.join(", ")}`
      );
    }

    if (validated.departmentId !== undefined) {
      await ensureDepartmentExists(validated.departmentId);
    }

    const nextCardNumber =
      validated.cardNumber !== undefined ? validated.cardNumber.trim() : undefined;
    const nextNik = validated.nik !== undefined ? validated.nik.trim() : undefined;
    const nextPhone =
      validated.phone !== undefined
        ? normalizeOptionalText(validated.phone)
        : undefined;
    const nextEmail =
      validated.email !== undefined
        ? normalizeOptionalText(validated.email)
        : undefined;

    const changedUniqueFields: {
      cardNumber?: string;
      nik?: string | null;
      phone?: string | null;
      email?: string | null;
    } = {};

    if (
      nextCardNumber !== undefined &&
      normalizeProfileIdentifierForCompare(nextCardNumber) !==
        normalizeProfileIdentifierForCompare(context.employee.CardNo)
    ) {
      changedUniqueFields.cardNumber = nextCardNumber;
    }

    if (
      nextNik !== undefined &&
      normalizeProfileIdentifierForCompare(nextNik) !==
        normalizeProfileIdentifierForCompare(context.employee.Nik)
    ) {
      changedUniqueFields.nik = nextNik;
    }

    if (
      nextPhone !== undefined &&
      normalizeProfilePhoneForCompare(nextPhone) !==
        normalizeProfilePhoneForCompare(context.employee.Phone)
    ) {
      changedUniqueFields.phone = nextPhone;
    }

    if (
      nextEmail !== undefined &&
      normalizeProfileEmailForCompare(nextEmail) !==
        normalizeProfileEmailForCompare(context.employee.email)
    ) {
      changedUniqueFields.email = nextEmail;
    }

    if (Object.keys(changedUniqueFields).length > 0) {
      await ensureUniqueEmployeeProfileFields({
        ...changedUniqueFields,
        excludeUserId: context.employee.UserId,
      });
    }

    const employeeUpdateData: Record<string, unknown> = {
      Lastupdate: new Date(),
    };

    if (validated.name !== undefined) {
      employeeUpdateData.Name = validated.name.trim();
    }

    if (validated.cardNumber !== undefined) {
      const cardNumber = validated.cardNumber.trim();
      employeeUpdateData.BadgeNum = cardNumber;
      employeeUpdateData.CardNo = cardNumber;
    }

    if (validated.gender !== undefined) {
      employeeUpdateData.Gender = normalizeGenderInput(validated.gender) ?? null;
    }

    if (validated.nik !== undefined) {
      employeeUpdateData.Nik = validated.nik.trim();
    }

    if (validated.birthDay !== undefined) {
      employeeUpdateData.BirthDay = validated.birthDay;
    }

    if (validated.religion !== undefined) {
      employeeUpdateData.Religion = validated.religion.trim();
    }

    if (validated.hireDay !== undefined) {
      employeeUpdateData.HireDay = validated.hireDay;
    }

    if (validated.street !== undefined) {
      employeeUpdateData.Street = normalizeOptionalText(validated.street);
    }

    if (validated.city !== undefined) {
      employeeUpdateData.city = normalizeOptionalText(validated.city);
    }

    if (validated.state !== undefined) {
      employeeUpdateData.state = validated.state.trim();
    }

    if (validated.email !== undefined) {
      employeeUpdateData.email = normalizeOptionalText(validated.email);
    }

    if (validated.phone !== undefined) {
      employeeUpdateData.Phone = normalizeOptionalText(validated.phone);
    }

    if (validated.departmentId !== undefined) {
      employeeUpdateData.DeptId = validated.departmentId;
    }

    if (validated.imgName !== undefined) {
      employeeUpdateData.ImgName = normalizeOptionalText(validated.imgName);
    }

    if (validated.tipe !== undefined) {
      employeeUpdateData.Tipe = validated.tipe.trim();
    }

    if (validated.location !== undefined) {
      employeeUpdateData.isLokasi = validated.location.trim();
    }

    if (validated.statusLMS !== undefined) {
      employeeUpdateData.statusLMS = validated.statusLMS;
    }

    if (validated.bpjsKesehatan !== undefined) {
      employeeUpdateData.BPJSKshtn = normalizeOptionalText(
        validated.bpjsKesehatan
      );
    }

    if (validated.bpjsKetenagakerjaan !== undefined) {
      employeeUpdateData.BPJSKtngkerjaan = normalizeOptionalText(
        validated.bpjsKetenagakerjaan
      );
    }

    const isMemSubmitted =
      hasOwn(validated, "isMem") || hasOwn(validated, "isMemDate");
    if (isMemSubmitted) {
      const nextIsMem = validated.isMem ?? context.employee.isMem ?? false;
      const nextIsMemDate = nextIsMem
        ? hasOwn(validated, "isMemDate")
          ? validated.isMemDate ?? null
          : context.employee.isMemDate ?? null
        : null;

      if (nextIsMem && !nextIsMemDate) {
        throw new ResponseError(
          400,
          "Tanggal hafal ibadah wajib diisi saat status hafal ibadah aktif"
        );
      }

      employeeUpdateData.isMem = nextIsMem;
      employeeUpdateData.isMemDate = nextIsMemDate;
    }

    await prismaEmployee.em_employee.update({
      where: { UserId: context.employee.UserId },
      data: employeeUpdateData,
    });

    const shouldSyncFlowlyUser =
      context.flowlyUser &&
      (validated.name !== undefined ||
        validated.cardNumber !== undefined ||
        validated.departmentId !== undefined);

    if (context.flowlyUser && shouldSyncFlowlyUser) {
      const flowlyUserUpdateData: Record<string, unknown> = {
        updatedBy: requesterUserId,
      };

      if (validated.name !== undefined) {
        flowlyUserUpdateData.name = validated.name.trim();
      }

      if (validated.cardNumber !== undefined) {
        flowlyUserUpdateData.badgeNumber = validated.cardNumber.trim();
      }

      if (validated.departmentId !== undefined) {
        flowlyUserUpdateData.department = await findDepartmentName(
          validated.departmentId
        );
      }

      await prismaFlowly.user.update({
        where: { userId: context.flowlyUser.userId },
        data: flowlyUserUpdateData,
      });
    }

    invalidateProfileCache(requesterUserId);
    return this.getProfile(requesterUserId);
  }

  static async listUsers(requesterUserId: string): Promise<UserListResponse[]> {
    const requester = await prismaFlowly.user.findUnique({
      where: { userId: requesterUserId },
      include: { role: true },
    });
    if (!requester || requester.isDeleted || requester.role.roleLevel !== 1) {
      throw new ResponseError(403, "Access denied");
    }

    const users = await prismaFlowly.user.findMany({
      where: { isDeleted: false },
      include: { role: { select: { roleName: true } } },
      orderBy: { createdAt: "desc" },
    });

    return users.map(toUserListResponse);
  }

  static async changePassword(
    userId: string,
    request: ChangePasswordRequest
  ): Promise<void> {
    const changeReq = Validation.validate(
      UserValidation.CHANGE_PASSWORD,
      request
    ) as ChangePasswordRequest;

    const flowlyUser = await prismaFlowly.user.findUnique({
      where: { userId },
    });

    if (flowlyUser && !flowlyUser.isDeleted) {
      const isOldPasswordCorrect = await bcrypt.compare(
        changeReq.oldPassword,
        flowlyUser.password
      );
      if (!isOldPasswordCorrect) {
        throw new ResponseError(400, "Old password is incorrect");
      }

      if (changeReq.newPassword === changeReq.oldPassword) {
        throw new ResponseError(
          400,
          "New password must be different from the old password"
        );
      }

      const hashed = await bcrypt.hash(changeReq.newPassword, 10);
      await prismaFlowly.user.update({
        where: { userId },
        data: {
          password: hashed,
          updatedBy: userId,
        },
      });
      return;
    }

    const employeeUserId = Number(userId);
    if (Number.isNaN(employeeUserId)) {
      throw new ResponseError(404, "User not found");
    }

    const employee = await prismaEmployee.em_employee.findUnique({
      where: { UserId: employeeUserId },
      select: {
        UserId: true,
        Password: true,
      },
    });

    if (!employee || !employee.Password) {
      throw new ResponseError(404, "User not found");
    }

    const isOldPasswordCorrect = await this.isEmployeePasswordValid(
      changeReq.oldPassword,
      employee.Password
    );
    if (!isOldPasswordCorrect) {
      throw new ResponseError(400, "Old password is incorrect");
    }

    if (changeReq.newPassword === changeReq.oldPassword) {
      throw new ResponseError(
        400,
        "New password must be different from the old password"
      );
    }

    const hashed = await bcrypt.hash(changeReq.newPassword, 10);
      await prismaEmployee.em_employee.update({
        where: { UserId: employeeUserId },
        data: {
          Password: hashed,
          isFirstLogin: 0,
          Lastupdate: new Date(),
        },
      });
  }

  static async changeRole(
    requesterUserId: string,
    request: ChangeRoleRequest
  ): Promise<void> {
    const changeReq = Validation.validate(
      UserValidation.CHANGE_ROLE,
      request
    ) as ChangeRoleRequest;

    const requester = await prismaFlowly.user.findUnique({
      where: { userId: requesterUserId },
      include: { role: true },
    });
    if (!requester || requester.isDeleted || requester.role.roleLevel !== 1) {
      throw new ResponseError(403, "Only admin can change roles");
    }

    const targetUser = await prismaFlowly.user.findUnique({
      where: { userId: changeReq.userId },
      select: { userId: true, roleId: true, isDeleted: true },
    });
    if (!targetUser || targetUser.isDeleted) {
      throw new ResponseError(404, "User not found");
    }

    if (targetUser.roleId === changeReq.newRoleId) {
      throw new ResponseError(400, "User already has this role");
    }

    const newRole = await prismaFlowly.role.findUnique({
      where: { roleId: changeReq.newRoleId, roleIsActive: true },
    });
    if (!newRole) {
      throw new ResponseError(400, "Invalid or inactive role");
    }

    await prismaFlowly.user.update({
      where: { userId: changeReq.userId },
      data: {
        roleId: newRole.roleId,
        updatedBy: requesterUserId,
      },
    });

    invalidateProfileCache(changeReq.userId);
  }

  static async listRoles(requesterUserId: string) {
    const requester = await prismaFlowly.user.findUnique({
      where: { userId: requesterUserId },
      include: { role: true },
    });

    if (!requester || requester.isDeleted || requester.role.roleLevel !== 1) {
      throw new ResponseError(403, "Only admin can access roles");
    }

    const roles = await prismaFlowly.role.findMany({
      where: { roleIsActive: true },
      orderBy: { roleLevel: "asc" },
    });

    return roles.map((role) => ({
      roleId: role.roleId,
      roleName: role.roleName,
      roleLevel: role.roleLevel,
      isActive: role.roleIsActive,
    }));
  }
}
