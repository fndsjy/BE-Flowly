// src/utils/id-generator.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function getDDMMYY(): string {
  const now = new Date();
  const year = String(now.getFullYear()).slice(-2);
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${day}${month}${year}`;
}

// ✅ Helper: extract sequence number safely
function extractSeqFromId(id: string): number {
  const parts = id.split("-");
  // Jika tidak ada "-", atau bagian ke-2 tidak angka → fallback ke 0
  const rawSeq = parts.length > 1 ? (parts[1] ?? "") : "";
  const num = parseInt(rawSeq, 10);
  return isNaN(num) ? 0 : num;
}

export async function generateUserId(): Promise<string> {
  const today = getDDMMYY();
  const prefix = `USR${today}`;

  // Ambil ID terbesar hari ini (termasuk deleted — hindari duplikat)
  const existing = await prisma.user.findFirst({
    where: { userId: { startsWith: prefix } },
    select: { userId: true },
    orderBy: { userId: "desc" }, // leksikografis descending: USRxx-0010 > USRxx-0009
  });

  let nextSeq = 1;
  if (existing?.userId) {
    const currentSeq = extractSeqFromId(existing.userId);
    nextSeq = currentSeq + 1;
  }

  return `${prefix}-${String(nextSeq).padStart(4, "0")}`;
}

export async function generateRoleId(): Promise<string> {
  const today = getDDMMYY();
  const prefix = `ROL${today}`;

  const existing = await prisma.role.findFirst({
    where: { roleId: { startsWith: prefix } },
    select: { roleId: true },
    orderBy: { roleId: "desc" },
  });

  let nextSeq = 1;
  if (existing?.roleId) {
    const currentSeq = extractSeqFromId(existing.roleId);
    nextSeq = currentSeq + 1;
  }

  return `${prefix}-${String(nextSeq).padStart(4, "0")}`;
}