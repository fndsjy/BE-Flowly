import { prismaFlowly, prismaEmployee } from "../application/database.js";
import { Validation } from "../validation/validation.js";
import { ChartValidation } from "../validation/chart-validation.js";
import { ResponseError } from "../error/response-error.js";
import { generateChartId, generateChartMemberId } from "../utils/id-generator.js";
import {
  getAccessContext,
  getModuleAccessMap,
  canReadModule,
  canCrudModule,
  canRead,
  canCrud
} from "../utils/access-scope.js";
import {
  buildChanges,
  pickSnapshot,
  resolveActorType,
  writeAuditLog
} from "../utils/audit-log.js";

import type {
  CreateChartRequest,
  UpdateChartRequest,
  DeleteChartRequest,
} from "../model/chart-model.js";

import {
  toChartResponse,
  toChartListResponse
} from "../model/chart-model.js";

const CHART_AUDIT_FIELDS = [
  "chartId",
  "parentId",
  "pilarId",
  "sbuId",
  "sbuSubId",
  "position",
  "capacity",
  "orderIndex",
  "jobDesc",
  "isDeleted",
] as const;

const getChartSnapshot = (record: Record<string, unknown>) =>
  pickSnapshot(record, CHART_AUDIT_FIELDS as unknown as string[]);

export class ChartService {
  // 📌 CREATE
  static async create(requesterUserId: string, request: CreateChartRequest) {
    const validated = Validation.validate(ChartValidation.CREATE, request);

    const { position, capacity, jobDesc, jabatan } = validated;
    let { parentId, pilarId, sbuId, sbuSubId } = validated;


    const accessContext = await getAccessContext(requesterUserId);
    const moduleAccessMap = await getModuleAccessMap(requesterUserId);
    if (!accessContext.isAdmin && !canCrudModule(moduleAccessMap, "CHART")) {
      throw new ResponseError(403, "Module CHART CRUD access required");
    }

    // --- VALIDASI MASTER: pilar / sbu / sbuSub ---
    // Jika hanya sbuSubId diberikan → otomatis ambil pilar & sbu
    if (sbuSubId && (!pilarId || !sbuId)) {
      const sub = await prismaEmployee.em_sbu_sub.findFirst({
        where: { id: sbuSubId, OR: [{ isDeleted: false }, { isDeleted: null }] }
      });
      if (!sub) throw new ResponseError(400, "Invalid sbuSubId");

      if (sub.sbu_id === null || sub.sbu_pilar === null) {
        throw new ResponseError(400, "SBU SUB missing SBU/Pilar reference");
      }

      sbuId = sub.sbu_id;
      pilarId = sub.sbu_pilar;
    }


    // Validasi Pilar
    const validPilar = await prismaEmployee.em_pilar.findUnique({
    where: { id: pilarId, OR: [{ isDeleted: false }, { isDeleted: null }] }
    });
    if (!validPilar) throw new ResponseError(400, "Invalid pilarId");


    // Validasi SBU
    const validSbu = await prismaEmployee.em_sbu.findFirst({
      where: { id: sbuId, OR: [{ isDeleted: false }, { isDeleted: null }] }
    });
    if (!validSbu) throw new ResponseError(400, "Invalid sbuId");


    // Validasi SUB SBU
    const validSbuSub = await prismaEmployee.em_sbu_sub.findUnique({
    where: { id: sbuSubId, OR: [{ isDeleted: false }, { isDeleted: null }] }
    });
    if (!validSbuSub) throw new ResponseError(400, "Invalid sbuSubId");

    let finalPilarId = pilarId;
    let finalSbuId = sbuId;
    let finalSbuSubId = sbuSubId;

    // Jika parentId ada → turunkan struktur parent
    if (parentId) {
      const parentNode = await prismaFlowly.chart.findUnique({
        where: { chartId: parentId, isDeleted: false }
      });

      if (!parentNode) {
        throw new ResponseError(400, "Invalid parentId");
      }

      // Parent harus berada pada pilar/sbu/sbusub yang sama
      if (
      parentNode.pilarId !== pilarId ||
      parentNode.sbuId !== sbuId ||
      parentNode.sbuSubId !== sbuSubId
      ) {
      throw new ResponseError(400, "Parent must belong to the same pilar/sbu/sbuSub");
      }

      finalPilarId = parentNode.pilarId;
      finalSbuId = parentNode.sbuId;
      finalSbuSubId = parentNode.sbuSubId;

    } else {
      // Jika root → pastikan semua ID ada
      if (!pilarId || !sbuId || !sbuSubId) {
        throw new ResponseError(400, "pilarId, sbuId, sbuSubId required for root chart");
      }
    }

    if (!accessContext.isAdmin) {
      const hasPilarCrud = canCrud(accessContext.pilar, finalPilarId);
      const hasSbuCrud = canCrud(accessContext.sbu, finalSbuId);
      const hasSbuSubCrud = canCrud(accessContext.sbuSub, finalSbuSubId);
      if (!hasPilarCrud && !hasSbuCrud && !hasSbuSubCrud) {
        throw new ResponseError(403, "SBU SUB CRUD access required");
      }
    }

    // AUTO-INCREMENT orderIndex per parent + struktur
    const lastOrder = await prismaFlowly.chart.findFirst({
      where: {
        parentId: parentId ?? null,
        pilarId: finalPilarId,
        sbuId: finalSbuId,
        sbuSubId: finalSbuSubId,
        isDeleted: false
      },
      orderBy: { orderIndex: "desc" }
    });

    const nextOrderIndex = lastOrder ? lastOrder.orderIndex + 1 : 0;

    const chartId = await generateChartId();

    const chart = await prismaFlowly.chart.create({
      data: {
        chartId,
        parentId: parentId ?? null,
        pilarId: finalPilarId,
        sbuId: finalSbuId,
        sbuSubId: finalSbuSubId,
        position,
        capacity,
        orderIndex: nextOrderIndex,
        jobDesc: jobDesc ?? null,
        createdBy: requesterUserId,
        updatedBy: requesterUserId,
      }
    });

    // 🧩 Buat slot (ChartMember) — SATU PER SATU agar ID unik
    console.log(`[DEBUG] 🟢 Chart created: ${chartId}. Creating ${capacity} empty members...`);
    for (let i = 0; i < capacity; i++) {
      const memberChartId = await generateChartMemberId(); // ✅ sequential & safe
      console.log(`[DEBUG] ➕ Creating slot #${i + 1}/${capacity}: ${memberChartId}`);

      await prismaFlowly.chartMember.create({
        data: {
          memberChartId,
          chartId: chart.chartId,
          userId: null,
          jabatan: jabatan ?? null,
          createdBy: requesterUserId,
          updatedBy: requesterUserId, // ✅ opsional, tapi konsisten
        },
      });
    }

    const response = toChartResponse(chart);
    await writeAuditLog({
      module: "CHART",
      entity: "CHART",
      entityId: response.chartId,
      action: "CREATE",
      actorId: requesterUserId,
      actorType: resolveActorType(requesterUserId),
      snapshot: getChartSnapshot(response as unknown as Record<string, unknown>),
      meta: { memberSlotsCreated: capacity },
    });

    return response;
  }

  // UPDATE
  static async update(requesterUserId: string, request: UpdateChartRequest) {
    const validated = Validation.validate(ChartValidation.UPDATE, request);
    const {
      chartId,
      position: inputPosition,
      capacity: inputCapacity,
      orderIndex: inputOrderIndex,
      jobDesc: inputJobDesc,
      jabatan: inputJabatan
    } = validated;

    // 1. CEK NODE
    const existing = await prismaFlowly.chart.findUnique({
      where: { chartId, isDeleted: false },
    });
    if (!existing) throw new ResponseError(404, "Chart ID not found");

    const finalPosition = inputPosition ?? existing.position;
    const finalCapacity = inputCapacity ?? existing.capacity;
    const finalOrderIndex = inputOrderIndex ?? existing.orderIndex;
    const finalJobDesc = inputJobDesc === undefined ? existing.jobDesc : inputJobDesc;
    const finalJabatan =
      inputJabatan === undefined
        ? undefined
        : typeof inputJabatan === "string" && inputJabatan.trim().length === 0
          ? null
          : inputJabatan;

    const accessContext = await getAccessContext(requesterUserId);
    const moduleAccessMap = await getModuleAccessMap(requesterUserId);
    if (!accessContext.isAdmin && !canCrudModule(moduleAccessMap, "CHART")) {
      throw new ResponseError(403, "Module CHART CRUD access required");
    }
    if (!accessContext.isAdmin) {
      const hasPilarCrud = canCrud(accessContext.pilar, existing.pilarId);
      const hasSbuCrud = canCrud(accessContext.sbu, existing.sbuId);
      const hasSbuSubCrud = canCrud(accessContext.sbuSub, existing.sbuSubId);
      if (!hasPilarCrud && !hasSbuCrud && !hasSbuSubCrud) {
        throw new ResponseError(403, "SBU SUB CRUD access required");
      }
    }

    // 3. AMBIL SLOT SEKARANG
    const currentSlots = await prismaFlowly.chartMember.findMany({
      where: { chartId, isDeleted: false },
      orderBy: { createdAt: "asc" }, // PENTING agar slice konsisten
    });

    const existingJabatan =
      currentSlots.find((slot) => slot.jabatan)?.jabatan ?? null;
    const slotJabatan = finalJabatan !== undefined ? finalJabatan : existingJabatan;

    const diff = finalCapacity - currentSlots.length;

    // 4. CAPACITY NAIK → TAMBAH SLOT (SATU-PER-SATU agar ID unik)
    if (diff > 0) {
      console.log(`[DEBUG] 📈 Increasing capacity by ${diff}. Creating new empty slots...`);
      for (let i = 0; i < diff; i++) {
        const memberChartId = await generateChartMemberId(); // ✅ sequential & safe
        console.log(`[DEBUG] ➕ New slot #${i + 1}/${diff}: ${memberChartId}`);

        await prismaFlowly.chartMember.create({
          data: {
            memberChartId,
            chartId,
            userId: null,
            jabatan: slotJabatan,
            createdBy: requesterUserId,
            updatedBy: requesterUserId,
          },
        });
      }
    }

    // 5. CAPACITY TURUN → VALIDASI & SOFT DELETE SLOT
    if (diff < 0) {
      // Ambil slot yang terisi (userId ≠ null)
      const filledSlots = currentSlots.filter(s => s.userId !== null);

      // Jika jumlah terisi melebihi kapasitas baru → tolak
      if (filledSlots.length > finalCapacity) {
        // 🔍 Ambil info pegawai untuk pesan error yang helpful
        const employeeIds = filledSlots.map(s => s.userId!);
        const employees = await prismaEmployee.em_employee.findMany({
          where: { UserId: { in: employeeIds } },
          select: { UserId: true, Name: true }
        });

        type EmployeePreview = {
          UserId: number;
          Name: string | null;
        };

        const filledInfo = filledSlots.map(slot => {
          const emp = (employees as EmployeePreview[]).find(e => e.UserId === slot.userId);
          return {
            memberChartId: slot.memberChartId,
            employee: emp ? `${emp.Name} (${emp.UserId})` : `User ID: ${slot.userId}`
          };
        });

        // ✅ Pesan error deskriptif (bisa dikirim ke frontend → showToast)
        throw new ResponseError(
          400,
          `Cannot reduce capacity to ${finalCapacity}. ` +
          `There are ${filledSlots.length} occupied slots. ` +
          `Please unassign these members first:\n` +
          filledInfo.map(f => `- ${f.employee} [${f.memberChartId}]`).join("\n")
        );
      }

      // ✅ Jika lolos validasi: hapus slot kosong ekstra (dari akhir)
      const slotsToRemove = currentSlots
        .filter(s => s.userId === null) // hanya kosong
        .slice(finalCapacity - filledSlots.length) // sisakan cukup untuk terisi + sisa kapasitas
        .map(s => s.memberChartId);

      if (slotsToRemove.length > 0) {
        await prismaFlowly.chartMember.updateMany({
          where: { memberChartId: { in: slotsToRemove } },
          data: {
            isDeleted: true,
            deletedAt: new Date(),
            deletedBy: requesterUserId,
          },
        });
      }
    }

    // 5.b UPDATE JABATAN SLOT (JIKA DIKIRIM)
    if (finalJabatan !== undefined) {
      await prismaFlowly.chartMember.updateMany({
        where: { chartId, isDeleted: false },
        data: {
          jabatan: finalJabatan,
          updatedBy: requesterUserId,
          updatedAt: new Date(),
        },
      });
    }

    // 6. UPDATE CHART (INI YANG TADI HILANG)
    const updated = await prismaFlowly.chart.update({
      where: { chartId },
      data: {
        position: finalPosition,
        capacity: finalCapacity,
        orderIndex: finalOrderIndex,
        jobDesc: finalJobDesc,
        updatedBy: requesterUserId,
        updatedAt: new Date(),
      },
    });

    const response = toChartResponse(updated);
    const before = toChartResponse(existing);
    const changes = buildChanges(
      before as unknown as Record<string, unknown>,
      response as unknown as Record<string, unknown>,
      CHART_AUDIT_FIELDS as unknown as string[]
    );

    if (changes.length > 0 || diff !== 0 || finalJabatan !== undefined) {
      const meta =
        diff !== 0 || finalJabatan !== undefined
          ? {
              memberSlotsAdded: diff > 0 ? diff : 0,
              memberSlotsRemoved: diff < 0 ? Math.abs(diff) : 0,
              jabatanUpdated: finalJabatan !== undefined,
            }
          : undefined;

      const payload = {
        module: "CHART",
        entity: "CHART",
        entityId: response.chartId,
        action: "UPDATE",
        actorId: requesterUserId,
        actorType: resolveActorType(requesterUserId),
        changes,
      } as const;

      await writeAuditLog(meta ? { ...payload, meta } : payload);
    }

    return response;
  }

  // ================================
  // 🗑️ SOFT DELETE
  // ================================
  static async softDelete(requesterUserId: string, request: DeleteChartRequest) {
    const validated = Validation.validate(ChartValidation.DELETE, request);
    const { chartId } = validated;

    const accessContext = await getAccessContext(requesterUserId);
    const moduleAccessMap = await getModuleAccessMap(requesterUserId);
    if (!accessContext.isAdmin && !canCrudModule(moduleAccessMap, "CHART")) {
      throw new ResponseError(403, "Module CHART CRUD access required");
    }

    // 2. CHECK NODE EXISTS
    const node = await prismaFlowly.chart.findUnique({
      where: { chartId, isDeleted: false },
    });
    if (!node) throw new ResponseError(404, "Chart ID not found");

    if (!accessContext.isAdmin) {
      const hasPilarCrud = canCrud(accessContext.pilar, node.pilarId);
      const hasSbuCrud = canCrud(accessContext.sbu, node.sbuId);
      const hasSbuSubCrud = canCrud(accessContext.sbuSub, node.sbuSubId);
      if (!hasPilarCrud && !hasSbuCrud && !hasSbuSubCrud) {
        throw new ResponseError(403, "SBU SUB CRUD access required");
      }
    }

    // 3. CHECK CHILDREN
    const child = await prismaFlowly.chart.findFirst({
      where: { parentId: chartId, isDeleted: false },
    });
    if (child) {
      throw new ResponseError(
        400,
        "Cannot delete: this chart still has children. Move or delete them first."
      );
    }

    // ✅ 4. CHECK OCCUPIED MEMBERS
    const occupiedMember = await prismaFlowly.chartMember.findFirst({
      where: { 
        chartId, 
        userId: { not: null },
        isDeleted: false 
      },
      select: { memberChartId: true, userId: true }
    });

    if (occupiedMember) {
      const emp = await prismaEmployee.em_employee.findUnique({
        where: { UserId: occupiedMember.userId! },
        select: { Name: true }
      });
      const name = emp?.Name || `User ID: ${occupiedMember.userId}`;
      throw new ResponseError(
        400,
        `Cannot delete chart: there is at least one assigned member (${name}). ` +
        `Please unassign them first via chart member management.`
      );
    }

    // ✅ 5. SOFT DELETE — FIX: tambahkan `data:`
    await prismaFlowly.$transaction(async (tx) => {
      // 🔹 Soft-delete semua chartMember yang masih aktif
      await tx.chartMember.updateMany({
        where: { chartId, isDeleted: false },
        data: {  // ✅ WAJIB: `data:`
          isDeleted: true,
          deletedAt: new Date(),
          deletedBy: requesterUserId,
        },
      });

      // 🔹 Soft-delete chart
      await tx.chart.update({
        where: { chartId },
        data: {  // ✅ WAJIB: `data:`
          isDeleted: true,
          deletedAt: new Date(),
          deletedBy: requesterUserId,
        },
      });
    });

    // ✅ Opsional: hitung berapa yang di-delete (jika benar-benar butuh)
    const deletedMembersCount = await prismaFlowly.chartMember.count({
      where: { chartId, isDeleted: true, deletedBy: requesterUserId, deletedAt: { gte: new Date(Date.now() - 5000) } }
    });

    console.log(`[AUDIT] Chart ${chartId} soft-deleted by ${requesterUserId} COUNT(${deletedMembersCount} members)`);
    // await prismaFlowly.chart.update({
    //   where: { chartId },
    //   data: {  // ⬅️ INI YANG KURANG
    //     isDeleted: true,
    //     deletedAt: new Date(),
    //     deletedBy: requesterUserId,
    //   },
    // });

    const snapshot = toChartResponse(node);
    await writeAuditLog({
      module: "CHART",
      entity: "CHART",
      entityId: snapshot.chartId,
      action: "DELETE",
      actorId: requesterUserId,
      actorType: resolveActorType(requesterUserId),
      snapshot: getChartSnapshot(snapshot as unknown as Record<string, unknown>),
      meta: { memberSlotsDeleted: deletedMembersCount },
    });

    return { message: "Chart deleted successfully" };
  }

  // ================================
  // 📋 LIST
  // ================================
  static async listTree() {
    const nodes = await prismaFlowly.chart.findMany({
      where: { isDeleted: false },
      orderBy: { orderIndex: "asc" }
    });

    return nodes.map(toChartListResponse);
  }

  // ================================
  // 📋 LIST BY SBU / SUB
  // ================================
  static async listBySbuSub(
    requesterId: string,
    pilarId?: number,
    sbuId?: number,
    sbuSubId?: number
  ) {
    if (sbuSubId === undefined) {
      return [];
    }

    const accessContext = await getAccessContext(requesterId);
    const moduleAccessMap = await getModuleAccessMap(requesterId);
    if (!accessContext.isAdmin && !canReadModule(moduleAccessMap, "CHART")) {
      throw new ResponseError(403, "Module CHART access required");
    }
     // Cek apakah SBU_SUB masih aktif
    const sub = await prismaEmployee.em_sbu_sub.findUnique({
      where: { id: sbuSubId },
    });

    // Jika SBU_SUB tidak ada atau isDeleted true → return [] langsung
    if (!sub || sub.isDeleted === true) {
      return [];
    }

    if (!accessContext.isAdmin) {
      const hasPilarAccess = sub.sbu_pilar !== null && sub.sbu_pilar !== undefined
        && canRead(accessContext.pilar, sub.sbu_pilar);
      const hasSbuAccess = sub.sbu_id !== null && sub.sbu_id !== undefined
        && canRead(accessContext.sbu, sub.sbu_id);
      const hasSbuSubAccess = canRead(accessContext.sbuSub, sbuSubId);

      if (!hasPilarAccess && !hasSbuAccess && !hasSbuSubAccess) {
        return [];
      }
    }

    const whereClause: any = {
      sbuSubId,
      isDeleted: false
    };

    if (pilarId !== undefined) whereClause.pilarId = pilarId;
    if (sbuId !== undefined) whereClause.sbuId = sbuId;

    const nodes = await prismaFlowly.chart.findMany({
      where: whereClause,
      orderBy: { orderIndex: "asc" },
    });

    return nodes.map(toChartListResponse);
  }
}
