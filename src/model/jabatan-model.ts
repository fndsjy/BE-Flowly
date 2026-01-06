/* ------------------ RESPONSE TYPE ------------------ */
export type JabatanResponse = {
  jabatanId: string;
  jabatanName: string;
  jabatanLevel: number;
  jabatanDesc: string | null;
  jabatanIsActive: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
};

/* ------------------ LIST TYPE ------------------ */
export type JabatanListResponse = JabatanResponse;

/* ------------------ REQUEST TYPE ------------------ */
export type CreateJabatanRequest = {
  jabatanName: string;
  jabatanLevel?: number;
  jabatanDesc?: string | null;
  jabatanIsActive?: boolean;
};

export type UpdateJabatanRequest = {
  jabatanId: string;
  jabatanName?: string;
  jabatanLevel?: number;
  jabatanDesc?: string | null;
  jabatanIsActive?: boolean;
};

export type DeleteJabatanRequest = {
  jabatanId: string;
};

/* ------------------ HELPERS ------------------ */
export function toJabatanResponse(j: any): JabatanResponse {
  return {
    jabatanId: j.jabatanId,
    jabatanName: j.jabatanName,
    jabatanLevel: j.jabatanLevel,
    jabatanDesc: j.jabatanDesc ?? null,
    jabatanIsActive: j.jabatanIsActive ?? true,
    isDeleted: j.isDeleted ?? false,
    createdAt: j.createdAt,
    updatedAt: j.updatedAt,
  };
}

export const toJabatanListResponse = toJabatanResponse;
