BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[case_header] (
    [caseId] NVARCHAR(20) NOT NULL,
    [caseType] NVARCHAR(20) NOT NULL,
    [caseTitle] NVARCHAR(200) NOT NULL,
    [background] NVARCHAR(1000),
    [currentCondition] NVARCHAR(2000),
    [projectDesc] NVARCHAR(2000),
    [projectObjective] NVARCHAR(1000),
    [locationDesc] NVARCHAR(255),
    [notes] NVARCHAR(1000),
    [status] NVARCHAR(20) NOT NULL CONSTRAINT [case_header_status_df] DEFAULT 'NEW',
    [requesterId] NVARCHAR(20),
    [requesterEmployeeId] INT,
    [originSbuSubId] INT,
    [isActive] BIT NOT NULL CONSTRAINT [case_header_isActive_df] DEFAULT 1,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [case_header_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [createdBy] NVARCHAR(20),
    [updatedAt] DATETIME2 NOT NULL,
    [updatedBy] NVARCHAR(20),
    [isDeleted] BIT NOT NULL CONSTRAINT [case_header_isDeleted_df] DEFAULT 0,
    [deletedAt] DATETIME2,
    [deletedBy] NVARCHAR(20),
    CONSTRAINT [case_header_pkey] PRIMARY KEY CLUSTERED ([caseId])
);

-- CreateTable
CREATE TABLE [dbo].[case_department] (
    [caseDepartmentId] NVARCHAR(20) NOT NULL,
    [caseId] NVARCHAR(20) NOT NULL,
    [sbuSubId] INT NOT NULL,
    [decisionStatus] NVARCHAR(20) NOT NULL CONSTRAINT [case_department_decisionStatus_df] DEFAULT 'PENDING',
    [decisionAt] DATETIME2,
    [decisionBy] NVARCHAR(20),
    [assigneeEmployeeId] INT,
    [assignedAt] DATETIME2,
    [assignedBy] NVARCHAR(20),
    [workStatus] NVARCHAR(20),
    [startDate] DATETIME2,
    [targetDate] DATETIME2,
    [endDate] DATETIME2,
    [workNotes] NVARCHAR(500),
    [isActive] BIT NOT NULL CONSTRAINT [case_department_isActive_df] DEFAULT 1,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [case_department_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [createdBy] NVARCHAR(20),
    [updatedAt] DATETIME2 NOT NULL,
    [updatedBy] NVARCHAR(20),
    [isDeleted] BIT NOT NULL CONSTRAINT [case_department_isDeleted_df] DEFAULT 0,
    [deletedAt] DATETIME2,
    [deletedBy] NVARCHAR(20),
    CONSTRAINT [case_department_pkey] PRIMARY KEY CLUSTERED ([caseDepartmentId]),
    CONSTRAINT [case_department_caseId_sbuSubId_key] UNIQUE NONCLUSTERED ([caseId],[sbuSubId])
);

-- CreateTable
CREATE TABLE [dbo].[case_notification_outbox] (
    [caseNotificationId] NVARCHAR(20) NOT NULL,
    [caseId] NVARCHAR(20),
    [caseDepartmentId] NVARCHAR(20),
    [recipientEmployeeId] INT,
    [channel] NVARCHAR(20) NOT NULL,
    [phoneNumber] NVARCHAR(20) NOT NULL,
    [message] NVARCHAR(1000) NOT NULL,
    [status] NVARCHAR(20) NOT NULL CONSTRAINT [case_notification_outbox_status_df] DEFAULT 'PENDING',
    [attempts] INT NOT NULL CONSTRAINT [case_notification_outbox_attempts_df] DEFAULT 0,
    [lastError] NVARCHAR(500),
    [provider] NVARCHAR(50),
    [meta] NVARCHAR(max),
    [isActive] BIT NOT NULL CONSTRAINT [case_notification_outbox_isActive_df] DEFAULT 1,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [case_notification_outbox_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [createdBy] NVARCHAR(20),
    [updatedAt] DATETIME2 NOT NULL,
    [updatedBy] NVARCHAR(20),
    [isDeleted] BIT NOT NULL CONSTRAINT [case_notification_outbox_isDeleted_df] DEFAULT 0,
    [deletedAt] DATETIME2,
    [deletedBy] NVARCHAR(20),
    CONSTRAINT [case_notification_outbox_pkey] PRIMARY KEY CLUSTERED ([caseNotificationId])
);

-- CreateTable
CREATE TABLE [dbo].[case_attachment] (
    [caseAttachmentId] NVARCHAR(20) NOT NULL,
    [caseId] NVARCHAR(20) NOT NULL,
    [mediaType] NVARCHAR(10) NOT NULL,
    [filePath] NVARCHAR(500) NOT NULL,
    [fileName] NVARCHAR(255) NOT NULL,
    [fileMime] NVARCHAR(100),
    [fileSize] INT,
    [caption] NVARCHAR(255),
    [locationDesc] NVARCHAR(255),
    [orderIndex] INT NOT NULL CONSTRAINT [case_attachment_orderIndex_df] DEFAULT 0,
    [isActive] BIT NOT NULL CONSTRAINT [case_attachment_isActive_df] DEFAULT 1,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [case_attachment_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [createdBy] NVARCHAR(20),
    [updatedAt] DATETIME2 NOT NULL,
    [updatedBy] NVARCHAR(20),
    [isDeleted] BIT NOT NULL CONSTRAINT [case_attachment_isDeleted_df] DEFAULT 0,
    [deletedAt] DATETIME2,
    [deletedBy] NVARCHAR(20),
    CONSTRAINT [case_attachment_pkey] PRIMARY KEY CLUSTERED ([caseAttachmentId])
);

-- CreateTable
CREATE TABLE [dbo].[case_fishbone_master] (
    [caseFishboneId] NVARCHAR(20) NOT NULL,
    [caseId] NVARCHAR(20) NOT NULL,
    [sbuSubId] INT NOT NULL,
    [fishboneName] NVARCHAR(150) NOT NULL,
    [fishboneDesc] NVARCHAR(1000),
    [isActive] BIT NOT NULL CONSTRAINT [case_fishbone_master_isActive_df] DEFAULT 1,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [case_fishbone_master_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [createdBy] NVARCHAR(20),
    [updatedAt] DATETIME2 NOT NULL,
    [updatedBy] NVARCHAR(20),
    [isDeleted] BIT NOT NULL CONSTRAINT [case_fishbone_master_isDeleted_df] DEFAULT 0,
    [deletedAt] DATETIME2,
    [deletedBy] NVARCHAR(20),
    CONSTRAINT [case_fishbone_master_pkey] PRIMARY KEY CLUSTERED ([caseFishboneId])
);

-- CreateTable
CREATE TABLE [dbo].[case_fishbone_cause] (
    [caseFishboneCauseId] NVARCHAR(20) NOT NULL,
    [caseFishboneId] NVARCHAR(20) NOT NULL,
    [causeNo] INT NOT NULL,
    [causeText] NVARCHAR(1000) NOT NULL,
    [isActive] BIT NOT NULL CONSTRAINT [case_fishbone_cause_isActive_df] DEFAULT 1,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [case_fishbone_cause_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [createdBy] NVARCHAR(20),
    [updatedAt] DATETIME2 NOT NULL,
    [updatedBy] NVARCHAR(20),
    [isDeleted] BIT NOT NULL CONSTRAINT [case_fishbone_cause_isDeleted_df] DEFAULT 0,
    [deletedAt] DATETIME2,
    [deletedBy] NVARCHAR(20),
    CONSTRAINT [case_fishbone_cause_pkey] PRIMARY KEY CLUSTERED ([caseFishboneCauseId]),
    CONSTRAINT [case_fishbone_cause_caseFishboneId_causeNo_key] UNIQUE NONCLUSTERED ([caseFishboneId],[causeNo])
);

-- CreateTable
CREATE TABLE [dbo].[case_fishbone_item] (
    [caseFishboneItemId] NVARCHAR(20) NOT NULL,
    [caseFishboneId] NVARCHAR(20) NOT NULL,
    [categoryCode] NVARCHAR(20) NOT NULL,
    [problemText] NVARCHAR(1000) NOT NULL,
    [solutionText] NVARCHAR(1000) NOT NULL,
    [isActive] BIT NOT NULL CONSTRAINT [case_fishbone_item_isActive_df] DEFAULT 1,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [case_fishbone_item_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [createdBy] NVARCHAR(20),
    [updatedAt] DATETIME2 NOT NULL,
    [updatedBy] NVARCHAR(20),
    [isDeleted] BIT NOT NULL CONSTRAINT [case_fishbone_item_isDeleted_df] DEFAULT 0,
    [deletedAt] DATETIME2,
    [deletedBy] NVARCHAR(20),
    CONSTRAINT [case_fishbone_item_pkey] PRIMARY KEY CLUSTERED ([caseFishboneItemId])
);

-- CreateTable
CREATE TABLE [dbo].[case_fishbone_item_cause] (
    [caseFishboneItemCauseId] NVARCHAR(20) NOT NULL,
    [caseFishboneItemId] NVARCHAR(20) NOT NULL,
    [caseFishboneCauseId] NVARCHAR(20) NOT NULL,
    [isActive] BIT NOT NULL CONSTRAINT [case_fishbone_item_cause_isActive_df] DEFAULT 1,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [case_fishbone_item_cause_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [createdBy] NVARCHAR(20),
    [updatedAt] DATETIME2 NOT NULL,
    [updatedBy] NVARCHAR(20),
    [isDeleted] BIT NOT NULL CONSTRAINT [case_fishbone_item_cause_isDeleted_df] DEFAULT 0,
    [deletedAt] DATETIME2,
    [deletedBy] NVARCHAR(20),
    CONSTRAINT [case_fishbone_item_cause_pkey] PRIMARY KEY CLUSTERED ([caseFishboneItemCauseId]),
    CONSTRAINT [case_fishbone_item_cause_caseFishboneItemId_caseFishboneCauseId_key] UNIQUE NONCLUSTERED ([caseFishboneItemId],[caseFishboneCauseId])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [case_header_status_idx] ON [dbo].[case_header]([status]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [case_header_requesterId_idx] ON [dbo].[case_header]([requesterId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [case_header_requesterEmployeeId_idx] ON [dbo].[case_header]([requesterEmployeeId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [case_header_originSbuSubId_idx] ON [dbo].[case_header]([originSbuSubId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [case_department_caseId_decisionStatus_idx] ON [dbo].[case_department]([caseId], [decisionStatus]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [case_department_sbuSubId_idx] ON [dbo].[case_department]([sbuSubId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [case_notification_outbox_caseId_idx] ON [dbo].[case_notification_outbox]([caseId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [case_notification_outbox_caseDepartmentId_idx] ON [dbo].[case_notification_outbox]([caseDepartmentId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [case_notification_outbox_status_isDeleted_idx] ON [dbo].[case_notification_outbox]([status], [isDeleted]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [case_attachment_caseId_isDeleted_idx] ON [dbo].[case_attachment]([caseId], [isDeleted]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [case_fishbone_master_caseId_isActive_isDeleted_idx] ON [dbo].[case_fishbone_master]([caseId], [isActive], [isDeleted]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [case_fishbone_master_sbuSubId_idx] ON [dbo].[case_fishbone_master]([sbuSubId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [case_fishbone_cause_caseFishboneId_isActive_isDeleted_idx] ON [dbo].[case_fishbone_cause]([caseFishboneId], [isActive], [isDeleted]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [case_fishbone_item_caseFishboneId_categoryCode_idx] ON [dbo].[case_fishbone_item]([caseFishboneId], [categoryCode]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [case_fishbone_item_caseFishboneId_isActive_isDeleted_idx] ON [dbo].[case_fishbone_item]([caseFishboneId], [isActive], [isDeleted]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [case_fishbone_item_cause_caseFishboneItemId_isActive_isDeleted_idx] ON [dbo].[case_fishbone_item_cause]([caseFishboneItemId], [isActive], [isDeleted]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [case_fishbone_item_cause_caseFishboneCauseId_isActive_isDeleted_idx] ON [dbo].[case_fishbone_item_cause]([caseFishboneCauseId], [isActive], [isDeleted]);

-- AddForeignKey
ALTER TABLE [dbo].[case_department] ADD CONSTRAINT [case_department_caseId_fkey] FOREIGN KEY ([caseId]) REFERENCES [dbo].[case_header]([caseId]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[case_notification_outbox] ADD CONSTRAINT [case_notification_outbox_caseId_fkey] FOREIGN KEY ([caseId]) REFERENCES [dbo].[case_header]([caseId]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[case_notification_outbox] ADD CONSTRAINT [case_notification_outbox_caseDepartmentId_fkey] FOREIGN KEY ([caseDepartmentId]) REFERENCES [dbo].[case_department]([caseDepartmentId]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[case_attachment] ADD CONSTRAINT [case_attachment_caseId_fkey] FOREIGN KEY ([caseId]) REFERENCES [dbo].[case_header]([caseId]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[case_fishbone_master] ADD CONSTRAINT [case_fishbone_master_caseId_fkey] FOREIGN KEY ([caseId]) REFERENCES [dbo].[case_header]([caseId]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[case_fishbone_cause] ADD CONSTRAINT [case_fishbone_cause_caseFishboneId_fkey] FOREIGN KEY ([caseFishboneId]) REFERENCES [dbo].[case_fishbone_master]([caseFishboneId]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[case_fishbone_item] ADD CONSTRAINT [case_fishbone_item_caseFishboneId_fkey] FOREIGN KEY ([caseFishboneId]) REFERENCES [dbo].[case_fishbone_master]([caseFishboneId]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[case_fishbone_item] ADD CONSTRAINT [case_fishbone_item_categoryCode_fkey] FOREIGN KEY ([categoryCode]) REFERENCES [dbo].[fishbone_category]([categoryCode]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[case_fishbone_item_cause] ADD CONSTRAINT [case_fishbone_item_cause_caseFishboneItemId_fkey] FOREIGN KEY ([caseFishboneItemId]) REFERENCES [dbo].[case_fishbone_item]([caseFishboneItemId]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[case_fishbone_item_cause] ADD CONSTRAINT [case_fishbone_item_cause_caseFishboneCauseId_fkey] FOREIGN KEY ([caseFishboneCauseId]) REFERENCES [dbo].[case_fishbone_cause]([caseFishboneCauseId]) ON DELETE NO ACTION ON UPDATE NO ACTION;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
