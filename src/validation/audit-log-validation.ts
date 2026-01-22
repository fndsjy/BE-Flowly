import { z, ZodType } from "zod";

export class AuditLogValidation {
  static readonly LIST: ZodType = z.object({
    module: z.string().max(50).optional(),
    entity: z.string().max(50).optional(),
    entityId: z.string().max(50).optional(),
    action: z.string().max(20).optional(),
    actorId: z.string().max(20).optional(),
    actorType: z.string().max(20).optional(),
    dateFrom: z.coerce.date().optional(),
    dateTo: z.coerce.date().optional(),
    q: z.string().max(200).optional(),
    page: z.coerce.number().int().min(1).optional(),
    pageSize: z.coerce.number().int().min(1).max(200).optional(),
    includeMaster: z.coerce.boolean().optional(),
  });
}
