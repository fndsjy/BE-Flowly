BEGIN TRY

BEGIN TRAN;

-- DropIndex
DROP INDEX [case_notification_template_channel_role_action_isActive_isDeleted_idx] ON [dbo].[case_notification_template];

-- AlterTable
ALTER TABLE [dbo].[case_notification_template] ADD [caseType] NVARCHAR(20);

-- CreateIndex
CREATE NONCLUSTERED INDEX [case_notification_template_channel_role_action_caseType_isActive_isDeleted_idx] ON [dbo].[case_notification_template]([channel], [role], [action], [caseType], [isActive], [isDeleted]);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
