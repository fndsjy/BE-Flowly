BEGIN TRY

BEGIN TRAN;

EXEC sp_rename
    N'dbo.onboarding_material_progress.startedAt',
    N'readAt',
    N'COLUMN';

EXEC sp_rename
    N'dbo.onboarding_material_progress.lastOpenedAt',
    N'lastReadAt',
    N'COLUMN';

COMMIT TRAN;

END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
        ROLLBACK TRAN;
    THROW;
END CATCH
