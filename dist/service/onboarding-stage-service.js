import { prismaFlowly, prismaOptidom } from "../application/database.js";
import { ResponseError } from "../error/response-error.js";
import { generateOnboardingAssignmentId, generateOnboardingMaterialProgressId, generateOnboardingStageProgressId, generateOnboardingStageTemplateId, } from "../utils/id-generator.js";
import { getAccessContext } from "../utils/access-scope.js";
import { Validation } from "../validation/validation.js";
import { OnboardingStageValidation } from "../validation/onboarding-stage-validation.js";
import { OnboardingEmployeeScheduleSyncService } from "./onboarding-employee-schedule-sync-service.js";
import { OnboardingMaterialService } from "./onboarding-material-service.js";
const ONBOARDING_ADMIN_PORTAL_KEYS = [
    "EMPLOYEE",
    "SUPPLIER",
    "CUSTOMER",
    "AFFILIATE",
    "INFLUENCER",
    "COMMUNITY",
];
const CUSTOMER_PORTAL_KEY = "CUSTOMER";
const CUSTOMER_PARTICIPANT_REFERENCE_TYPE = "CUSTOMER";
const PROGRAM_TYPE_ONBOARDING = "ONBOARDING";
const PROGRAM_TYPE_LEARNING = "LEARNING";
const PORTAL_ORDER_MAP = new Map(ONBOARDING_ADMIN_PORTAL_KEYS.map((portalKey, index) => [
    portalKey,
    (index + 1) * 10,
]));
const normalizeOptionalText = (value) => {
    const trimmed = value?.trim();
    return trimmed ? trimmed : null;
};
const normalizeUpper = (value) => value?.trim().toUpperCase() ?? "";
const normalizeProgramType = (value, fallback = PROGRAM_TYPE_ONBOARDING) => normalizeUpper(value) === PROGRAM_TYPE_LEARNING
    ? PROGRAM_TYPE_LEARNING
    : fallback;
const toAuditActor = (value) => (normalizeOptionalText(value) ?? "CUSTOMER_PORTAL").slice(0, 20);
const addDays = (value, day) => new Date(value.getTime() + day * 24 * 60 * 60 * 1000);
const normalizeSourceFileId = (value) => {
    const numeric = Number(value ?? 0);
    return Number.isInteger(numeric) && numeric > 0 ? numeric : 0;
};
const deriveMaterialStatus = (files) => {
    if (files.some((file) => normalizeUpper(file.status) === "COMPLETED")) {
        return "COMPLETED";
    }
    if (files.some((file) => Number(file.openCount ?? 0) > 0 || file.readAt)) {
        return "READING";
    }
    return "NOT_STARTED";
};
const earliestDate = (values) => {
    const dates = values.filter((value) => Boolean(value));
    if (dates.length === 0) {
        return null;
    }
    return dates.reduce((earliest, current) => current.getTime() < earliest.getTime() ? current : earliest);
};
const latestDate = (values) => {
    const dates = values.filter((value) => Boolean(value));
    if (dates.length === 0) {
        return null;
    }
    return dates.reduce((latest, current) => current.getTime() > latest.getTime() ? current : latest);
};
const getPortalOrderIndex = (portalKey) => PORTAL_ORDER_MAP.get(normalizeUpper(portalKey)) ?? 999;
const isCustomerProgramEnabled = (value) => {
    const normalized = normalizeOptionalText(value);
    return Boolean(normalized && normalizeUpper(normalized) !== "X");
};
const getCustomerProgramAccess = async (custId) => {
    const normalizedCustId = normalizeOptionalText(custId);
    if (!normalizedCustId) {
        return {
            pretail: null,
            indomata: null,
            bypassProgramFilter: false,
            canAccessPos: false,
            canAccessIndomata: false,
        };
    }
    const rows = await prismaOptidom.$queryRaw `
    SELECT DISTINCT
      [PRetail] AS pretail,
      [indomata] AS indomata
    FROM [dbo].[MstCustExp]
    WHERE [CustId] = ${normalizedCustId}
  `;
    const pretailValues = rows.map((row) => normalizeOptionalText(row.pretail));
    const indomataValues = rows.map((row) => normalizeOptionalText(row.indomata));
    const pretail = pretailValues.find(isCustomerProgramEnabled) ??
        pretailValues.find((value) => Boolean(value)) ??
        null;
    const indomata = indomataValues.find(isCustomerProgramEnabled) ??
        indomataValues.find((value) => Boolean(value)) ??
        null;
    return {
        pretail,
        indomata,
        bypassProgramFilter: false,
        canAccessPos: isCustomerProgramEnabled(pretail),
        canAccessIndomata: isCustomerProgramEnabled(indomata),
    };
};
const canAccessCustomerLearningStage = (stageOrder, access) => {
    if (access.bypassProgramFilter) {
        return true;
    }
    if (stageOrder === 1) {
        return true;
    }
    if (stageOrder === 2) {
        return access.canAccessPos;
    }
    if (stageOrder === 3) {
        return access.canAccessIndomata;
    }
    return true;
};
const parseSelectedMaterialFileIds = (note) => {
    const normalizedNote = normalizeOptionalText(note);
    if (!normalizedNote) {
        return null;
    }
    try {
        const parsed = JSON.parse(normalizedNote);
        if (parsed?.mode !== "SELECTED" || !Array.isArray(parsed.selectedFileIds)) {
            return null;
        }
        const selectedIds = parsed.selectedFileIds
            .map((value) => Number(value))
            .filter((value) => Number.isInteger(value) && value > 0);
        return selectedIds.length > 0 ? new Set(selectedIds) : null;
    }
    catch {
        return null;
    }
};
const filterCustomerMaterialFiles = (files, selectedFileIds) => {
    if (!selectedFileIds || selectedFileIds.size === 0) {
        return files;
    }
    const selectedFiles = files.filter((file) => selectedFileIds.has(file.id));
    return selectedFiles.length > 0 ? selectedFiles : files;
};
const buildMaterialProgressKey = (onboardingStageProgressId, onboardingStageMaterialId, sourceFileId) => `${onboardingStageProgressId}:${onboardingStageMaterialId}:${sourceFileId}`;
const ensureCustomerLearningSourceFile = async (request, stageMaterial) => {
    const sourceFileId = normalizeSourceFileId(request.sourceFileId);
    if (sourceFileId <= 0) {
        throw new ResponseError(400, "File materi tidak valid");
    }
    const sourceMaterials = await OnboardingMaterialService.listSourceMaterials();
    const sourceMaterial = sourceMaterials.find((material) => material.materialId === stageMaterial.materiId);
    if (!sourceMaterial) {
        throw new ResponseError(404, "Materi onboarding tidak ditemukan");
    }
    const selectedFileIds = parseSelectedMaterialFileIds(stageMaterial.note);
    const sourceFile = filterCustomerMaterialFiles(sourceMaterial.files, selectedFileIds).find((file) => file.id === sourceFileId);
    if (!sourceFile) {
        throw new ResponseError(404, "File materi onboarding tidak ditemukan");
    }
    const requestedFileName = normalizeOptionalText(request.fileName);
    if (requestedFileName &&
        normalizeUpper(sourceFile.fileName) !== normalizeUpper(requestedFileName)) {
        throw new ResponseError(403, "Anda tidak memiliki akses ke file ini");
    }
    return sourceFile;
};
const toCustomerLearningRuntime = (assignment) => {
    const stageProgressByTemplateId = new Map();
    const stageProgressByOrder = new Map();
    const materialProgressByKey = new Map();
    for (const stageProgress of assignment.stageProgresses) {
        stageProgressByTemplateId.set(stageProgress.onboardingStageTemplateId, stageProgress);
        stageProgressByOrder.set(stageProgress.stageOrder, stageProgress);
        for (const materialProgress of stageProgress.materialProgresses) {
            materialProgressByKey.set(buildMaterialProgressKey(stageProgress.onboardingStageProgressId, materialProgress.onboardingStageMaterialId, materialProgress.sourceFileId), materialProgress);
        }
    }
    return {
        onboardingAssignmentId: assignment.onboardingAssignmentId,
        stageProgressByTemplateId,
        stageProgressByOrder,
        materialProgressByKey,
    };
};
const ensureCustomerLearningRuntime = async (params) => {
    const participantReferenceId = normalizeOptionalText(params.custId);
    if (!participantReferenceId || params.stageTemplates.length === 0) {
        return null;
    }
    const now = new Date();
    const actorId = toAuditActor(participantReferenceId);
    const durationCandidate = params.portalTemplate.defaultDurationDay == null
        ? null
        : Number(params.portalTemplate.defaultDurationDay);
    const durationDay = durationCandidate && Number.isInteger(durationCandidate) && durationCandidate > 0
        ? durationCandidate
        : null;
    const dueAt = durationDay ? addDays(now, durationDay) : null;
    const createAssignmentId = await generateOnboardingAssignmentId();
    const createStageProgressId = await generateOnboardingStageProgressId();
    const assignment = await prismaFlowly.$transaction(async (tx) => {
        let assignmentHeader = await tx.onboardingAssignment.findFirst({
            where: {
                onboardingPortalTemplateId: params.portalTemplate.onboardingPortalTemplateId,
                portalKey: CUSTOMER_PORTAL_KEY,
                programType: params.programType,
                participantReferenceType: CUSTOMER_PARTICIPANT_REFERENCE_TYPE,
                participantReferenceId,
                isDeleted: false,
                isActive: true,
            },
            orderBy: [{ createdAt: "desc" }],
            select: {
                onboardingAssignmentId: true,
            },
        });
        if (!assignmentHeader) {
            assignmentHeader = await tx.onboardingAssignment.create({
                data: {
                    onboardingAssignmentId: createAssignmentId(),
                    onboardingPortalTemplateId: params.portalTemplate.onboardingPortalTemplateId,
                    portalKey: CUSTOMER_PORTAL_KEY,
                    programType: params.programType,
                    participantReferenceType: CUSTOMER_PARTICIPANT_REFERENCE_TYPE,
                    participantReferenceId,
                    startedAt: now,
                    durationDay,
                    dueAt,
                    status: "IN_PROGRESS",
                    currentStageOrder: params.stageTemplates[0]?.stageOrder ?? null,
                    assignedAt: now,
                    assignedBy: actorId,
                    note: params.programType === PROGRAM_TYPE_LEARNING
                        ? "Auto-created by customer LMS portal"
                        : "Auto-created by customer onboarding portal",
                    completedAt: null,
                    completedBy: null,
                    failedAt: null,
                    failedBy: null,
                    parentOnboardingAssignmentId: null,
                    isActive: true,
                    isDeleted: false,
                    createdAt: now,
                    createdBy: actorId,
                    updatedAt: now,
                    updatedBy: actorId,
                    deletedAt: null,
                    deletedBy: null,
                },
                select: {
                    onboardingAssignmentId: true,
                },
            });
        }
        const existingStageProgresses = await tx.onboardingStageProgress.findMany({
            where: {
                onboardingAssignmentId: assignmentHeader.onboardingAssignmentId,
                isDeleted: false,
            },
            select: {
                onboardingStageProgressId: true,
                onboardingStageTemplateId: true,
                stageOrder: true,
            },
        });
        const existingTemplateIds = new Set(existingStageProgresses.map((stage) => stage.onboardingStageTemplateId));
        const existingStageProgressByOrder = new Map(existingStageProgresses.map((stage) => [stage.stageOrder, stage]));
        for (const stageTemplate of params.stageTemplates) {
            if (existingTemplateIds.has(stageTemplate.onboardingStageTemplateId)) {
                continue;
            }
            const existingProgressWithSameOrder = existingStageProgressByOrder.get(stageTemplate.stageOrder);
            if (existingProgressWithSameOrder) {
                await tx.onboardingStageProgress.update({
                    where: {
                        onboardingStageProgressId: existingProgressWithSameOrder.onboardingStageProgressId,
                    },
                    data: {
                        onboardingStageTemplateId: stageTemplate.onboardingStageTemplateId,
                        stageCode: stageTemplate.stageCode,
                        stageName: stageTemplate.stageName,
                        updatedAt: now,
                        updatedBy: actorId,
                    },
                });
                existingTemplateIds.add(stageTemplate.onboardingStageTemplateId);
                continue;
            }
            await tx.onboardingStageProgress.create({
                data: {
                    onboardingStageProgressId: createStageProgressId(),
                    onboardingAssignmentId: assignmentHeader.onboardingAssignmentId,
                    onboardingStageTemplateId: stageTemplate.onboardingStageTemplateId,
                    stageOrder: stageTemplate.stageOrder,
                    stageCode: stageTemplate.stageCode,
                    stageName: stageTemplate.stageName,
                    status: "READING",
                    remedialCount: 0,
                    startedAt: now,
                    passedAt: null,
                    completedAt: null,
                    failedAt: null,
                    note: null,
                    isActive: true,
                    isDeleted: false,
                    createdAt: now,
                    createdBy: actorId,
                    updatedAt: now,
                    updatedBy: actorId,
                    deletedAt: null,
                    deletedBy: null,
                },
            });
        }
        return tx.onboardingAssignment.findUnique({
            where: {
                onboardingAssignmentId: assignmentHeader.onboardingAssignmentId,
            },
            select: {
                onboardingAssignmentId: true,
                stageProgresses: {
                    where: {
                        isDeleted: false,
                        isActive: true,
                    },
                    select: {
                        onboardingStageProgressId: true,
                        onboardingStageTemplateId: true,
                        stageOrder: true,
                        status: true,
                        materialProgresses: {
                            where: {
                                isDeleted: false,
                                isActive: true,
                            },
                            select: {
                                onboardingMaterialProgressId: true,
                                onboardingStageMaterialId: true,
                                sourceFileId: true,
                                status: true,
                                readAt: true,
                                lastReadAt: true,
                                completedAt: true,
                                openCount: true,
                            },
                        },
                    },
                },
            },
        });
    });
    return assignment ? toCustomerLearningRuntime(assignment) : null;
};
const ensureAdminAccess = async (requesterId) => {
    const accessContext = await getAccessContext(requesterId);
    if (!accessContext.isAdmin) {
        throw new ResponseError(403, "Admin access required");
    }
};
const toStageResponse = (stage) => ({
    onboardingStageTemplateId: stage.onboardingStageTemplateId,
    programType: normalizeProgramType(stage.programType),
    stageOrder: stage.stageOrder,
    stageCode: stage.stageCode,
    stageName: stage.stageName,
    stageDescription: normalizeOptionalText(stage.stageDescription),
    isActive: stage.isActive,
    materialCount: stage._count.stageMaterials,
    examCount: stage._count.stageExams,
    progressCount: stage._count.stageProgresses,
});
const toPortalResponse = (portal) => {
    const stages = portal.stageTemplates.map(toStageResponse);
    return {
        onboardingPortalTemplateId: portal.onboardingPortalTemplateId,
        portalKey: portal.portalKey,
        portalName: portal.portalName,
        defaultDurationDay: portal.defaultDurationDay,
        isActive: portal.isActive,
        totalStageCount: stages.filter((stage) => stage.isActive).length,
        stages,
    };
};
const listPortalTemplates = async () => {
    const portals = await prismaFlowly.onboardingPortalTemplate.findMany({
        where: {
            isDeleted: false,
            portalKey: {
                in: Array.from(ONBOARDING_ADMIN_PORTAL_KEYS),
            },
        },
        include: {
            stageTemplates: {
                where: {
                    isDeleted: false,
                },
                orderBy: [
                    { programType: "asc" },
                    { stageOrder: "asc" },
                    { createdAt: "asc" },
                ],
                select: {
                    onboardingStageTemplateId: true,
                    programType: true,
                    stageOrder: true,
                    stageCode: true,
                    stageName: true,
                    stageDescription: true,
                    isActive: true,
                    _count: {
                        select: {
                            stageMaterials: {
                                where: {
                                    isActive: true,
                                    isDeleted: false,
                                },
                            },
                            stageExams: {
                                where: {
                                    isActive: true,
                                    isDeleted: false,
                                },
                            },
                            stageProgresses: {
                                where: {
                                    isDeleted: false,
                                },
                            },
                        },
                    },
                },
            },
        },
    });
    return [...portals]
        .sort((left, right) => {
        const leftOrder = getPortalOrderIndex(left.portalKey);
        const rightOrder = getPortalOrderIndex(right.portalKey);
        if (leftOrder !== rightOrder) {
            return leftOrder - rightOrder;
        }
        return left.portalName.localeCompare(right.portalName);
    })
        .map(toPortalResponse);
};
const getNextStageOrder = async (onboardingPortalTemplateId, programType) => {
    const latest = await prismaFlowly.onboardingStageTemplate.findFirst({
        where: {
            onboardingPortalTemplateId,
            programType,
            isDeleted: false,
        },
        orderBy: [{ stageOrder: "desc" }, { createdAt: "desc" }],
        select: {
            stageOrder: true,
        },
    });
    return Number(latest?.stageOrder ?? 0) + 1;
};
const buildStageCode = async (onboardingPortalTemplateId, programType, stageOrder) => {
    const existingRows = await prismaFlowly.onboardingStageTemplate.findMany({
        where: {
            onboardingPortalTemplateId,
            programType,
            isDeleted: false,
        },
        select: {
            stageCode: true,
        },
    });
    const existingCodes = new Set(existingRows.map((row) => normalizeUpper(row.stageCode)));
    const prefix = programType === PROGRAM_TYPE_LEARNING ? "LEARNING_STAGE" : "STAGE";
    let candidate = `${prefix}_${stageOrder}`;
    let suffix = 2;
    while (existingCodes.has(candidate)) {
        candidate = `${prefix}_${stageOrder}_${suffix}`;
        suffix += 1;
    }
    return candidate;
};
export class OnboardingStageService {
    static async list(requesterId) {
        await ensureAdminAccess(requesterId);
        return {
            portals: await listPortalTemplates(),
        };
    }
    static async listCustomerLearningStages(request = {}) {
        const programType = normalizeProgramType(request.programType, PROGRAM_TYPE_ONBOARDING);
        const customerProgramAccessPromise = request.bypassProgramFilter
            ? Promise.resolve({
                pretail: null,
                indomata: null,
                bypassProgramFilter: true,
                canAccessPos: true,
                canAccessIndomata: true,
            })
            : getCustomerProgramAccess(request.custId);
        const [portalTemplate, sourceMaterials, customerProgramAccess] = await Promise.all([
            prismaFlowly.onboardingPortalTemplate.findFirst({
                where: {
                    portalKey: CUSTOMER_PORTAL_KEY,
                    isActive: true,
                    isDeleted: false,
                },
                include: {
                    stageTemplates: {
                        where: {
                            programType,
                            isActive: true,
                            isDeleted: false,
                        },
                        orderBy: [{ stageOrder: "asc" }, { createdAt: "asc" }],
                        include: {
                            stageMaterials: {
                                where: {
                                    isActive: true,
                                    isDeleted: false,
                                },
                                orderBy: [{ orderIndex: "asc" }, { createdAt: "asc" }],
                                select: {
                                    onboardingStageMaterialId: true,
                                    materiId: true,
                                    orderIndex: true,
                                    isRequired: true,
                                    note: true,
                                },
                            },
                        },
                    },
                },
            }),
            OnboardingMaterialService.listSourceMaterials(),
            customerProgramAccessPromise,
        ]);
        if (!portalTemplate) {
            return {
                portal: null,
                stages: [],
            };
        }
        const sourceMaterialMap = new Map(sourceMaterials.map((material) => [material.materialId, material]));
        const accessibleStageTemplates = portalTemplate.stageTemplates.filter((stageTemplate) => canAccessCustomerLearningStage(stageTemplate.stageOrder, customerProgramAccess));
        const runtime = request.bypassProgramFilter
            ? null
            : await ensureCustomerLearningRuntime({
                custId: request.custId,
                programType,
                portalTemplate,
                stageTemplates: accessibleStageTemplates,
            });
        const stages = accessibleStageTemplates
            .map((stageTemplate) => {
            const stageProgress = runtime?.stageProgressByTemplateId.get(stageTemplate.onboardingStageTemplateId) ?? null;
            const materials = stageTemplate.stageMaterials.map((stageMaterial) => {
                const sourceMaterial = sourceMaterialMap.get(stageMaterial.materiId);
                const selectedFileIds = parseSelectedMaterialFileIds(stageMaterial.note);
                const files = filterCustomerMaterialFiles(sourceMaterial?.files ?? [], selectedFileIds).map((file) => {
                    const materialProgress = stageProgress
                        ? runtime?.materialProgressByKey.get(buildMaterialProgressKey(stageProgress.onboardingStageProgressId, stageMaterial.onboardingStageMaterialId, normalizeSourceFileId(file.id))) ?? null
                        : null;
                    return {
                        id: file.id,
                        title: file.title,
                        fileName: file.fileName,
                        url: file.url,
                        fileType: file.fileType,
                        onboardingMaterialProgressId: materialProgress?.onboardingMaterialProgressId ?? null,
                        status: materialProgress?.status ?? "NOT_STARTED",
                        readAt: materialProgress?.readAt ?? null,
                        lastReadAt: materialProgress?.lastReadAt ?? null,
                        completedAt: materialProgress?.completedAt ?? null,
                        openCount: materialProgress?.openCount ?? 0,
                    };
                });
                const status = deriveMaterialStatus(files);
                return {
                    onboardingStageMaterialId: stageMaterial.onboardingStageMaterialId,
                    onboardingAssignmentId: runtime?.onboardingAssignmentId ?? null,
                    onboardingStageProgressId: stageProgress?.onboardingStageProgressId ?? null,
                    materialId: stageMaterial.materiId,
                    materialCode: normalizeOptionalText(sourceMaterial?.materialCode) ??
                        `MATERI-${stageMaterial.materiId}`,
                    materialTitle: normalizeOptionalText(sourceMaterial?.materialTitle) ??
                        `Materi ${stageMaterial.materiId}`,
                    materialDescription: normalizeOptionalText(sourceMaterial?.materialDescription),
                    isRequired: stageMaterial.isRequired,
                    orderIndex: stageMaterial.orderIndex,
                    fileCount: files.length,
                    firstFileUrl: files.find((file) => Boolean(file.url))?.url ?? null,
                    status,
                    readAt: earliestDate(files.map((file) => file.readAt)),
                    lastReadAt: latestDate(files.map((file) => file.lastReadAt)),
                    completedAt: status === "COMPLETED"
                        ? latestDate(files.map((file) => file.completedAt))
                        : null,
                    openCount: files.reduce((sum, file) => sum + Number(file.openCount ?? 0), 0),
                    files,
                };
            });
            return {
                onboardingStageTemplateId: stageTemplate.onboardingStageTemplateId,
                onboardingStageProgressId: stageProgress?.onboardingStageProgressId ?? null,
                programType,
                stageOrder: stageTemplate.stageOrder,
                stageCode: stageTemplate.stageCode,
                stageName: stageTemplate.stageName,
                stageDescription: normalizeOptionalText(stageTemplate.stageDescription),
                materialCount: materials.length,
                firstMaterialUrl: materials.find((material) => Boolean(material.firstFileUrl))
                    ?.firstFileUrl ?? null,
                materials,
            };
        });
        return {
            portal: {
                onboardingPortalTemplateId: portalTemplate.onboardingPortalTemplateId,
                portalKey: portalTemplate.portalKey,
                portalName: portalTemplate.portalName,
                programType,
            },
            stages,
        };
    }
    static async authorizeCustomerLearningFileAccess(request) {
        const programType = normalizeProgramType(request.programType, PROGRAM_TYPE_ONBOARDING);
        const onboardingStageMaterialId = normalizeOptionalText(request.onboardingStageMaterialId);
        if (!onboardingStageMaterialId) {
            throw new ResponseError(400, "Materi onboarding tidak valid");
        }
        if (request.bypassProgramFilter) {
            const stageMaterial = await prismaFlowly.onboardingStageMaterial.findFirst({
                where: {
                    onboardingStageMaterialId,
                    isDeleted: false,
                    isActive: true,
                    stageTemplate: {
                        programType,
                        isDeleted: false,
                        isActive: true,
                        portalTemplate: {
                            portalKey: CUSTOMER_PORTAL_KEY,
                            isDeleted: false,
                            isActive: true,
                        },
                    },
                },
                select: {
                    onboardingStageMaterialId: true,
                    onboardingStageTemplateId: true,
                    materiId: true,
                    note: true,
                },
            });
            if (!stageMaterial) {
                throw new ResponseError(404, "Materi onboarding tidak ditemukan");
            }
            return {
                onboardingStageTemplateId: stageMaterial.onboardingStageTemplateId,
                onboardingStageMaterialId: stageMaterial.onboardingStageMaterialId,
                materialId: stageMaterial.materiId,
                sourceFile: await ensureCustomerLearningSourceFile(request, stageMaterial),
            };
        }
        const participantReferenceId = normalizeOptionalText(request.custId);
        if (!participantReferenceId) {
            throw new ResponseError(401, "Unauthorized");
        }
        const onboardingAssignmentId = normalizeOptionalText(request.onboardingAssignmentId);
        const onboardingStageProgressId = normalizeOptionalText(request.onboardingStageProgressId);
        if (!onboardingAssignmentId || !onboardingStageProgressId) {
            throw new ResponseError(400, "Data akses materi tidak lengkap");
        }
        const stageProgress = await prismaFlowly.onboardingStageProgress.findFirst({
            where: {
                onboardingStageProgressId,
                onboardingAssignmentId,
                isDeleted: false,
                isActive: true,
            },
            include: {
                assignment: {
                    select: {
                        portalKey: true,
                        programType: true,
                        participantReferenceType: true,
                        participantReferenceId: true,
                    },
                },
            },
        });
        if (!stageProgress) {
            throw new ResponseError(404, "Tahap onboarding tidak ditemukan");
        }
        if (normalizeUpper(stageProgress.assignment.portalKey) !== CUSTOMER_PORTAL_KEY ||
            normalizeUpper(stageProgress.assignment.participantReferenceType) !==
                CUSTOMER_PARTICIPANT_REFERENCE_TYPE ||
            stageProgress.assignment.participantReferenceId !== participantReferenceId ||
            normalizeProgramType(stageProgress.assignment.programType) !== programType) {
            throw new ResponseError(403, "Anda tidak memiliki akses ke materi ini");
        }
        const customerProgramAccess = await getCustomerProgramAccess(participantReferenceId);
        if (!canAccessCustomerLearningStage(stageProgress.stageOrder, customerProgramAccess)) {
            throw new ResponseError(403, "Anda tidak memiliki akses ke materi ini");
        }
        if (normalizeUpper(stageProgress.status) === "LOCKED") {
            throw new ResponseError(403, "Tahap onboarding ini belum aktif untuk dibaca");
        }
        const stageMaterial = await prismaFlowly.onboardingStageMaterial.findFirst({
            where: {
                onboardingStageMaterialId,
                isDeleted: false,
                isActive: true,
                stageTemplate: {
                    programType,
                    isDeleted: false,
                    isActive: true,
                    portalTemplate: {
                        portalKey: CUSTOMER_PORTAL_KEY,
                        isDeleted: false,
                        isActive: true,
                    },
                },
            },
            select: {
                onboardingStageMaterialId: true,
                onboardingStageTemplateId: true,
                materiId: true,
                note: true,
                stageTemplate: {
                    select: {
                        stageOrder: true,
                    },
                },
            },
        });
        if (!stageMaterial || stageMaterial.stageTemplate.stageOrder !== stageProgress.stageOrder) {
            throw new ResponseError(404, "Materi onboarding tidak ditemukan");
        }
        return {
            onboardingStageTemplateId: stageMaterial.onboardingStageTemplateId,
            onboardingStageMaterialId: stageMaterial.onboardingStageMaterialId,
            materialId: stageMaterial.materiId,
            sourceFile: await ensureCustomerLearningSourceFile(request, stageMaterial),
        };
    }
    static async recordCustomerLearningFileOpen(custId, request) {
        const participantReferenceId = normalizeOptionalText(custId);
        if (!participantReferenceId) {
            throw new ResponseError(401, "Unauthorized");
        }
        const onboardingAssignmentId = normalizeOptionalText(request.onboardingAssignmentId);
        const onboardingStageProgressId = normalizeOptionalText(request.onboardingStageProgressId);
        const onboardingStageMaterialId = normalizeOptionalText(request.onboardingStageMaterialId);
        const programType = normalizeProgramType(request.programType, PROGRAM_TYPE_ONBOARDING);
        if (!onboardingAssignmentId ||
            !onboardingStageProgressId ||
            !onboardingStageMaterialId) {
            throw new ResponseError(400, "Data tracking materi tidak lengkap");
        }
        const sourceFileId = normalizeSourceFileId(request.sourceFileId);
        await OnboardingStageService.authorizeCustomerLearningFileAccess({
            ...request,
            custId: participantReferenceId,
            bypassProgramFilter: false,
            sourceFileId,
        });
        const now = new Date();
        const actorId = toAuditActor(participantReferenceId);
        const createMaterialProgressId = await generateOnboardingMaterialProgressId();
        return prismaFlowly.$transaction(async (tx) => {
            const stageProgress = await tx.onboardingStageProgress.findFirst({
                where: {
                    onboardingStageProgressId,
                    onboardingAssignmentId,
                    isDeleted: false,
                    isActive: true,
                },
                include: {
                    assignment: {
                        select: {
                            onboardingAssignmentId: true,
                            portalKey: true,
                            programType: true,
                            participantReferenceType: true,
                            participantReferenceId: true,
                            currentStageOrder: true,
                            status: true,
                        },
                    },
                },
            });
            if (!stageProgress) {
                throw new ResponseError(404, "Tahap onboarding tidak ditemukan");
            }
            if (normalizeUpper(stageProgress.assignment.portalKey) !==
                CUSTOMER_PORTAL_KEY ||
                normalizeUpper(stageProgress.assignment.participantReferenceType) !==
                    CUSTOMER_PARTICIPANT_REFERENCE_TYPE ||
                stageProgress.assignment.participantReferenceId !== participantReferenceId ||
                normalizeProgramType(stageProgress.assignment.programType) !== programType) {
                throw new ResponseError(403, "Anda tidak memiliki akses ke materi ini");
            }
            if (normalizeUpper(stageProgress.status) === "LOCKED") {
                throw new ResponseError(403, "Tahap onboarding ini belum aktif untuk dibaca");
            }
            const stageMaterial = await tx.onboardingStageMaterial.findFirst({
                where: {
                    onboardingStageMaterialId,
                    isDeleted: false,
                    isActive: true,
                    stageTemplate: {
                        programType,
                        isDeleted: false,
                        isActive: true,
                        portalTemplate: {
                            portalKey: CUSTOMER_PORTAL_KEY,
                            isDeleted: false,
                            isActive: true,
                        },
                    },
                },
                select: {
                    onboardingStageMaterialId: true,
                    materiId: true,
                    stageTemplate: {
                        select: {
                            stageOrder: true,
                        },
                    },
                },
            });
            if (!stageMaterial || stageMaterial.stageTemplate.stageOrder !== stageProgress.stageOrder) {
                throw new ResponseError(404, "Materi onboarding tidak ditemukan");
            }
            const finalStageStatus = !stageProgress.startedAt ||
                normalizeUpper(stageProgress.status) === "PENDING" ||
                normalizeUpper(stageProgress.status) === "NOT_STARTED"
                ? "READING"
                : stageProgress.status;
            if (!stageProgress.startedAt ||
                finalStageStatus !== stageProgress.status) {
                await tx.onboardingStageProgress.update({
                    where: {
                        onboardingStageProgressId: stageProgress.onboardingStageProgressId,
                    },
                    data: {
                        startedAt: stageProgress.startedAt ?? now,
                        status: finalStageStatus,
                        updatedBy: actorId,
                    },
                });
            }
            if (stageProgress.assignment.currentStageOrder === null ||
                stageProgress.stageOrder > stageProgress.assignment.currentStageOrder) {
                await tx.onboardingAssignment.update({
                    where: {
                        onboardingAssignmentId: stageProgress.assignment.onboardingAssignmentId,
                    },
                    data: {
                        currentStageOrder: stageProgress.stageOrder,
                        updatedBy: actorId,
                    },
                });
            }
            const existingProgress = await tx.onboardingMaterialProgress.findUnique({
                where: {
                    onboardingStageProgressId_onboardingStageMaterialId_sourceFileId: {
                        onboardingStageProgressId: stageProgress.onboardingStageProgressId,
                        onboardingStageMaterialId: stageMaterial.onboardingStageMaterialId,
                        sourceFileId,
                    },
                },
            });
            const materialProgress = existingProgress
                ? await tx.onboardingMaterialProgress.update({
                    where: {
                        onboardingMaterialProgressId: existingProgress.onboardingMaterialProgressId,
                    },
                    data: {
                        fileName: normalizeOptionalText(request.fileName) ??
                            existingProgress.fileName,
                        fileTitle: normalizeOptionalText(request.fileTitle) ??
                            existingProgress.fileTitle,
                        status: normalizeUpper(existingProgress.status) === "COMPLETED"
                            ? existingProgress.status
                            : "READING",
                        readAt: existingProgress.readAt ?? now,
                        lastReadAt: now,
                        openCount: {
                            increment: 1,
                        },
                        updatedBy: actorId,
                    },
                })
                : await tx.onboardingMaterialProgress.create({
                    data: {
                        onboardingMaterialProgressId: createMaterialProgressId(),
                        onboardingAssignmentId: stageProgress.onboardingAssignmentId,
                        onboardingStageProgressId: stageProgress.onboardingStageProgressId,
                        onboardingStageMaterialId: stageMaterial.onboardingStageMaterialId,
                        materiId: stageMaterial.materiId,
                        sourceFileId,
                        fileName: normalizeOptionalText(request.fileName),
                        fileTitle: normalizeOptionalText(request.fileTitle),
                        status: "READING",
                        readAt: now,
                        lastReadAt: now,
                        completedAt: null,
                        openCount: 1,
                        note: null,
                        isActive: true,
                        isDeleted: false,
                        createdAt: now,
                        createdBy: actorId,
                        updatedAt: now,
                        updatedBy: actorId,
                        deletedAt: null,
                        deletedBy: null,
                    },
                });
            return {
                tracked: true,
                onboardingMaterialProgressId: materialProgress.onboardingMaterialProgressId,
                onboardingAssignmentId: stageProgress.onboardingAssignmentId,
                onboardingStageProgressId: stageProgress.onboardingStageProgressId,
                onboardingStageMaterialId: stageMaterial.onboardingStageMaterialId,
                sourceFileId,
                status: materialProgress.status,
                stageStatus: finalStageStatus,
                readAt: materialProgress.readAt,
                lastReadAt: materialProgress.lastReadAt,
                openCount: materialProgress.openCount,
            };
        });
    }
    static async create(requesterId, request) {
        await ensureAdminAccess(requesterId);
        const validated = Validation.validate(OnboardingStageValidation.CREATE_STAGE, request);
        const programType = normalizeProgramType(validated.programType);
        const portalTemplate = await prismaFlowly.onboardingPortalTemplate.findFirst({
            where: {
                onboardingPortalTemplateId: validated.onboardingPortalTemplateId,
                isDeleted: false,
                isActive: true,
            },
            select: {
                onboardingPortalTemplateId: true,
            },
        });
        if (!portalTemplate) {
            throw new ResponseError(404, "Portal onboarding tidak ditemukan");
        }
        const now = new Date();
        const stageOrder = await getNextStageOrder(portalTemplate.onboardingPortalTemplateId, programType);
        const stageCode = await buildStageCode(portalTemplate.onboardingPortalTemplateId, programType, stageOrder);
        const makeStageId = await generateOnboardingStageTemplateId();
        const created = await prismaFlowly.onboardingStageTemplate.create({
            data: {
                onboardingStageTemplateId: makeStageId(),
                onboardingPortalTemplateId: portalTemplate.onboardingPortalTemplateId,
                programType,
                stageOrder,
                stageCode,
                stageName: validated.stageName.trim(),
                stageDescription: normalizeOptionalText(validated.stageDescription),
                isActive: true,
                isDeleted: false,
                createdAt: now,
                createdBy: requesterId,
                updatedAt: now,
                updatedBy: requesterId,
            },
            select: {
                onboardingStageTemplateId: true,
            },
        });
        await OnboardingEmployeeScheduleSyncService.syncStageByTemplateId(created.onboardingStageTemplateId);
        return {
            onboardingStageTemplateId: created.onboardingStageTemplateId,
            message: "Tahap onboarding berhasil ditambahkan",
        };
    }
    static async update(requesterId, request) {
        await ensureAdminAccess(requesterId);
        const validated = Validation.validate(OnboardingStageValidation.UPDATE_STAGE, request);
        const existing = await prismaFlowly.onboardingStageTemplate.findFirst({
            where: {
                onboardingStageTemplateId: validated.onboardingStageTemplateId,
                isDeleted: false,
            },
            select: {
                onboardingStageTemplateId: true,
                isActive: true,
                _count: {
                    select: {
                        stageProgresses: {
                            where: {
                                isDeleted: false,
                            },
                        },
                    },
                },
            },
        });
        if (!existing) {
            throw new ResponseError(404, "Tahap onboarding tidak ditemukan");
        }
        if (validated.isActive === false &&
            existing._count.stageProgresses > 0) {
            throw new ResponseError(400, "Tahap sudah dipakai peserta onboarding, tidak bisa dinonaktifkan");
        }
        const data = {
            updatedAt: new Date(),
            updatedBy: requesterId,
        };
        if (validated.stageName !== undefined) {
            data.stageName = validated.stageName.trim();
        }
        if (validated.stageDescription !== undefined) {
            data.stageDescription = normalizeOptionalText(validated.stageDescription);
        }
        if (validated.isActive !== undefined) {
            data.isActive = validated.isActive;
        }
        await prismaFlowly.onboardingStageTemplate.update({
            where: {
                onboardingStageTemplateId: existing.onboardingStageTemplateId,
            },
            data,
        });
        await OnboardingEmployeeScheduleSyncService.syncStageByTemplateId(existing.onboardingStageTemplateId);
        return {
            onboardingStageTemplateId: existing.onboardingStageTemplateId,
            message: "Tahap onboarding berhasil diperbarui",
        };
    }
    static async delete(requesterId, request) {
        await ensureAdminAccess(requesterId);
        const validated = Validation.validate(OnboardingStageValidation.DELETE_STAGE, request);
        const existing = await prismaFlowly.onboardingStageTemplate.findFirst({
            where: {
                onboardingStageTemplateId: validated.onboardingStageTemplateId,
                isDeleted: false,
            },
            select: {
                onboardingStageTemplateId: true,
                _count: {
                    select: {
                        stageProgresses: {
                            where: {
                                isDeleted: false,
                            },
                        },
                    },
                },
            },
        });
        if (!existing) {
            throw new ResponseError(404, "Tahap onboarding tidak ditemukan");
        }
        if (existing._count.stageProgresses > 0) {
            throw new ResponseError(400, "Tahap sudah dipakai peserta onboarding, tidak bisa dihapus");
        }
        const now = new Date();
        await prismaFlowly.$transaction(async (tx) => {
            await tx.onboardingStageMaterial.updateMany({
                where: {
                    onboardingStageTemplateId: existing.onboardingStageTemplateId,
                    isDeleted: false,
                },
                data: {
                    isActive: false,
                    isDeleted: true,
                    deletedAt: now,
                    deletedBy: requesterId,
                    updatedAt: now,
                    updatedBy: requesterId,
                },
            });
            await tx.onboardingStageExam.updateMany({
                where: {
                    onboardingStageTemplateId: existing.onboardingStageTemplateId,
                    isDeleted: false,
                },
                data: {
                    isActive: false,
                    isDeleted: true,
                    deletedAt: now,
                    deletedBy: requesterId,
                    updatedAt: now,
                    updatedBy: requesterId,
                },
            });
            await tx.onboardingStageTemplate.update({
                where: {
                    onboardingStageTemplateId: existing.onboardingStageTemplateId,
                },
                data: {
                    isActive: false,
                    isDeleted: true,
                    deletedAt: now,
                    deletedBy: requesterId,
                    updatedAt: now,
                    updatedBy: requesterId,
                },
            });
        });
        return {
            onboardingStageTemplateId: existing.onboardingStageTemplateId,
            message: "Tahap onboarding berhasil dihapus",
        };
    }
}
//# sourceMappingURL=onboarding-stage-service.js.map