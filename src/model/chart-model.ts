import type { Chart } from "../generated/flowly/client.js";

export type ChartResponse = {
  chartId: string;
  parentId: string | null;
  pilarId: number;
  sbuId: number;
  sbuSubId: number;
  position: string;
  capacity: number;
  orderIndex: number;
  jobDesc: string | null;
};
 
export type CreateChartRequest = {
  parentId?: string | null;
  pilarId: number;
  sbuId: number;
  sbuSubId: number;
  position: string;
  capacity: number;
  orderIndex?: number;
  jobDesc?: string | null;
  jabatan?: string | null;
};

export type UpdateChartRequest = {
  chartId: string;
  position?: string;
  capacity?: number;
  orderIndex?: number;
  jobDesc?: string | null;
  jabatan?: string | null;
};

export type DeleteChartRequest = {
  chartId: string;
};

export type ChartListResponse = {
  chartId: string;
  parentId: string | null;
  pilarId: number;
  sbuId: number;
  sbuSubId: number;
  position: string;
  capacity: number;
  orderIndex: number;
  jobDesc: string | null;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
};

// Helper untuk respons create/update
export function toChartResponse(org: Chart): ChartResponse {
  return {
    chartId: org.chartId,
    parentId: org.parentId,
    pilarId: org.pilarId,
    sbuId: org.sbuId,
    sbuSubId: org.sbuSubId,
    position: org.position,
    capacity: org.capacity,
    orderIndex: org.orderIndex,
    jobDesc: org.jobDesc,
  };
}

// // Helper untuk list tree
export function toChartListResponse(org: Chart): ChartListResponse {
  return {
    chartId: org.chartId,
    parentId: org.parentId,
    pilarId: org.pilarId,
    sbuId: org.sbuId,
    sbuSubId: org.sbuSubId,
    position: org.position,
    capacity: org.capacity,
    orderIndex: org.orderIndex,
    jobDesc: org.jobDesc,
    isDeleted: org.isDeleted,
    createdAt: org.createdAt,
    updatedAt: org.updatedAt,
  };
}
