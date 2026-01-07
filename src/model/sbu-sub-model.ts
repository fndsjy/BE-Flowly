// sbu-sub-model.ts
export type SbuSubResponse = {
  id: number;
  sbuSubCode: string;
  sbuSubName: string;
  sbuId: number | null;
  sbuPilar: number | null;
  description: string | null;
  jobDesc: string | null;
  jabatan: string | null;
  pic: number | null;
  status: string;
  isDeleted: boolean;
  createdAt: Date | null;
  updatedAt: Date | null;
};

export type SbuSubListResponse = SbuSubResponse;

export type CreateSbuSubRequest = {
  sbuSubCode: string;
  sbuSubName: string;
  sbuId: number;
  sbuPilar?: number | null;
  description?: string | null;
  jobDesc?: string | null;
  jabatan?: string | null;
  pic?: number | null;
};

export type UpdateSbuSubRequest = {
  id: number;
  sbuSubCode?: string;
  sbuSubName?: string;
  sbuId?: number;
  sbuPilar?: number | null;
  description?: string | null;
  jobDesc?: string | null;
  jabatan?: string | null;
  pic?: number | null;
  status?: string;
};

export type DeleteSbuSubRequest = {
  id: number;
};

export function toSbuSubResponse(s: any): SbuSubResponse {
  return {
    id: s.id,
    sbuSubCode: s.sbu_sub_code,
    sbuSubName: s.sbu_sub_name,
    sbuId: s.sbu_id,
    sbuPilar: s.sbu_pilar,
    description: s.description ?? null,
    jobDesc: s.jobDesc ?? null,
    jabatan: s.jabatan ?? null,
    pic: s.pic ?? null,
    status: s.status,
    isDeleted: s.isDeleted ?? false,
    createdAt: s.created_at ?? s.createdAt ?? null,
    updatedAt: s.lastupdate ?? s.updatedAt ?? null,
  };
}

export const toSbuSubListResponse = toSbuSubResponse;
