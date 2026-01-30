export type {
  MasterIkResponse as ProcedureIkResponse,
  MasterIkListResponse as ProcedureIkListResponse,
  CreateMasterIkRequest as CreateProcedureIkRequest,
  UpdateMasterIkRequest as UpdateProcedureIkRequest,
  DeleteMasterIkRequest as DeleteProcedureIkRequest,
} from "./master-ik-model.js";

export {
  toMasterIkResponse as toProcedureIkResponse,
  toMasterIkListResponse as toProcedureIkListResponse,
} from "./master-ik-model.js";
