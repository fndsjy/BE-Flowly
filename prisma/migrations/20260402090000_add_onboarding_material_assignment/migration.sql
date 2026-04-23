BEGIN TRY

BEGIN TRAN;

-- No-op placeholder migration to restore Prisma migration chain integrity.

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
