export declare const manualNotificationStartAt: Date;
export declare const retryBlockReason: (row: {
    status: string;
    lastError: string | null;
    meta: string | null;
}) => "Pesan tidak berstatus gagal." | "Periksa riwayat gateway terlebih dahulu; pengiriman belum dipastikan gagal sebelum pesan dikirim." | "Percobaan kirim ulang sudah dibuat." | "Password sudah kedaluwarsa. Karyawan perlu meminta password baru." | null;
export declare class FailedNotificationService {
    private static authorize;
    static list(userId: string): Promise<{
        notificationOutboxId: string;
        phoneNumber: string;
        eventKey: string;
        createdAt: Date;
        lastError: string | null;
        blockedReason: string | null;
    }[]>;
    static retry(userId: string, id: string): Promise<{
        status: string;
        lastError: string | null;
        notificationOutboxId: string;
    } | null>;
}
//# sourceMappingURL=failed-notification-service.d.ts.map