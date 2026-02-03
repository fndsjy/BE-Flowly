BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[master_ik] ADD [dibuatOleh] INT,
[diketahuiOleh] INT,
[disetujuiOleh] INT;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
