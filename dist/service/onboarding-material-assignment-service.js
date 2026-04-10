import { prismaEmployee, prismaFlowly } from "../application/database.js";
import { ResponseError } from "../error/response-error.js";
import { getAccessContext } from "../utils/access-scope.js";
import { OnboardingMaterialAssignmentValidation } from "../validation/onboarding-material-assignment-validation.js";
import { Validation } from "../validation/validation.js";
const normalizeUpper = (value) => {
    const trimmed = value?.trim();
    return trimmed ? trimmed.toUpperCase() : null;
};
const normalizeSearchText = (value) => {
    const trimmed = value?.trim().toLowerCase();
    return trimmed || null;
};
const stageLabel = (stageNumber) => `Tahap ${stageNumber}`;
const createEmptySummary = () => ({
    uniqueMaterials: 0,
    totalAssignments: 0,
    multiPortalMaterials: 0,
    activePortals: 0,
});
const includesTerm = (value, term) => (value ?? "").toLowerCase().includes(term);
export class OnboardingMaterialAssignmentService {
    static async list(requesterId, reqQuery) {
        const request = Validation.validate(OnboardingMaterialAssignmentValidation.LIST, reqQuery);
        const accessContext = await getAccessContext(requesterId);
        if (!accessContext.isAdmin) {
            throw new ResponseError(403, "Only administrator can read onboarding material assignments");
        }
        const portalKey = normalizeUpper(request.portalKey);
        let portalMasAccessId = null;
        if (portalKey) {
            const portal = await prismaFlowly.masterAccessRole.findUnique({
                where: {
                    resourceType_resourceKey: {
                        resourceType: "PORTAL",
                        resourceKey: portalKey,
                    },
                },
                select: {
                    masAccessId: true,
                },
            });
            if (!portal?.masAccessId) {
                return {
                    data: [],
                    summary: createEmptySummary(),
                };
            }
            portalMasAccessId = portal.masAccessId;
        }
        const assignments = await prismaFlowly.onboardingMaterialAssignment.findMany({
            where: {
                isDeleted: false,
                isActive: true,
                ...(portalMasAccessId ? { portalMasAccessId } : {}),
                ...(request.stageNumber ? { stageNumber: request.stageNumber } : {}),
            },
            include: {
                portal: {
                    select: {
                        resourceKey: true,
                        displayName: true,
                        orderIndex: true,
                    },
                },
            },
            orderBy: [
                { stageNumber: "asc" },
                { orderIndex: "asc" },
                { employeeMaterialId: "asc" },
            ],
        });
        if (assignments.length === 0) {
            return {
                data: [],
                summary: createEmptySummary(),
            };
        }
        const materialIds = [...new Set(assignments.map((item) => item.employeeMaterialId))];
        const [materials, sharedPortalCounts] = await Promise.all([
            prismaEmployee.em_materi1.findMany({
                where: {
                    id: { in: materialIds },
                },
                select: {
                    id: true,
                    kode_materi: true,
                    judul_materi: true,
                    deskripsi_materi: true,
                    urutan: true,
                    global_sequence: true,
                    status: true,
                    em_materi2: {
                        select: {
                            em_materi_type: {
                                select: {
                                    materi_name: true,
                                },
                            },
                        },
                    },
                    em_materi_file: {
                        orderBy: [{ urutan: "asc" }, { id: "asc" }],
                        select: {
                            id: true,
                            judul: true,
                            file_name: true,
                            url: true,
                            urutan: true,
                        },
                    },
                },
            }),
            prismaFlowly.onboardingMaterialAssignment.groupBy({
                by: ["employeeMaterialId"],
                where: {
                    isDeleted: false,
                    isActive: true,
                    employeeMaterialId: { in: materialIds },
                },
                _count: {
                    portalMasAccessId: true,
                },
            }),
        ]);
        const materialMap = new Map(materials.map((material) => [material.id, material]));
        const sharedPortalCountMap = new Map(sharedPortalCounts.map((item) => [
            item.employeeMaterialId,
            item._count.portalMasAccessId,
        ]));
        const searchTerm = normalizeSearchText(request.q);
        const includeFiles = request.includeFiles ?? true;
        const rows = assignments.reduce((items, assignment) => {
            const material = materialMap.get(assignment.employeeMaterialId);
            if (!material) {
                return items;
            }
            const materialTypes = [...new Set(material.em_materi2
                    .map((item) => item.em_materi_type?.materi_name?.trim() ?? "")
                    .filter(Boolean))];
            const files = includeFiles
                ? material.em_materi_file.map((file) => ({
                    id: file.id,
                    title: file.judul ?? null,
                    fileName: file.file_name,
                    url: file.url ?? null,
                    orderIndex: file.urutan ?? null,
                }))
                : [];
            items.push({
                assignmentId: assignment.onboardingMaterialAssignmentId,
                employeeMaterialId: material.id,
                materialCode: material.kode_materi,
                materialTitle: material.judul_materi,
                materialDescription: material.deskripsi_materi ?? null,
                materialStatus: material.status ?? null,
                materialSequence: material.global_sequence ?? material.urutan ?? null,
                materialTypes,
                fileCount: material.em_materi_file.length,
                files,
                portalKey: assignment.portal.resourceKey,
                portalLabel: assignment.portal.displayName,
                portalOrderIndex: assignment.portal.orderIndex,
                stageNumber: assignment.stageNumber,
                stageLabel: stageLabel(assignment.stageNumber),
                orderIndex: assignment.orderIndex,
                isRequired: assignment.isRequired,
                assignmentNote: assignment.assignmentNote ?? null,
                sharedPortalCount: sharedPortalCountMap.get(assignment.employeeMaterialId) ?? 1,
            });
            return items;
        }, []);
        const filteredRows = searchTerm
            ? rows.filter((row) => {
                const searchableValues = [
                    row.materialCode,
                    row.materialTitle,
                    row.materialDescription,
                    row.portalLabel,
                    row.portalKey,
                    row.stageLabel,
                    row.assignmentNote,
                    row.materialTypes.join(" "),
                    row.files.map((file) => file.title ?? file.fileName).join(" "),
                ];
                return searchableValues.some((value) => includesTerm(value, searchTerm));
            })
            : rows;
        const sortedRows = [...filteredRows].sort((left, right) => {
            if (left.portalOrderIndex !== right.portalOrderIndex) {
                return left.portalOrderIndex - right.portalOrderIndex;
            }
            if (left.stageNumber !== right.stageNumber) {
                return left.stageNumber - right.stageNumber;
            }
            if (left.orderIndex !== right.orderIndex) {
                return left.orderIndex - right.orderIndex;
            }
            if ((left.materialSequence ?? 0) !== (right.materialSequence ?? 0)) {
                return (left.materialSequence ?? 0) - (right.materialSequence ?? 0);
            }
            return left.materialTitle.localeCompare(right.materialTitle);
        });
        const summary = {
            uniqueMaterials: new Set(sortedRows.map((row) => row.employeeMaterialId)).size,
            totalAssignments: sortedRows.length,
            multiPortalMaterials: new Set(sortedRows
                .filter((row) => row.sharedPortalCount > 1)
                .map((row) => row.employeeMaterialId)).size,
            activePortals: new Set(sortedRows.map((row) => row.portalKey)).size,
        };
        return {
            data: sortedRows,
            summary,
        };
    }
}
//# sourceMappingURL=onboarding-material-assignment-service.js.map