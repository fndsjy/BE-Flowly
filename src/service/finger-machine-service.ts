import {
  Connection,
  Request,
  type ConnectionConfiguration,
} from "tedious";
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

type TediousColumn = {
  metadata?: {
    colName?: string;
  };
  value: unknown;
};

const DEFAULT_CACHE_TTL_MS = 5 * 60 * 1000;
const DEFAULT_CONNECT_TIMEOUT_MS = 15 * 1000;
const DEFAULT_REQUEST_TIMEOUT_MS = 15 * 1000;

const MACHINE_QUERY = `
  SELECT TOP (1000)
    [ID],
    [MachineAlias],
    [IP],
    [Enabled]
  FROM [ATT2000].[dbo].[Machines]
  WHERE [IP] IS NOT NULL
    AND LTRIM(RTRIM([IP])) <> ''
  ORDER BY [MachineAlias] ASC, [IP] ASC, [ID] ASC
`;

let fingerMachineCache: FingerMachineCacheEntry | null = null;

const normalizeOptionalText = (value: unknown) => {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const normalizeRequiredText = (value: unknown) => {
  if (typeof value === "string") {
    return value.trim();
  }

  if (value === null || value === undefined) {
    return "";
  }

  return String(value).trim();
};

const normalizeBoolean = (value: unknown, defaultValue = false) => {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    return value === 1;
  }

  if (typeof value !== "string") {
    return defaultValue;
  }

  const normalized = value.trim().toLowerCase();
  if (!normalized) {
    return defaultValue;
  }

  return ["1", "true", "yes", "y"].includes(normalized);
};

const parsePositiveInteger = (value: string | undefined, fallback: number) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }

  return Math.trunc(parsed);
};

const parseTimeoutMs = (value: string | undefined, fallback: number) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }

  // Prisma-style SQL Server URLs commonly use seconds such as `connectTimeout=30`.
  if (parsed <= 300) {
    return Math.trunc(parsed * 1000);
  }

  return Math.trunc(parsed);
};

const parseSqlServerConnectionString = (
  connectionString: string
): ConnectionConfiguration => {
  const trimmed = connectionString.trim();
  const withoutProtocol = trimmed.startsWith("sqlserver://")
    ? trimmed.slice("sqlserver://".length)
    : trimmed;

  const segments = withoutProtocol
    .split(";")
    .map((segment) => segment.trim())
    .filter((segment) => segment.length > 0);

  const [serverSegment, ...optionSegments] = segments;
  if (!serverSegment) {
    throw new ResponseError(500, "Finger machine database server is not configured");
  }

  const separatorIndex = serverSegment.lastIndexOf(":");
  const hasPort =
    separatorIndex > -1 && separatorIndex < serverSegment.length - 1;
  const server = hasPort
    ? serverSegment.slice(0, separatorIndex).trim()
    : serverSegment.trim();
  const port = hasPort
    ? parsePositiveInteger(
        serverSegment.slice(separatorIndex + 1).trim(),
        1433
      )
    : 1433;

  const optionMap = new Map<string, string>();
  for (const segment of optionSegments) {
    const equalsIndex = segment.indexOf("=");
    if (equalsIndex === -1) {
      continue;
    }

    const key = segment.slice(0, equalsIndex).trim().toLowerCase();
    const value = segment.slice(equalsIndex + 1).trim();
    if (key) {
      optionMap.set(key, value);
    }
  }

  const database = optionMap.get("database")?.trim();
  const userName =
    optionMap.get("user")?.trim() ??
    optionMap.get("uid")?.trim() ??
    optionMap.get("username")?.trim();
  const password =
    optionMap.get("password")?.trim() ?? optionMap.get("pwd")?.trim();

  if (!server || !database || !userName || !password) {
    throw new ResponseError(
      500,
      "Finger machine database credentials are incomplete"
    );
  }

  return {
    server,
    authentication: {
      type: "default",
      options: {
        userName,
        password,
      },
    },
    options: {
      appName: "flowly-finger-machine-reader",
      database,
      port,
      encrypt: normalizeBoolean(optionMap.get("encrypt"), true),
      trustServerCertificate: normalizeBoolean(
        optionMap.get("trustservercertificate"),
        true
      ),
      connectTimeout: parseTimeoutMs(
        optionMap.get("connecttimeout"),
        DEFAULT_CONNECT_TIMEOUT_MS
      ),
      requestTimeout: parseTimeoutMs(
        optionMap.get("requesttimeout"),
        DEFAULT_REQUEST_TIMEOUT_MS
      ),
    },
  };
};

const getFingerMachineConnectionConfig = () => {
  const connectionString = process.env.FINGER_MACHINE_DATABASE_URL?.trim();
  if (!connectionString) {
    throw new ResponseError(
      500,
      "Finger machine database is not configured"
    );
  }

  return parseSqlServerConnectionString(connectionString);
};

const rowToRecord = (columns: TediousColumn[]) => {
  return columns.reduce((record, column) => {
    const columnName = column.metadata?.colName;
    if (!columnName) {
      return record;
    }

    record[columnName] = column.value;
    return record;
  }, {} as Record<string, unknown>);
};

const buildFingerMachineLabel = (
  machineAlias: string | null,
  ip: string,
  enabled: boolean
) => {
  const baseLabel = machineAlias ? `${machineAlias} (${ip})` : ip;
  return enabled ? baseLabel : `${baseLabel} - nonaktif`;
};

const toFingerMachineResponse = (record: Record<string, unknown>) => {
  const ip = normalizeRequiredText(record.IP);
  if (!ip) {
    return null;
  }

  const rawId = Number(record.ID);
  const id = Number.isFinite(rawId) ? Math.trunc(rawId) : 0;
  const machineAlias = normalizeOptionalText(record.MachineAlias);
  const enabled = normalizeBoolean(record.Enabled, false);

  return {
    id,
    ip,
    machineAlias,
    enabled,
    label: buildFingerMachineLabel(machineAlias, ip, enabled),
  } satisfies FingerMachineResponse;
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

const executeFingerMachineQuery = (config: ConnectionConfiguration) => {
  return new Promise<FingerMachineResponse[]>((resolve, reject) => {
    const connection = new Connection(config);
    const rows: FingerMachineResponse[] = [];
    let settled = false;

    const finish = (error?: unknown) => {
      if (settled) {
        return;
      }

      settled = true;

      try {
        connection.close();
      } catch {
        // Tedious may already have closed the socket when connect/query fails.
      }

      if (error) {
        reject(error instanceof Error ? error : new Error(String(error)));
        return;
      }

      resolve(dedupeFingerMachines(rows));
    };

    connection.on("connect", (error) => {
      if (error) {
        finish(error);
        return;
      }

      const request = new Request(MACHINE_QUERY, (requestError) => {
        finish(requestError);
      });

      request.on("row", (columns: TediousColumn[]) => {
        const machine = toFingerMachineResponse(rowToRecord(columns));
        if (machine) {
          rows.push(machine);
        }
      });

      connection.execSql(request);
    });

    connection.on("error", (error) => {
      finish(error);
    });

    connection.connect();
  });
};

export class FingerMachineService {
  static async list(requesterUserId: string) {
    await ensureHrdCrudAccess(requesterUserId);

    const now = Date.now();
    if (fingerMachineCache && fingerMachineCache.expiresAt > now) {
      return fingerMachineCache.data;
    }

    try {
      const config = getFingerMachineConnectionConfig();
      const data = await executeFingerMachineQuery(config);
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
      logger.error("[FINGER MACHINE] Failed to load machine list", { message });

      if (error instanceof ResponseError) {
        throw error;
      }

      throw new ResponseError(502, "Failed to load finger machine list");
    }
  }
}
