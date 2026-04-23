BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[notification_template] (
    [notificationTemplateId] NVARCHAR(20) NOT NULL,
    [templateName] NVARCHAR(100) NOT NULL,
    [channel] NVARCHAR(20) NOT NULL,
    [eventKey] NVARCHAR(50) NOT NULL,
    [recipientRole] NVARCHAR(30) NOT NULL,
    [messageTemplate] NVARCHAR(1000) NOT NULL,
    [isActive] BIT NOT NULL CONSTRAINT [notification_template_isActive_df] DEFAULT 1,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [notification_template_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [createdBy] NVARCHAR(20),
    [updatedAt] DATETIME2 NOT NULL,
    [updatedBy] NVARCHAR(20),
    [isDeleted] BIT NOT NULL CONSTRAINT [notification_template_isDeleted_df] DEFAULT 0,
    [deletedAt] DATETIME2,
    [deletedBy] NVARCHAR(20),
    CONSTRAINT [notification_template_pkey] PRIMARY KEY CLUSTERED ([notificationTemplateId])
);

-- CreateTable
CREATE TABLE [dbo].[notification_template_portal] (
    [notificationTemplatePortalId] NVARCHAR(20) NOT NULL,
    [notificationTemplateId] NVARCHAR(20) NOT NULL,
    [portalKey] NVARCHAR(50) NOT NULL,
    [isActive] BIT NOT NULL CONSTRAINT [notification_template_portal_isActive_df] DEFAULT 1,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [notification_template_portal_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [createdBy] NVARCHAR(20),
    [updatedAt] DATETIME2 NOT NULL,
    [updatedBy] NVARCHAR(20),
    [isDeleted] BIT NOT NULL CONSTRAINT [notification_template_portal_isDeleted_df] DEFAULT 0,
    [deletedAt] DATETIME2,
    [deletedBy] NVARCHAR(20),
    CONSTRAINT [notification_template_portal_pkey] PRIMARY KEY CLUSTERED ([notificationTemplatePortalId]),
    CONSTRAINT [notification_template_portal_notificationTemplateId_portalKey_isDeleted_key]
        UNIQUE NONCLUSTERED ([notificationTemplateId], [portalKey], [isDeleted]),
    CONSTRAINT [notification_template_portal_notificationTemplateId_fkey]
        FOREIGN KEY ([notificationTemplateId]) REFERENCES [dbo].[notification_template]([notificationTemplateId])
        ON DELETE NO ACTION ON UPDATE NO ACTION
);

-- CreateTable
CREATE TABLE [dbo].[notification_outbox] (
    [notificationOutboxId] NVARCHAR(20) NOT NULL,
    [notificationTemplateId] NVARCHAR(20),
    [portalKey] NVARCHAR(50) NOT NULL,
    [eventKey] NVARCHAR(50) NOT NULL,
    [recipientRole] NVARCHAR(30),
    [recipientReferenceType] NVARCHAR(50),
    [recipientReferenceId] NVARCHAR(100),
    [contextReferenceType] NVARCHAR(50),
    [contextReferenceId] NVARCHAR(100),
    [phoneNumber] NVARCHAR(30) NOT NULL,
    [message] NVARCHAR(1000) NOT NULL,
    [status] NVARCHAR(20) NOT NULL CONSTRAINT [notification_outbox_status_df] DEFAULT N'PENDING',
    [attempts] INT NOT NULL CONSTRAINT [notification_outbox_attempts_df] DEFAULT 0,
    [lastError] NVARCHAR(500),
    [provider] NVARCHAR(50),
    [sentAt] DATETIME2,
    [meta] NVARCHAR(MAX),
    [isActive] BIT NOT NULL CONSTRAINT [notification_outbox_isActive_df] DEFAULT 1,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [notification_outbox_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [createdBy] NVARCHAR(20),
    [updatedAt] DATETIME2 NOT NULL,
    [updatedBy] NVARCHAR(20),
    [isDeleted] BIT NOT NULL CONSTRAINT [notification_outbox_isDeleted_df] DEFAULT 0,
    [deletedAt] DATETIME2,
    [deletedBy] NVARCHAR(20),
    CONSTRAINT [notification_outbox_pkey] PRIMARY KEY CLUSTERED ([notificationOutboxId]),
    CONSTRAINT [notification_outbox_notificationTemplateId_fkey]
        FOREIGN KEY ([notificationTemplateId]) REFERENCES [dbo].[notification_template]([notificationTemplateId])
        ON DELETE NO ACTION ON UPDATE NO ACTION
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [notification_template_channel_eventKey_recipientRole_isActive_isDeleted_idx]
ON [dbo].[notification_template]([channel], [eventKey], [recipientRole], [isActive], [isDeleted]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [notification_template_portal_notificationTemplateId_isDeleted_isActive_idx]
ON [dbo].[notification_template_portal]([notificationTemplateId], [isDeleted], [isActive]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [notification_template_portal_portalKey_isDeleted_isActive_idx]
ON [dbo].[notification_template_portal]([portalKey], [isDeleted], [isActive]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [notification_outbox_notificationTemplateId_idx]
ON [dbo].[notification_outbox]([notificationTemplateId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [notification_outbox_portalKey_eventKey_isDeleted_isActive_idx]
ON [dbo].[notification_outbox]([portalKey], [eventKey], [isDeleted], [isActive]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [notification_outbox_recipientReferenceType_recipientReferenceId_isDeleted_idx]
ON [dbo].[notification_outbox]([recipientReferenceType], [recipientReferenceId], [isDeleted]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [notification_outbox_contextReferenceType_contextReferenceId_isDeleted_idx]
ON [dbo].[notification_outbox]([contextReferenceType], [contextReferenceId], [isDeleted]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [notification_outbox_status_isDeleted_idx]
ON [dbo].[notification_outbox]([status], [isDeleted]);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
