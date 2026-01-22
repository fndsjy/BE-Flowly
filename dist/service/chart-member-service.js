import { prismaFlowly, prismaEmployee } from "../application/database.js";
import { Validation } from "../validation/validation.js";
import { ChartMemberValidation } from "../validation/chart-member-validation.js";
import { ResponseError } from "../error/response-error.js";
import { getAccessContext, getModuleAccessMap, canReadModule, canCrudModule, canRead, canCrud } from "../utils/access-scope.js";
import { toChartMemberResponse } from "../model/chart-member-model.js";
import { generateChartId, generateChartMemberId } from "../utils/id-generator.js";
import { buildChanges, pickSnapshot, resolveActorType, writeAuditLog } from "../utils/audit-log.js";
const CHART_MEMBER_AUDIT_FIELDS = [
    "memberChartId",
    "chartId",
    "userId",
    "jabatan",
];
const getChartMemberSnapshot = (record) => pickSnapshot(record, CHART_MEMBER_AUDIT_FIELDS);
export class ChartMemberService {
    // static async create(requesterUserId: string, request: any) {
    //   const validated = Validation.validate(ChartMemberValidation.CREATE, request);
    //   const { chartId, userId } = validated;
    //   const requester = await prismaFlowly.user.findUnique({
    //     where: { userId: requesterUserId },
    //     include: { role: true },
    //   });
    //   if (!requester || requester.role.roleLevel !== 1)
    //     throw new ResponseError(403, "Only admin can add member chart");
    //   const chart = await prismaFlowly.chart.findUnique({
    //     where: { chartId, isDeleted: false },
    //   });
    //   if (!chart) throw new ResponseError(404, "Chart not found");
    //   const employee = await prismaEmployee.em_employee.findUnique({ where: { UserId: userId } });
    //   if (!employee) throw new ResponseError(404, "Employee not found");
    //   const memberChartId = await generateChartMemberId();
    //   const member = await prismaFlowly.chartMember.create({
    //     data: {
    //       memberChartId,
    //       chartId,
    //       userId,
    //       createdBy: requesterUserId,
    //     },
    //   });
    //   return toChartMemberResponse(member);
    // }
    static async update(requesterUserId, request) {
        const validated = Validation.validate(ChartMemberValidation.UPDATE, request);
        const { memberChartId, userId: inputUserId } = validated;
        // 📌 Cari member yang akan di-update
        const existing = await prismaFlowly.chartMember.findUnique({
            where: { memberChartId, isDeleted: false },
            select: { memberChartId: true, chartId: true, userId: true, jabatan: true }
        });
        if (!existing)
            throw new ResponseError(404, "Member Chart not found");
        const chart = await prismaFlowly.chart.findUnique({
            where: { chartId: existing.chartId, isDeleted: false },
            select: { chartId: true, pilarId: true, sbuId: true, sbuSubId: true }
        });
        if (!chart)
            throw new ResponseError(404, "Chart not found");
        const accessContext = await getAccessContext(requesterUserId);
        const moduleAccessMap = await getModuleAccessMap(requesterUserId);
        if (!accessContext.isAdmin && !canCrudModule(moduleAccessMap, "CHART_MEMBER")) {
            throw new ResponseError(403, "Module CHART_MEMBER CRUD access required");
        }
        if (!accessContext.isAdmin) {
            const hasPilarCrud = canCrud(accessContext.pilar, chart.pilarId);
            const hasSbuCrud = canCrud(accessContext.sbu, chart.sbuId);
            const hasSbuSubCrud = canCrud(accessContext.sbuSub, chart.sbuSubId);
            if (!hasPilarCrud && !hasSbuCrud && !hasSbuSubCrud) {
                throw new ResponseError(403, "SBU SUB CRUD access required");
            }
        }
        // 📌 Ambil semua slot aktif di chart yang sama (kecuali diri sendiri)
        const otherMembersInSameChart = await prismaFlowly.chartMember.findMany({
            where: {
                chartId: existing.chartId,
                memberChartId: { not: memberChartId }, // kecuali slot ini
                isDeleted: false,
                userId: { not: null } // hanya yang terisi
            },
            select: { userId: true }
        });
        // ✅ Cek duplikasi: jika inputUserId > 0 dan sudah ada di chart ini → tolak
        if (inputUserId && inputUserId > 0) {
            const isDuplicate = otherMembersInSameChart.some(m => m.userId === inputUserId);
            if (isDuplicate) {
                throw new ResponseError(400, `Pegawai sudah terisi di posisi ini. Setiap slot harus berisi pegawai yang berbeda.`);
            }
            // 🔍 Cek employee valid
            const employee = await prismaEmployee.em_employee.findUnique({
                where: { UserId: inputUserId }
            });
            if (!employee)
                throw new ResponseError(404, "Employee not found");
        }
        // ✅ Logika 0 → null
        const finalUserId = inputUserId === 0 ? null : inputUserId;
        // 💾 Simpan
        const updated = await prismaFlowly.chartMember.update({
            where: { memberChartId },
            data: {
                userId: finalUserId,
                updatedBy: requesterUserId,
                updatedAt: new Date(),
            },
        });
        const response = toChartMemberResponse(updated);
        const before = toChartMemberResponse(existing);
        const changes = buildChanges(before, response, CHART_MEMBER_AUDIT_FIELDS);
        if (changes.length > 0) {
            await writeAuditLog({
                module: "CHART_MEMBER",
                entity: "CHART_MEMBER",
                entityId: response.memberChartId,
                action: "UPDATE",
                actorId: requesterUserId,
                actorType: resolveActorType(requesterUserId),
                changes,
                meta: { chartId: response.chartId },
            });
        }
        return response;
    }
    static async softDelete(requesterUserId, request) {
        const validated = Validation.validate(ChartMemberValidation.DELETE, request);
        const { memberChartId } = validated;
        const existing = await prismaFlowly.chartMember.findUnique({
            where: { memberChartId, isDeleted: false },
        });
        if (!existing)
            throw new ResponseError(404, "Member Chart not found");
        const chart = await prismaFlowly.chart.findUnique({
            where: { chartId: existing.chartId, isDeleted: false },
            select: { chartId: true, pilarId: true, sbuId: true, sbuSubId: true }
        });
        if (!chart)
            throw new ResponseError(404, "Chart not found");
        const accessContext = await getAccessContext(requesterUserId);
        const moduleAccessMap = await getModuleAccessMap(requesterUserId);
        if (!accessContext.isAdmin && !canCrudModule(moduleAccessMap, "CHART_MEMBER")) {
            throw new ResponseError(403, "Module CHART_MEMBER CRUD access required");
        }
        if (!accessContext.isAdmin) {
            const hasPilarCrud = canCrud(accessContext.pilar, chart.pilarId);
            const hasSbuCrud = canCrud(accessContext.sbu, chart.sbuId);
            const hasSbuSubCrud = canCrud(accessContext.sbuSub, chart.sbuSubId);
            if (!hasPilarCrud && !hasSbuCrud && !hasSbuSubCrud) {
                throw new ResponseError(403, "SBU SUB CRUD access required");
            }
        }
        await prismaFlowly.chartMember.update({
            where: { memberChartId },
            data: {
                isDeleted: true,
                deletedAt: new Date(),
                deletedBy: requesterUserId,
            },
        });
        const snapshot = toChartMemberResponse(existing);
        await writeAuditLog({
            module: "CHART_MEMBER",
            entity: "CHART_MEMBER",
            entityId: snapshot.memberChartId,
            action: "DELETE",
            actorId: requesterUserId,
            actorType: resolveActorType(requesterUserId),
            snapshot: getChartMemberSnapshot(snapshot),
            meta: { chartId: snapshot.chartId },
        });
        return { message: "Member Chart deleted" };
    }
    static async listByChart(requesterUserId, chartId) {
        const chart = await prismaFlowly.chart.findUnique({
            where: { chartId },
            select: { chartId: true, isDeleted: true, pilarId: true, sbuId: true, sbuSubId: true }
        });
        if (!chart || chart.isDeleted) {
            return [];
        }
        const accessContext = await getAccessContext(requesterUserId);
        const moduleAccessMap = await getModuleAccessMap(requesterUserId);
        if (!accessContext.isAdmin && !canReadModule(moduleAccessMap, "CHART_MEMBER")) {
            throw new ResponseError(403, "Module CHART_MEMBER access required");
        }
        if (!accessContext.isAdmin) {
            const hasPilarAccess = canRead(accessContext.pilar, chart.pilarId);
            const hasSbuAccess = canRead(accessContext.sbu, chart.sbuId);
            const hasSbuSubAccess = canRead(accessContext.sbuSub, chart.sbuSubId);
            if (!hasPilarAccess && !hasSbuAccess && !hasSbuSubAccess) {
                return [];
            }
        }
        const members = await prismaFlowly.chartMember.findMany({
            where: { chartId, isDeleted: false },
        });
        return members.map(toChartMemberResponse);
    }
}
//# sourceMappingURL=chart-member-service.js.map