import type { MasterIK } from "../generated/flowly/client.js";

export type MasterIkResponse = {
  ikId: string;
  ikName: string;
  ikNumber: string;
  effectiveDate: Date;
  ikContent: string | null;
  dibuatOleh: number | null;
  diketahuiOleh: number | null;
  disetujuiOleh: number | null;
  dibuatOlehName?: string | null;
  diketahuiOlehName?: string | null;
  disetujuiOlehName?: string | null;
  sops: MasterIkSopInfo[];
  isActive: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type MasterIkSopInfo = {
  sopId: string;
  sopName: string;
  sbuSubId: number;
  sbuSubName: string | null;
};

export type MasterIkListResponse = MasterIkResponse;

export type CreateMasterIkRequest = {
  ikName: string;
  ikNumber: string;
  effectiveDate: Date | string;
  ikContent?: string | null;
  dibuatOleh?: number | null;
  diketahuiOleh?: number | null;
  disetujuiOleh?: number | null;
  sopIds?: string[];
};

export type UpdateMasterIkRequest = {
  ikId: string;
  ikName?: string;
  ikNumber?: string;
  effectiveDate?: Date | string;
  ikContent?: string | null;
  dibuatOleh?: number | null;
  diketahuiOleh?: number | null;
  disetujuiOleh?: number | null;
  isActive?: boolean;
  sopIds?: string[];
};

export type DeleteMasterIkRequest = {
  ikId: string;
};

type MasterIkRecord = MasterIK & {
  dibuatOleh?: number | null;
  diketahuiOleh?: number | null;
  disetujuiOleh?: number | null;
  sops?: MasterIkSopInfo[];
  dibuatOlehName?: string | null;
  diketahuiOlehName?: string | null;
  disetujuiOlehName?: string | null;
};

export function toMasterIkResponse(ik: MasterIkRecord): MasterIkResponse {
  return {
    ikId: ik.ikId,
    ikName: ik.ikName,
    ikNumber: ik.ikNumber,
    effectiveDate: ik.effectiveDate,
    ikContent: ik.ikContent ?? null,
    dibuatOleh: ik.dibuatOleh ?? null,
    diketahuiOleh: ik.diketahuiOleh ?? null,
    disetujuiOleh: ik.disetujuiOleh ?? null,
    dibuatOlehName: ik.dibuatOlehName ?? null,
    diketahuiOlehName: ik.diketahuiOlehName ?? null,
    disetujuiOlehName: ik.disetujuiOlehName ?? null,
    sops: ik.sops ?? [],
    isActive: ik.isActive,
    isDeleted: ik.isDeleted,
    createdAt: ik.createdAt,
    updatedAt: ik.updatedAt,
  };
}

export const toMasterIkListResponse = toMasterIkResponse;
