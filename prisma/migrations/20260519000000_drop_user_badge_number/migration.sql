BEGIN TRY

BEGIN TRAN;

-- DropIndex
DROP INDEX [users_badgeNumber_idx] ON [dbo].[users];

-- AlterTable
ALTER TABLE [dbo].[users] DROP COLUMN [badgeNumber];

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
