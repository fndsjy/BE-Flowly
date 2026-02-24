BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[case_notification_template] (
    [caseNotificationTemplateId] NVARCHAR(20) NOT NULL,
    [templateName] NVARCHAR(100) NOT NULL,
    [channel] NVARCHAR(20) NOT NULL,
    [role] NVARCHAR(20) NOT NULL,
    [messageTemplate] NVARCHAR(1000) NOT NULL,
    [isActive] BIT NOT NULL CONSTRAINT [case_notification_template_isActive_df] DEFAULT 1,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [case_notification_template_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [createdBy] NVARCHAR(20),
    [updatedAt] DATETIME2 NOT NULL,
    [updatedBy] NVARCHAR(20),
    [isDeleted] BIT NOT NULL CONSTRAINT [case_notification_template_isDeleted_df] DEFAULT 0,
    [deletedAt] DATETIME2,
    [deletedBy] NVARCHAR(20),
    CONSTRAINT [case_notification_template_pkey] PRIMARY KEY CLUSTERED ([caseNotificationTemplateId])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [case_notification_template_channel_role_isActive_isDeleted_idx] ON [dbo].[case_notification_template]([channel], [role], [isActive], [isDeleted]);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
