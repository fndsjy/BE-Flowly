import type { PrismaClient } from "../src/generated/flowly/client.js";
import {
  generateNotificationTemplateId,
  generateNotificationTemplatePortalId,
} from "../src/utils/id-generator.js";

export type NotificationTemplateDefault = {
  templateName: string;
  channel: "WHATSAPP" | "EMAIL";
  eventKey: string;
  recipientRole: string;
  portalKeys: readonly string[];
  messageTemplate: string;
};

export const notificationTemplateDefaults: NotificationTemplateDefault[] = [
  {
    templateName: "WA Peserta - Welcome OMS first login",
    channel: "WHATSAPP",
    eventKey: "OMS_FIRST_LOGIN",
    recipientRole: "PARTICIPANT",
    portalKeys: ["EMPLOYEE"],
    messageTemplate:
      "Halo {recipientName},\n\nWelcome OMS. Onboarding Anda untuk {portalName} dimulai pada {startedDate}.\nUsername: {username}\nPassword sementara: {temporaryPassword}\nDeadline: {dueDate}\n\nSilakan login melalui {loginUrl} dan segera ubah password setelah berhasil masuk.\nJika ada kendala, hubungi {supportName} {supportPhone}.",
  },
  {
    templateName: "WA Peserta - Onboarding dimulai",
    channel: "WHATSAPP",
    eventKey: "ONBOARDING_STARTED",
    recipientRole: "PARTICIPANT",
    portalKeys: ["EMPLOYEE"],
    messageTemplate:
      "Halo {recipientName},\n\nOnboarding Anda untuk {portalName} sudah dimulai pada {startedDate}.\nDeadline: {dueDate}\n\nSilakan login menggunakan password OMS Anda yang sudah ada melalui {loginUrl}.",
  },
  {
    templateName: "WA PIC SBU Sub - Onboarding dimulai",
    channel: "WHATSAPP",
    eventKey: "ONBOARDING_STARTED",
    recipientRole: "SBU_SUB_PIC",
    portalKeys: ["EMPLOYEE"],
    messageTemplate:
      "Halo {recipientName},\n\n{employeeName} ({cardNumber}) mulai onboarding {portalName} pada {startedDate}.\nSBU Sub: {sbuSubName}\nSBU: {sbuName}\nPilar: {pilarName}\nPosisi: {positionName}\nDeadline: {dueDate}\n\nPantau progres onboarding melalui {hrdUrl}.",
  },
  {
    templateName: "WA HRD - Onboarding gagal tenggat",
    channel: "WHATSAPP",
    eventKey: "ONBOARDING_OVERDUE_FAILED",
    recipientRole: "HRD",
    portalKeys: ["EMPLOYEE"],
    messageTemplate:
      "Onboarding {employeeName} ({cardNumber}) untuk {portalName} gagal otomatis karena melewati tenggat {dueDate}.\nHRD perlu memberi keputusan di {decisionUrl}.",
  },
  {
    templateName: "WA PIC SBU Sub - Onboarding gagal tenggat",
    channel: "WHATSAPP",
    eventKey: "ONBOARDING_OVERDUE_FAILED",
    recipientRole: "SBU_SUB_PIC",
    portalKeys: ["EMPLOYEE"],
    messageTemplate:
      "Halo {recipientName},\n\n{employeeName} ({cardNumber}) gagal onboarding {portalName} otomatis karena melewati tenggat {dueDate}.\n\nStruktur terakhir:\nSBU Sub: {sbuSubName}\nSBU: {sbuName}\nPilar: {pilarName}\nPosisi: {positionName}\nJabatan: {jabatanName}\n\nHRD akan meninjau keputusan berikutnya. Pantau progres melalui {hrdUrl}.",
  },
  {
    templateName: "WA HRD - Keputusan PIC onboarding",
    channel: "WHATSAPP",
    eventKey: "ONBOARDING_PIC_DECISION",
    recipientRole: "HRD",
    portalKeys: ["EMPLOYEE"],
    messageTemplate:
      "[Info Keputusan PIC SBU Sub]\nPIC {decisionActorName} ({decisionActorBadge}) mengambil keputusan onboarding untuk {employeeName} ({cardNumber}) di {portalName}: {decisionLabel}.\nStatus saat ini: {status}. Deadline: {dueDate}.\nCatatan PIC: {decisionNote}.\nHRD menerima notifikasi ini untuk monitoring. Detail: {decisionUrl}",
  },
  {
    templateName: "WA Peserta - Onboarding dilanjutkan setelah review",
    channel: "WHATSAPP",
    eventKey: "ONBOARDING_TRANSFER_REVIEW_CANCELLED",
    recipientRole: "PARTICIPANT",
    portalKeys: ["EMPLOYEE"],
    messageTemplate:
      "Halo {recipientName},\n\nKabar baik, onboarding Anda untuk {portalName} sudah bisa dilanjutkan kembali. Status beku sudah dibatalkan setelah review HRD.\n\nAnda akan lanjut di struktur terbaru berikut:\nSBU Sub: {sbuSubName}\nSBU: {sbuName}\nPilar: {pilarName}\nPosisi: {positionName}\nJabatan: {jabatanName}\nDeadline: {dueDate}\n\nTetap semangat menyelesaikan onboarding. Silakan lanjutkan melalui {loginUrl}.",
  },
  {
    templateName: "WA PIC SBU Sub - Onboarding dilanjutkan setelah review",
    channel: "WHATSAPP",
    eventKey: "ONBOARDING_TRANSFER_REVIEW_CANCELLED",
    recipientRole: "SBU_SUB_PIC",
    portalKeys: ["EMPLOYEE"],
    messageTemplate:
      "Halo {recipientName},\n\nKabar baik, {employeeName} ({cardNumber}) sudah bisa melanjutkan onboarding {portalName}. Status beku sudah dibatalkan setelah review HRD.\n\nMohon dampingi proses onboarding di struktur terbaru berikut:\nSBU Sub: {sbuSubName}\nSBU: {sbuName}\nPilar: {pilarName}\nPosisi: {positionName}\nJabatan: {jabatanName}\nDeadline: {dueDate}\nCatatan: {decisionNote}\n\nPantau progres onboarding melalui {hrdUrl}.",
  },
  {
    templateName: "WA Peserta - Onboarding gagal final",
    channel: "WHATSAPP",
    eventKey: "ONBOARDING_FAIL_FINAL",
    recipientRole: "PARTICIPANT",
    portalKeys: ["EMPLOYEE"],
    messageTemplate:
      "Halo {recipientName},\n\nKami informasikan onboarding Anda untuk {portalName} telah ditetapkan gagal final oleh HRD pada {decisionAt}.\n\nCatatan HRD: {decisionNote}\n\nTerima kasih atas usaha Anda selama proses onboarding. Jika membutuhkan klarifikasi, silakan hubungi HRD.",
  },
  {
    templateName: "WA Peserta - Onboarding lulus",
    channel: "WHATSAPP",
    eventKey: "ONBOARDING_PASSED",
    recipientRole: "PARTICIPANT",
    portalKeys: ["EMPLOYEE"],
    messageTemplate:
      "Halo {recipientName},\n\nSelamat, onboarding Anda untuk {portalName} sudah lulus pada {decisionAt}.\nCatatan: {decisionNote}\n\nSilakan lanjutkan aktivitas Learning melalui {loginUrl}.",
  },
  {
    templateName: "WA HRD - Onboarding lulus",
    channel: "WHATSAPP",
    eventKey: "ONBOARDING_PASSED",
    recipientRole: "HRD",
    portalKeys: ["EMPLOYEE"],
    messageTemplate:
      "Notifikasi onboarding lulus\n\n{employeeName} ({cardNumber}) sudah lulus onboarding {portalName} pada {decisionAt}.\nNilai akhir: {score}\nCatatan: {decisionNote}\n\nDetail: {decisionUrl}",
  },
  {
    templateName: "WA PIC SBU Sub - Onboarding lulus",
    channel: "WHATSAPP",
    eventKey: "ONBOARDING_PASSED",
    recipientRole: "SBU_SUB_PIC",
    portalKeys: ["EMPLOYEE"],
    messageTemplate:
      "Halo {recipientName},\n\n{employeeName} ({cardNumber}) sudah lulus onboarding {portalName} pada {decisionAt}.\nNilai akhir: {score}\n\nStruktur:\nSBU Sub: {sbuSubName}\nSBU: {sbuName}\nPilar: {pilarName}\nPosisi: {positionName}\nJabatan: {jabatanName}\n\nPantau detail melalui {hrdUrl}.",
  },
  {
    templateName: "WA Peserta - Tenggat onboarding diperpanjang",
    channel: "WHATSAPP",
    eventKey: "ONBOARDING_EXTENDED",
    recipientRole: "PARTICIPANT",
    portalKeys: ["EMPLOYEE"],
    messageTemplate:
      "Halo {recipientName},\n\nHRD memperpanjang tenggat onboarding Anda untuk {portalName} selama {extensionDays} hari.\nDeadline sebelumnya: {previousDueDate}\nDeadline baru: {dueDate}\nCatatan HRD: {decisionNote}\n\nSilakan lanjutkan onboarding melalui {loginUrl}.",
  },
  {
    templateName: "WA Monitor - Ujian onboarding dimulai",
    channel: "WHATSAPP",
    eventKey: "ONBOARDING_EXAM_STARTED",
    recipientRole: "EXAM_MONITOR",
    portalKeys: ["EMPLOYEE"],
    messageTemplate:
      "Notifikasi Ujian Onboarding\n{employeeName} ({badgeNumber}) sedang mengikuti ujian onboarding.\nPortal: {portalName}\nTahap: {stageName}\nSesi: {examsId}\nWaktu: {occurredAt}",
  },
  {
    templateName: "WA Monitor - Ujian onboarding selesai",
    channel: "WHATSAPP",
    eventKey: "ONBOARDING_EXAM_FINISHED",
    recipientRole: "EXAM_MONITOR",
    portalKeys: ["EMPLOYEE"],
    messageTemplate:
      "Notifikasi Ujian Onboarding\n{employeeName} ({badgeNumber}) sudah selesai mengerjakan ujian onboarding.\nPortal: {portalName}\nTahap: {stageName}\nSesi: {examsId}\nWaktu: {occurredAt}",
  },
];

const normalizeUpper = (value: string) => value.trim().toUpperCase();

export async function seedNotificationTemplates(client: PrismaClient) {
  const makeNotificationTemplateId = await generateNotificationTemplateId();
  const makeNotificationTemplatePortalId =
    await generateNotificationTemplatePortalId();
  const result = {
    createdTemplates: 0,
    createdPortalMappings: 0,
    existingTemplates: 0,
    updatedTemplates: 0,
  };

  for (const template of notificationTemplateDefaults) {
    const channel = normalizeUpper(template.channel);
    const eventKey = normalizeUpper(template.eventKey);
    const recipientRole = normalizeUpper(template.recipientRole);
    const portalKeys = Array.from(
      new Set(template.portalKeys.map((portalKey) => normalizeUpper(portalKey)))
    ).sort();

    const candidates = await client.notificationTemplate.findMany({
      where: {
        isDeleted: false,
        channel,
        eventKey,
        recipientRole,
      },
      include: {
        portalMappings: {
          where: { isDeleted: false },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    const portalKeySet = new Set(portalKeys);
    const existingTemplate =
      candidates.find((candidate) =>
        candidate.portalMappings.some((mapping) =>
          portalKeySet.has(normalizeUpper(mapping.portalKey))
        )
      ) ??
      candidates.find((candidate) => candidate.portalMappings.length === 0) ??
      null;

    const now = new Date();
    let savedTemplate =
      existingTemplate ??
      (await client.notificationTemplate.create({
        data: {
          notificationTemplateId: makeNotificationTemplateId(),
          templateName: template.templateName,
          channel,
          eventKey,
          recipientRole,
          messageTemplate: template.messageTemplate,
          isActive: true,
          isDeleted: false,
          createdAt: now,
          createdBy: "SEED",
          updatedAt: now,
          updatedBy: "SEED",
        },
        include: {
          portalMappings: {
            where: { isDeleted: false },
          },
        },
      }));

    if (existingTemplate) {
      result.existingTemplates += 1;
      const createdBy = normalizeUpper(existingTemplate.createdBy ?? "");
      const updatedBy = normalizeUpper(existingTemplate.updatedBy ?? "");
      const isSeedOwned =
        createdBy === "SEED" && (updatedBy.length === 0 || updatedBy === "SEED");
      const isLegacyOnboardingPassedParticipant =
        eventKey === "ONBOARDING_PASSED" &&
        recipientRole === "PARTICIPANT" &&
        existingTemplate.messageTemplate.includes("telah diluluskan oleh HRD");

      if (isSeedOwned && isLegacyOnboardingPassedParticipant) {
        savedTemplate = await client.notificationTemplate.update({
          where: {
            notificationTemplateId: existingTemplate.notificationTemplateId,
          },
          data: {
            templateName: template.templateName,
            messageTemplate: template.messageTemplate,
            updatedAt: now,
            updatedBy: "SEED",
          },
          include: {
            portalMappings: {
              where: { isDeleted: false },
            },
          },
        });
        result.updatedTemplates += 1;
      }
    } else {
      result.createdTemplates += 1;
    }

    if (portalKeys.length === 0) {
      continue;
    }

    const existingPortalKeys = new Set(
      savedTemplate.portalMappings.map((mapping) => normalizeUpper(mapping.portalKey))
    );

    if (existingTemplate && existingPortalKeys.size === 0) {
      continue;
    }

    for (const portalKey of portalKeys) {
      if (existingPortalKeys.has(portalKey)) {
        continue;
      }

      await client.notificationTemplatePortal.create({
        data: {
          notificationTemplatePortalId: makeNotificationTemplatePortalId(),
          notificationTemplateId: savedTemplate.notificationTemplateId,
          portalKey,
          isActive: true,
          isDeleted: false,
          createdAt: now,
          createdBy: "SEED",
          updatedAt: now,
          updatedBy: "SEED",
        },
      });
      result.createdPortalMappings += 1;
    }
  }

  return result;
}
