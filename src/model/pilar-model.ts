/* ------------------ RESPONSE TYPE ------------------ */
export type PilarResponse = {
  id: number;
  pilarName: string;
  description: string | null;
  pic: number | null; 
  status: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
};

/* ------------------ LIST TYPE (FOR TABLE / DROPDOWN) ------------------ */
export type PilarListResponse = {
  id: number;
  pilarName: string;
  description: string | null;
  pic: number | null; 
  status: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
};

/* ------------------ REQUEST TYPE ------------------ */
export type CreatePilarRequest = {
  pilarName: string;
  description?: string | null;
  pic?: number | null;
};

export type UpdatePilarRequest = {
  id: number;
  pilarName?: string;
  description?: string | null;
  pic?: number | null;
  status?: string;
};

export type DeletePilarRequest = {
  id: number;
};

/* ------------------ HELPERS ------------------ */

// Single response
export function toPilarResponse(p: any): PilarResponse {
  return {
    id: p.id,
    pilarName: p.pilar_name,
    description: p.description ?? null,
    pic: p.pic ?? null, 
    status: p.status,
    isDeleted: p.isDeleted ?? false,
    createdAt: p.created_at ?? p.createdAt,
    updatedAt: p.lastupdate ?? p.updatedAt,
  };
}

// List response
export function toPilarListResponse(p: any): PilarListResponse {
  return {
    id: p.id,
    pilarName: p.pilar_name,
    description: p.description ?? null,
    pic: p.pic ?? null, 
    status: p.status,
    isDeleted: p.isDeleted ?? false,
    createdAt: p.created_at ?? p.createdAt,
    updatedAt: p.lastupdate ?? p.updatedAt,
  };
}
