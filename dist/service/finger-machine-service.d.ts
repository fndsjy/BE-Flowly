export interface FingerMachineResponse {
    id: number;
    ip: string;
    machineAlias: string | null;
    enabled: boolean;
    label: string;
}
export declare class FingerMachineService {
    static list(requesterUserId: string): Promise<FingerMachineResponse[]>;
}
//# sourceMappingURL=finger-machine-service.d.ts.map