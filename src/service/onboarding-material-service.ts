import { prismaEmployee, prismaFlowly } from "../application/database.js";
import { ResponseError } from "../error/response-error.js";
import { generateOnboardingStageMaterialId } from "../utils/id-generator.js";
import { getAccessContext } from "../utils/access-scope.js";
import { Validation } from "../validation/validation.js";
import { OnboardingMaterialValidation } from "../validation/onboarding-material-validation.js";

type OnboardingMaterialSourceFile = {
  id: number;
  title: string | null;
  fileName: string;
  url: string | null;
  orderIndex: number | null;
  fileType: number | null;
};

type OnboardingMaterialSource = {
  materialId: number;
  materialCode: string;
  materialTitle: string;
  materialDescription: string | null;
  materialTypes: string[];
  materialSequence: number | null;
  stageNumber: number;
  orderIndex: number;
  portalKeys: string[];
  assignmentNote: string | null;
  files: OnboardingMaterialSourceFile[];
};

type MaterialFileRow = {
  materialId: number;
  materialCode: string;
  materialTitle: string;
  materialDescription: string | null;
  materialSequence: number | null;
  categoryName: string | null;
  fileId: number | null;
  fileTitle: string | null;
  fileName: string | null;
  fileUrl: string | null;
  fileOrderIndex: number | null;
  fileType: number | null;
  fileTypeName: string | null;
};

type MaterialTypeRow = {
  materialId: number;
  typeName: string | null;
};

type OnboardingMaterialPortalStageResponse = {
  onboardingStageTemplateId: string;
  stageNumber: number;
  stageLabel: string;
  stageTitle: string;
};

type OnboardingMaterialPortalResponse = {
  onboardingPortalTemplateId: string;
  portalKey: string;
  portalLabel: string;
  portalOrderIndex: number;
  stages: OnboardingMaterialPortalStageResponse[];
};

  type OnboardingMaterialAssignmentResponse = {
  assignmentId: string;
  onboardingStageTemplateId: string;
  employeeMaterialId: number;
  materialCode: string;
  materialTitle: string;
  materialDescription: string | null;
  materialStatus: string | null;
  materialSequence: number | null;
  materialTypes: string[];
  fileCount: number;
  totalFileCount: number;
  selectedFileIds: number[];
  fileSelectionMode: "ALL" | "SELECTED";
  files: OnboardingMaterialSourceFile[];
  portalKey: string;
  portalLabel: string;
  portalOrderIndex: number;
  stageNumber: number;
  stageLabel: string;
  orderIndex: number;
  isRequired: boolean;
  assignmentNote: string | null;
  sharedPortalCount: number;
};

type ListOnboardingMaterialAssignmentsResponse = {
  portals: OnboardingMaterialPortalResponse[];
  assignments: OnboardingMaterialAssignmentResponse[];
};

type CreateOnboardingStageMaterialRequest = {
  onboardingStageTemplateId: string;
  materiId: number;
  selectedFileIds?: number[];
  isRequired?: boolean;
};

type DeleteOnboardingStageMaterialRequest = {
  onboardingStageMaterialId: string;
};

type MaterialSelectionMetadata = {
  mode: "ALL" | "SELECTED";
  selectedFileIds: number[];
  rawNote: string | null;
};

const ONBOARDING_ADMIN_PORTAL_KEYS = [
  "EMPLOYEE",
  "SUPPLIER",
  "CUSTOMER",
  "AFFILIATE",
  "INFLUENCER",
  "COMMUNITY",
] as const;

const PORTAL_ORDER_MAP = new Map<string, number>(
  ONBOARDING_ADMIN_PORTAL_KEYS.map((portalKey, index) => [portalKey, (index + 1) * 10])
);

const normalizeOptionalText = (value: string | null | undefined) => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
};

const normalizeUpper = (value: string) => value.trim().toUpperCase();

const createFileDedupKey = (row: MaterialFileRow) =>
  [
    normalizeOptionalText(row.fileTitle) ?? "",
    normalizeOptionalText(row.fileName) ?? "",
    normalizeOptionalText(row.fileUrl) ?? "",
    row.fileOrderIndex ?? "",
  ].join("|");

const ensureAdminAccess = async (requesterId: string) => {
  const accessContext = await getAccessContext(requesterId);
  if (!accessContext.isAdmin) {
    throw new ResponseError(403, "Admin access required");
  }
};

const getPortalOrderIndex = (portalKey: string) =>
  PORTAL_ORDER_MAP.get(normalizeUpper(portalKey)) ?? 999;

const parseSelectionMetadata = (
  note: string | null | undefined
): MaterialSelectionMetadata => {
  const normalizedNote = normalizeOptionalText(note);
  if (!normalizedNote) {
    return {
      mode: "ALL",
      selectedFileIds: [],
      rawNote: null,
    };
  }

  try {
    const parsed = JSON.parse(normalizedNote) as {
      mode?: unknown;
      selectedFileIds?: unknown;
    };

    const selectedFileIds = Array.isArray(parsed?.selectedFileIds)
      ? Array.from(
          new Set(
            parsed.selectedFileIds
              .map((value) => Number(value))
              .filter((value) => Number.isInteger(value) && value > 0)
          )
        )
      : [];

    return {
      mode: parsed?.mode === "SELECTED" && selectedFileIds.length > 0 ? "SELECTED" : "ALL",
      selectedFileIds,
      rawNote: null,
    };
  } catch {
    return {
      mode: "ALL",
      selectedFileIds: [],
      rawNote: normalizedNote,
    };
  }
};

const filterSelectedFiles = (
  files: OnboardingMaterialSourceFile[],
  metadata: MaterialSelectionMetadata
) => {
  if (metadata.mode !== "SELECTED" || metadata.selectedFileIds.length === 0) {
    return files;
  }

  const selectedFileIds = new Set(metadata.selectedFileIds);
  const filtered = files.filter((file) => selectedFileIds.has(file.id));
  return filtered.length > 0 ? filtered : files;
};

const serializeSelectionNote = (
  sourceMaterial: OnboardingMaterialSource,
  selectedFileIds?: number[]
) => {
  if (sourceMaterial.files.length === 0) {
    return null;
  }

  if (selectedFileIds === undefined) {
    return JSON.stringify({ mode: "ALL" });
  }

  const allowedIds = new Set(sourceMaterial.files.map((file) => file.id));
  const normalizedSelectedIds = Array.from(
    new Set(
      selectedFileIds.filter(
        (value) => Number.isInteger(value) && value > 0 && allowedIds.has(value)
      )
    )
  ).sort((left, right) => left - right);

  if (normalizedSelectedIds.length === 0) {
    throw new ResponseError(400, "Pilih minimal satu file dari materi ini");
  }

  if (normalizedSelectedIds.length === sourceMaterial.files.length) {
    return JSON.stringify({ mode: "ALL" });
  }

  const payload = JSON.stringify({
    mode: "SELECTED",
    selectedFileIds: normalizedSelectedIds,
  });

  if (payload.length > 1000) {
    throw new ResponseError(400, "Pilihan file terlalu banyak untuk disimpan");
  }

  return payload;
};

const buildSourceMaterialMap = async () => {
  const sourceMaterials = await OnboardingMaterialService.listSourceMaterials();
  return new Map(sourceMaterials.map((material) => [material.materialId, material]));
};

export class OnboardingMaterialService {
  static async listSourceMaterials(): Promise<OnboardingMaterialSource[]> {
    const materialRows = await prismaEmployee.$queryRaw<MaterialFileRow[]>`
      SELECT
        m.id AS materialId,
        m.kode_materi AS materialCode,
        m.judul_materi AS materialTitle,
        m.deskripsi_materi AS materialDescription,
        m.global_sequence AS materialSequence,
        k.kategori_nama AS categoryName,
        mf.id AS fileId,
        COALESCE(
          NULLIF(LTRIM(RTRIM(gm.title)), ''),
          NULLIF(LTRIM(RTRIM(mf.judul)), '')
        ) AS fileTitle,
        COALESCE(
          NULLIF(LTRIM(RTRIM(gm.file_name)), ''),
          NULLIF(LTRIM(RTRIM(mf.file_name)), '')
        ) AS fileName,
        COALESCE(
          NULLIF(LTRIM(RTRIM(gm.url)), ''),
          NULLIF(LTRIM(RTRIM(mf.url)), '')
        ) AS fileUrl,
        COALESCE(gm.urutan, mf.urutan) AS fileOrderIndex,
        COALESCE(gm.file_type, mf.file_type) AS fileType,
        mt.materi_name AS fileTypeName
      FROM [dbo].[em_materi1] m
      LEFT JOIN [dbo].[em_materi_kategori] k
        ON k.id = m.kategori
      LEFT JOIN [dbo].[em_materi_file] mf
        ON mf.materi_id = m.id
      LEFT JOIN [dbo].[em_galeri_materi] gm
        ON gm.id = mf.galeri_id
      LEFT JOIN [dbo].[em_materi_type] mt
        ON mt.id = COALESCE(gm.file_type, mf.file_type)
      WHERE
        m.status = 'A'
        AND (gm.id IS NULL OR COALESCE(gm.status, 'A') = 'A')
      ORDER BY
        m.judul_materi ASC,
        CASE WHEN COALESCE(gm.urutan, mf.urutan) IS NULL THEN 1 ELSE 0 END ASC,
        COALESCE(gm.urutan, mf.urutan) ASC,
        COALESCE(
          NULLIF(LTRIM(RTRIM(gm.title)), ''),
          NULLIF(LTRIM(RTRIM(mf.judul)), ''),
          NULLIF(LTRIM(RTRIM(gm.file_name)), ''),
          NULLIF(LTRIM(RTRIM(mf.file_name)), ''),
          ''
        ) ASC,
        mf.id ASC
    `;

    const materialTypeRows = await prismaEmployee.$queryRaw<MaterialTypeRow[]>`
      SELECT
        m2.materi_id AS materialId,
        mt.materi_name AS typeName
      FROM [dbo].[em_materi2] m2
      INNER JOIN [dbo].[em_materi1] m
        ON m.id = m2.materi_id
      INNER JOIN [dbo].[em_materi_type] mt
        ON mt.id = m2.materi_type
      WHERE
        m.status = 'A'
        AND COALESCE(mt.status, 'A') = 'A'
      ORDER BY
        m2.materi_id ASC,
        mt.materi_name ASC
    `;

    const typeMap = new Map<number, Set<string>>();
    for (const row of materialTypeRows) {
      const typeName = normalizeOptionalText(row.typeName);
      if (!typeName) {
        continue;
      }

      const existing = typeMap.get(row.materialId) ?? new Set<string>();
      existing.add(typeName);
      typeMap.set(row.materialId, existing);
    }

    const materialMap = new Map<
      number,
      OnboardingMaterialSource & {
        fileDedupKeys: Set<string>;
        typeNames: Set<string>;
      }
    >();

    for (const row of materialRows) {
      let material = materialMap.get(row.materialId);
      if (!material) {
        const seededTypeNames = new Set<string>(typeMap.get(row.materialId) ?? []);
        material = {
          materialId: row.materialId,
          materialCode: row.materialCode,
          materialTitle: row.materialTitle,
          materialDescription: row.materialDescription,
          materialTypes: [],
          materialSequence: row.materialSequence,
          stageNumber: 0,
          orderIndex: materialMap.size * 10 + 10,
          portalKeys: [...ONBOARDING_ADMIN_PORTAL_KEYS],
          assignmentNote: normalizeOptionalText(row.categoryName)
            ? `Kategori: ${normalizeOptionalText(row.categoryName)}`
            : null,
          files: [],
          fileDedupKeys: new Set<string>(),
          typeNames: seededTypeNames,
        };
        materialMap.set(row.materialId, material);
      }

      const fileTypeName = normalizeOptionalText(row.fileTypeName);
      if (fileTypeName) {
        material.typeNames.add(fileTypeName);
      }

      const fileId = row.fileId;
      const fileName = normalizeOptionalText(row.fileName);
      const fileUrl = normalizeOptionalText(row.fileUrl);
      if (fileId === null || (!fileName && !fileUrl)) {
        continue;
      }

      const dedupKey = createFileDedupKey(row);
      if (material.fileDedupKeys.has(dedupKey)) {
        continue;
      }

      material.fileDedupKeys.add(dedupKey);
      material.files.push({
        id: fileId,
        title: normalizeOptionalText(row.fileTitle),
        fileName: fileName ?? `file-${fileId}`,
        url: fileUrl,
        orderIndex: row.fileOrderIndex,
        fileType: row.fileType,
      });
    }

    return Array.from(materialMap.values()).map((material) => {
      const files = [...material.files].sort((left, right) => {
        const leftOrder = left.orderIndex ?? Number.MAX_SAFE_INTEGER;
        const rightOrder = right.orderIndex ?? Number.MAX_SAFE_INTEGER;
        if (leftOrder !== rightOrder) {
          return leftOrder - rightOrder;
        }

        const leftLabel = (left.title ?? left.fileName).toLowerCase();
        const rightLabel = (right.title ?? right.fileName).toLowerCase();
        return leftLabel.localeCompare(rightLabel);
      });

      const materialTypes = Array.from(material.typeNames).sort((left, right) =>
        left.localeCompare(right)
      );

      return {
        materialId: material.materialId,
        materialCode: material.materialCode,
        materialTitle: material.materialTitle,
        materialDescription: material.materialDescription,
        materialTypes,
        materialSequence: material.materialSequence,
        stageNumber: material.stageNumber,
        orderIndex: material.orderIndex,
        portalKeys: material.portalKeys,
        assignmentNote: material.assignmentNote,
        files,
      };
    });
  }

  static async listAssignments(
    requesterId: string
  ): Promise<ListOnboardingMaterialAssignmentsResponse> {
    await ensureAdminAccess(requesterId);

    const [sourceMaterialMap, portalTemplates] = await Promise.all([
      buildSourceMaterialMap(),
      prismaFlowly.onboardingPortalTemplate.findMany({
        where: {
          isActive: true,
          isDeleted: false,
        },
        include: {
          stageTemplates: {
            where: {
              isActive: true,
              isDeleted: false,
            },
            orderBy: [{ stageOrder: "asc" }, { stageCode: "asc" }],
            include: {
              stageMaterials: {
                where: {
                  isActive: true,
                  isDeleted: false,
                },
                orderBy: [{ orderIndex: "asc" }, { createdAt: "asc" }],
              },
            },
          },
        },
      }),
    ]);

    const portals = [...portalTemplates]
      .sort((left, right) => {
        const leftOrder = getPortalOrderIndex(left.portalKey);
        const rightOrder = getPortalOrderIndex(right.portalKey);
        if (leftOrder !== rightOrder) {
          return leftOrder - rightOrder;
        }

        return left.portalName.localeCompare(right.portalName);
      })
      .map<OnboardingMaterialPortalResponse>((portalTemplate) => ({
        onboardingPortalTemplateId: portalTemplate.onboardingPortalTemplateId,
        portalKey: portalTemplate.portalKey,
        portalLabel: portalTemplate.portalName,
        portalOrderIndex: getPortalOrderIndex(portalTemplate.portalKey),
        stages: portalTemplate.stageTemplates.map((stageTemplate) => ({
          onboardingStageTemplateId: stageTemplate.onboardingStageTemplateId,
          stageNumber: stageTemplate.stageOrder,
          stageLabel: stageTemplate.stageName,
          stageTitle:
            normalizeOptionalText(stageTemplate.stageDescription) ??
            normalizeOptionalText(stageTemplate.stageCode) ??
            `Tahap ${stageTemplate.stageOrder}`,
        })),
      }));

    const sharedPortalMap = new Map<number, Set<string>>();
    for (const portalTemplate of portalTemplates) {
      for (const stageTemplate of portalTemplate.stageTemplates) {
        for (const stageMaterial of stageTemplate.stageMaterials) {
          const existingPortals = sharedPortalMap.get(stageMaterial.materiId) ?? new Set<string>();
          existingPortals.add(portalTemplate.portalKey);
          sharedPortalMap.set(stageMaterial.materiId, existingPortals);
        }
      }
    }

    const assignments: OnboardingMaterialAssignmentResponse[] = [];
    for (const portalTemplate of portalTemplates) {
      const portalOrderIndex = getPortalOrderIndex(portalTemplate.portalKey);

      for (const stageTemplate of portalTemplate.stageTemplates) {
        for (const stageMaterial of stageTemplate.stageMaterials) {
          const sourceMaterial = sourceMaterialMap.get(stageMaterial.materiId) ?? null;
          const selectionMetadata = parseSelectionMetadata(stageMaterial.note);
          const sourceFiles = sourceMaterial?.files ?? [];
          const selectedFiles = filterSelectedFiles(sourceFiles, selectionMetadata);

          assignments.push({
            assignmentId: stageMaterial.onboardingStageMaterialId,
            onboardingStageTemplateId: stageTemplate.onboardingStageTemplateId,
            employeeMaterialId: stageMaterial.materiId,
            materialCode: sourceMaterial?.materialCode ?? `MAT-${stageMaterial.materiId}`,
            materialTitle:
              sourceMaterial?.materialTitle ?? `Materi ${stageMaterial.materiId}`,
            materialDescription: sourceMaterial?.materialDescription ?? null,
            materialStatus: sourceMaterial ? "ACTIVE" : "MISSING_SOURCE",
            materialSequence: sourceMaterial?.materialSequence ?? null,
            materialTypes: sourceMaterial?.materialTypes ?? [],
            fileCount: selectedFiles.length,
            totalFileCount: sourceFiles.length,
            selectedFileIds:
              selectionMetadata.mode === "SELECTED"
                ? selectionMetadata.selectedFileIds
                : sourceFiles.map((file) => file.id),
            fileSelectionMode:
              selectionMetadata.mode === "SELECTED" && selectedFiles.length < sourceFiles.length
                ? "SELECTED"
                : "ALL",
            files: selectedFiles,
            portalKey: portalTemplate.portalKey,
            portalLabel: portalTemplate.portalName,
            portalOrderIndex,
            stageNumber: stageTemplate.stageOrder,
            stageLabel: stageTemplate.stageName,
            orderIndex: stageMaterial.orderIndex,
            isRequired: stageMaterial.isRequired,
            assignmentNote: selectionMetadata.rawNote ?? sourceMaterial?.assignmentNote ?? null,
            sharedPortalCount: sharedPortalMap.get(stageMaterial.materiId)?.size ?? 1,
          });
        }
      }
    }

    assignments.sort((left, right) => {
      if (left.portalOrderIndex !== right.portalOrderIndex) {
        return left.portalOrderIndex - right.portalOrderIndex;
      }
      if (left.stageNumber !== right.stageNumber) {
        return left.stageNumber - right.stageNumber;
      }
      if (left.orderIndex !== right.orderIndex) {
        return left.orderIndex - right.orderIndex;
      }
      return left.materialTitle.localeCompare(right.materialTitle);
    });

    return {
      portals,
      assignments,
    };
  }

  static async createAssignment(
    requesterId: string,
    reqBody: CreateOnboardingStageMaterialRequest
  ) {
    const request = Validation.validate(
      OnboardingMaterialValidation.CREATE_ASSIGNMENT,
      reqBody
    ) as CreateOnboardingStageMaterialRequest;

    await ensureAdminAccess(requesterId);

    const [stageTemplate, sourceMaterialMap] = await Promise.all([
      prismaFlowly.onboardingStageTemplate.findFirst({
        where: {
          onboardingStageTemplateId: request.onboardingStageTemplateId,
          isActive: true,
          isDeleted: false,
          portalTemplate: {
            isActive: true,
            isDeleted: false,
          },
        },
        include: {
          stageMaterials: {
            where: {
              isActive: true,
              isDeleted: false,
            },
            orderBy: [{ orderIndex: "desc" }],
            take: 1,
          },
        },
      }),
      buildSourceMaterialMap(),
    ]);

    if (!stageTemplate) {
      throw new ResponseError(404, "Tahap onboarding tidak ditemukan");
    }

    const sourceMaterial = sourceMaterialMap.get(request.materiId);
    if (!sourceMaterial) {
      throw new ResponseError(404, "Master materi LMS tidak ditemukan");
    }

    const existing = await prismaFlowly.onboardingStageMaterial.findFirst({
      where: {
        onboardingStageTemplateId: request.onboardingStageTemplateId,
        materiId: request.materiId,
        isDeleted: false,
      },
      select: {
        onboardingStageMaterialId: true,
        isActive: true,
        orderIndex: true,
      },
    });

    const selectionNote = serializeSelectionNote(
      sourceMaterial,
      request.selectedFileIds
    );
    const now = new Date();

    if (existing) {
      const updated = await prismaFlowly.onboardingStageMaterial.update({
        where: {
          onboardingStageMaterialId: existing.onboardingStageMaterialId,
        },
        data: {
          isRequired: request.isRequired ?? true,
          note: selectionNote,
          isActive: true,
          updatedAt: now,
          updatedBy: requesterId,
        },
        select: {
          onboardingStageMaterialId: true,
        },
      });

      return {
        onboardingStageMaterialId: updated.onboardingStageMaterialId,
        message: "Pilihan file materi onboarding berhasil diperbarui",
      };
    }

    const nextOrderIndex =
      (stageTemplate.stageMaterials[0]?.orderIndex ?? 0) + 10;
    const makeAssignmentId = await generateOnboardingStageMaterialId();

    const created = await prismaFlowly.onboardingStageMaterial.create({
      data: {
        onboardingStageMaterialId: makeAssignmentId(),
        onboardingStageTemplateId: request.onboardingStageTemplateId,
        materiId: request.materiId,
        orderIndex: nextOrderIndex,
        isRequired: request.isRequired ?? true,
        note: selectionNote,
        isActive: true,
        isDeleted: false,
        createdAt: now,
        createdBy: requesterId,
        updatedAt: now,
        updatedBy: requesterId,
      },
      select: {
        onboardingStageMaterialId: true,
      },
    });

    return {
      onboardingStageMaterialId: created.onboardingStageMaterialId,
      message: "Materi onboarding berhasil ditambahkan",
    };
  }

  static async deleteAssignment(
    requesterId: string,
    reqBody: DeleteOnboardingStageMaterialRequest
  ) {
    const request = Validation.validate(
      OnboardingMaterialValidation.DELETE_ASSIGNMENT,
      reqBody
    ) as DeleteOnboardingStageMaterialRequest;

    await ensureAdminAccess(requesterId);

    const existing = await prismaFlowly.onboardingStageMaterial.findUnique({
      where: {
        onboardingStageMaterialId: request.onboardingStageMaterialId,
      },
      select: {
        onboardingStageMaterialId: true,
        isDeleted: true,
      },
    });

    if (!existing || existing.isDeleted) {
      throw new ResponseError(404, "Materi onboarding tidak ditemukan");
    }

    const now = new Date();
    await prismaFlowly.onboardingStageMaterial.update({
      where: {
        onboardingStageMaterialId: request.onboardingStageMaterialId,
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

    return {
      message: "Materi onboarding berhasil dihapus",
    };
  }
}
