/* ========== RESPONSE TYPE ========== */
export type SbuResponse = {
  id: number;
  sbuCode: string;
  sbuName: string;
  sbuPilar: number;
  description: string | null;
  jobDesc: string | null;
  pic: number | null;
  status: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
};

/* ========== LIST TYPE ========== */
export type SbuListResponse = SbuResponse;

/* ========== REQUEST TYPES ========== */
export type CreateSbuRequest = {
  sbuCode: string;
  sbuName: string;
  sbuPilar: number;
  description?: string | null;
  jobDesc?: string | null;
  pic?: number | null;
};

export type UpdateSbuRequest = {
  id: number;
  sbuCode?: string;
  sbuName?: string;
  sbuPilar?: number;
  description?: string | null;
  jobDesc?: string | null;
  pic?: number | null;
  status?: string;
};

export type DeleteSbuRequest = {
  id: number;
};

/* ========== HELPERS ========== */
export function toSbuResponse(s: any): SbuResponse {
  return {
    id: s.id,
    sbuCode: s.sbu_code,
    sbuName: s.sbu_name,
    sbuPilar: s.sbu_pilar,
    description: s.description ?? null,
    jobDesc: s.jobDesc ?? null,
    pic: s.pic ?? null,
    status: s.status,
    isDeleted: s.isDeleted ?? false,
    createdAt: s.created_at ?? s.createdAt,
    updatedAt: s.lastupdate ?? s.updatedAt,
  };
}

export const toSbuListResponse = toSbuResponse;
