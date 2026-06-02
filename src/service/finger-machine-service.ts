import { prismaEmployee } from "../application/database.js";
import { logger } from "../application/logging.js";
import { ResponseError } from "../error/response-error.js";
import { ensureHrdCrudAccess } from "../utils/hrd-access.js";

export interface FingerMachineResponse {
  id: number;
  ip: string;
  machineAlias: string | null;
  enabled: boolean;
  label: string;
}

type FingerMachineCacheEntry = {
  expiresAt: number;
  data: FingerMachineResponse[];
};

type FingerDeviceRecord = {
  id: number | bigint;
  device_name: string | null;
  ip_address: string | null;
  active: boolean | number | string | null;
};

const DEFAULT_CACHE_TTL_MS = 5 * 60 * 1000;

let fingerMachineCache: FingerMachineCacheEntry | null = null;

const normalizeOptionalText = (value: string | null) => {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : null;
};

const normalizeRequiredText = (value: string) => value.trim();

const normalizeBoolean = (value: boolean | number | string | null) => {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    return value === 1;
  }

  const normalized = value?.trim().toLowerCase();
  return normalized === "1" || normalized === "true" || normalized === "yes";
};

const parsePositiveInteger = (value: string | undefined, fallback: number) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }

  return Math.trunc(parsed);
};

const buildFingerMachineLabel = (
  deviceName: string | null,
  ip: string,
  active: boolean
) => {
  const baseLabel = deviceName ? `${deviceName} (${ip})` : ip;
  return active ? baseLabel : `${baseLabel} - nonaktif`;
};

const shouldReplaceMachine = (
  current: FingerMachineResponse,
  candidate: FingerMachineResponse
) => {
  const currentScore =
    (current.enabled ? 2 : 0) + (current.machineAlias ? 1 : 0);
  const candidateScore =
    (candidate.enabled ? 2 : 0) + (candidate.machineAlias ? 1 : 0);

  if (candidateScore !== currentScore) {
    return candidateScore > currentScore;
  }

  return candidate.id < current.id;
};

const dedupeFingerMachines = (machines: FingerMachineResponse[]) => {
  const byIp = new Map<string, FingerMachineResponse>();

  for (const machine of machines) {
    const current = byIp.get(machine.ip);
    if (!current || shouldReplaceMachine(current, machine)) {
      byIp.set(machine.ip, machine);
    }
  }

  return [...byIp.values()].sort((left, right) => {
    if (left.enabled !== right.enabled) {
      return left.enabled ? -1 : 1;
    }

    const aliasCompare = (left.machineAlias ?? "").localeCompare(
      right.machineAlias ?? "",
      "id",
      {
        sensitivity: "base",
      }
    );
    if (aliasCompare !== 0) {
      return aliasCompare;
    }

    return left.ip.localeCompare(right.ip, "en");
  });
};

const listFingerDevices = async () => {
  const devices = await prismaEmployee.$queryRaw<FingerDeviceRecord[]>`
    SELECT TOP (1000)
      [id],
      [device_name],
      [ip_address],
      [active]
    FROM [dbo].[att_devices]
    WHERE [deleted_at] IS NULL
      AND [ip_address] IS NOT NULL
      AND LTRIM(RTRIM([ip_address])) <> ''
    ORDER BY [active] DESC, [device_name] ASC, [ip_address] ASC, [id] ASC
  `;

  return dedupeFingerMachines(
    devices
      .map((device) => {
        const ip = normalizeRequiredText(device.ip_address ?? "");
        if (!ip) {
          return null;
        }

        const machineAlias = normalizeOptionalText(device.device_name);
        const active = normalizeBoolean(device.active);
        const id = Number(device.id);

        return {
          id: Number.isFinite(id) ? Math.trunc(id) : 0,
          ip,
          machineAlias,
          enabled: active,
          label: buildFingerMachineLabel(machineAlias, ip, active),
        } satisfies FingerMachineResponse;
      })
      .filter((device): device is FingerMachineResponse => Boolean(device))
  );
};

export class FingerMachineService {
  static async list(requesterUserId: string) {
    await ensureHrdCrudAccess(requesterUserId);

    const now = Date.now();
    if (fingerMachineCache && fingerMachineCache.expiresAt > now) {
      return fingerMachineCache.data;
    }

    try {
      const data = await listFingerDevices();
      const ttlMs = parsePositiveInteger(
        process.env.FINGER_MACHINE_CACHE_TTL_MS,
        DEFAULT_CACHE_TTL_MS
      );

      fingerMachineCache = {
        expiresAt: now + ttlMs,
        data,
      };

      return data;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error("[FINGER MACHINE] Failed to load device list", { message });

      if (error instanceof ResponseError) {
        throw error;
      }

      throw new ResponseError(502, "Failed to load finger machine list");
    }
  }
}
