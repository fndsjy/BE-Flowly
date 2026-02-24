BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[case_notification_message] (
    [caseNotificationMessageId] NVARCHAR(20) NOT NULL,
    [caseId] NVARCHAR(20),
    [caseDepartmentId] NVARCHAR(20),
    [recipientEmployeeId] INT,
    [role] NVARCHAR(20) NOT NULL,
    [messageTemplate] NVARCHAR(1000) NOT NULL,
    [isActive] BIT NOT NULL CONSTRAINT [case_notification_message_isActive_df] DEFAULT 1,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [case_notification_message_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [createdBy] NVARCHAR(20),
    [updatedAt] DATETIME2 NOT NULL,
    [updatedBy] NVARCHAR(20),
    [isDeleted] BIT NOT NULL CONSTRAINT [case_notification_message_isDeleted_df] DEFAULT 0,
    [deletedAt] DATETIME2,
    [deletedBy] NVARCHAR(20),
    CONSTRAINT [case_notification_message_pkey] PRIMARY KEY CLUSTERED ([caseNotificationMessageId])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [case_notification_message_caseId_idx] ON [dbo].[case_notification_message]([caseId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [case_notification_message_caseDepartmentId_idx] ON [dbo].[case_notification_message]([caseDepartmentId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [case_notification_message_recipientEmployeeId_role_idx] ON [dbo].[case_notification_message]([recipientEmployeeId], [role]);

-- AddForeignKey
ALTER TABLE [dbo].[case_notification_message] ADD CONSTRAINT [case_notification_message_caseId_fkey] FOREIGN KEY ([caseId]) REFERENCES [dbo].[case_header]([caseId]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[case_notification_message] ADD CONSTRAINT [case_notification_message_caseDepartmentId_fkey] FOREIGN KEY ([caseDepartmentId]) REFERENCES [dbo].[case_department]([caseDepartmentId]) ON DELETE NO ACTION ON UPDATE NO ACTION;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
