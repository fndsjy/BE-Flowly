BEGIN TRY

BEGIN TRAN;

-- AddColumn
ALTER TABLE [dbo].[case_notification_template] ADD [action] NVARCHAR(30);

-- Drop old index if exists
IF EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = 'case_notification_template_channel_role_isActive_isDeleted_idx'
      AND object_id = OBJECT_ID('dbo.case_notification_template')
)
BEGIN
    DROP INDEX [case_notification_template_channel_role_isActive_isDeleted_idx]
      ON [dbo].[case_notification_template];
END;

-- CreateIndex
CREATE NONCLUSTERED INDEX [case_notification_template_channel_role_action_isActive_isDeleted_idx]
ON [dbo].[case_notification_template]([channel], [role], [action], [isActive], [isDeleted]);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
