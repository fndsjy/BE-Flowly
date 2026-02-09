BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[master_fishbone] (
    [fishboneId] NVARCHAR(20) NOT NULL,
    [sbuSubId] INT NOT NULL,
    [fishboneName] NVARCHAR(150) NOT NULL,
    [fishboneDesc] NVARCHAR(1000),
    [isActive] BIT NOT NULL CONSTRAINT [master_fishbone_isActive_df] DEFAULT 1,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [master_fishbone_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [createdBy] NVARCHAR(20),
    [updatedAt] DATETIME2 NOT NULL,
    [updatedBy] NVARCHAR(20),
    [isDeleted] BIT NOT NULL CONSTRAINT [master_fishbone_isDeleted_df] DEFAULT 0,
    [deletedAt] DATETIME2,
    [deletedBy] NVARCHAR(20),
    CONSTRAINT [master_fishbone_pkey] PRIMARY KEY CLUSTERED ([fishboneId])
);

-- CreateTable
CREATE TABLE [dbo].[fishbone_category] (
    [fishboneCategoryId] NVARCHAR(20) NOT NULL,
    [categoryCode] NVARCHAR(20) NOT NULL,
    [categoryName] NVARCHAR(100) NOT NULL,
    [categoryDesc] NVARCHAR(255),
    [isActive] BIT NOT NULL CONSTRAINT [fishbone_category_isActive_df] DEFAULT 1,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [fishbone_category_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [createdBy] NVARCHAR(20),
    [updatedAt] DATETIME2 NOT NULL,
    [updatedBy] NVARCHAR(20),
    [isDeleted] BIT NOT NULL CONSTRAINT [fishbone_category_isDeleted_df] DEFAULT 0,
    [deletedAt] DATETIME2,
    [deletedBy] NVARCHAR(20),
    CONSTRAINT [fishbone_category_pkey] PRIMARY KEY CLUSTERED ([fishboneCategoryId]),
    CONSTRAINT [fishbone_category_categoryCode_key] UNIQUE NONCLUSTERED ([categoryCode])
);

-- CreateTable
CREATE TABLE [dbo].[fishbone_cause] (
    [fishboneCauseId] NVARCHAR(20) NOT NULL,
    [fishboneId] NVARCHAR(20) NOT NULL,
    [causeNo] INT NOT NULL,
    [causeText] NVARCHAR(1000) NOT NULL,
    [isActive] BIT NOT NULL CONSTRAINT [fishbone_cause_isActive_df] DEFAULT 1,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [fishbone_cause_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [createdBy] NVARCHAR(20),
    [updatedAt] DATETIME2 NOT NULL,
    [updatedBy] NVARCHAR(20),
    [isDeleted] BIT NOT NULL CONSTRAINT [fishbone_cause_isDeleted_df] DEFAULT 0,
    [deletedAt] DATETIME2,
    [deletedBy] NVARCHAR(20),
    CONSTRAINT [fishbone_cause_pkey] PRIMARY KEY CLUSTERED ([fishboneCauseId]),
    CONSTRAINT [fishbone_cause_fishboneId_causeNo_key] UNIQUE NONCLUSTERED ([fishboneId],[causeNo])
);

-- CreateTable
CREATE TABLE [dbo].[fishbone_item] (
    [fishboneItemId] NVARCHAR(20) NOT NULL,
    [fishboneId] NVARCHAR(20) NOT NULL,
    [categoryCode] NVARCHAR(20) NOT NULL,
    [problemText] NVARCHAR(1000) NOT NULL,
    [solutionText] NVARCHAR(1000) NOT NULL,
    [isActive] BIT NOT NULL CONSTRAINT [fishbone_item_isActive_df] DEFAULT 1,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [fishbone_item_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [createdBy] NVARCHAR(20),
    [updatedAt] DATETIME2 NOT NULL,
    [updatedBy] NVARCHAR(20),
    [isDeleted] BIT NOT NULL CONSTRAINT [fishbone_item_isDeleted_df] DEFAULT 0,
    [deletedAt] DATETIME2,
    [deletedBy] NVARCHAR(20),
    CONSTRAINT [fishbone_item_pkey] PRIMARY KEY CLUSTERED ([fishboneItemId])
);

-- CreateTable
CREATE TABLE [dbo].[fishbone_item_cause] (
    [fishboneItemCauseId] NVARCHAR(20) NOT NULL,
    [fishboneItemId] NVARCHAR(20) NOT NULL,
    [fishboneCauseId] NVARCHAR(20) NOT NULL,
    [isActive] BIT NOT NULL CONSTRAINT [fishbone_item_cause_isActive_df] DEFAULT 1,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [fishbone_item_cause_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [createdBy] NVARCHAR(20),
    [updatedAt] DATETIME2 NOT NULL,
    [updatedBy] NVARCHAR(20),
    [isDeleted] BIT NOT NULL CONSTRAINT [fishbone_item_cause_isDeleted_df] DEFAULT 0,
    [deletedAt] DATETIME2,
    [deletedBy] NVARCHAR(20),
    CONSTRAINT [fishbone_item_cause_pkey] PRIMARY KEY CLUSTERED ([fishboneItemCauseId]),
    CONSTRAINT [fishbone_item_cause_fishboneItemId_fishboneCauseId_key] UNIQUE NONCLUSTERED ([fishboneItemId],[fishboneCauseId])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [master_fishbone_sbuSubId_isActive_isDeleted_idx] ON [dbo].[master_fishbone]([sbuSubId], [isActive], [isDeleted]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [fishbone_category_isActive_isDeleted_idx] ON [dbo].[fishbone_category]([isActive], [isDeleted]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [fishbone_cause_fishboneId_isActive_isDeleted_idx] ON [dbo].[fishbone_cause]([fishboneId], [isActive], [isDeleted]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [fishbone_item_fishboneId_categoryCode_idx] ON [dbo].[fishbone_item]([fishboneId], [categoryCode]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [fishbone_item_fishboneId_isActive_isDeleted_idx] ON [dbo].[fishbone_item]([fishboneId], [isActive], [isDeleted]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [fishbone_item_cause_fishboneItemId_isActive_isDeleted_idx] ON [dbo].[fishbone_item_cause]([fishboneItemId], [isActive], [isDeleted]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [fishbone_item_cause_fishboneCauseId_isActive_isDeleted_idx] ON [dbo].[fishbone_item_cause]([fishboneCauseId], [isActive], [isDeleted]);

-- AddForeignKey
ALTER TABLE [dbo].[fishbone_cause] ADD CONSTRAINT [fishbone_cause_fishboneId_fkey] FOREIGN KEY ([fishboneId]) REFERENCES [dbo].[master_fishbone]([fishboneId]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[fishbone_item] ADD CONSTRAINT [fishbone_item_fishboneId_fkey] FOREIGN KEY ([fishboneId]) REFERENCES [dbo].[master_fishbone]([fishboneId]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[fishbone_item] ADD CONSTRAINT [fishbone_item_categoryCode_fkey] FOREIGN KEY ([categoryCode]) REFERENCES [dbo].[fishbone_category]([categoryCode]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[fishbone_item_cause] ADD CONSTRAINT [fishbone_item_cause_fishboneItemId_fkey] FOREIGN KEY ([fishboneItemId]) REFERENCES [dbo].[fishbone_item]([fishboneItemId]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[fishbone_item_cause] ADD CONSTRAINT [fishbone_item_cause_fishboneCauseId_fkey] FOREIGN KEY ([fishboneCauseId]) REFERENCES [dbo].[fishbone_cause]([fishboneCauseId]) ON DELETE NO ACTION ON UPDATE NO ACTION;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
