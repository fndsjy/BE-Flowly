BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[org_structure] (
    [structureId] NVARCHAR(20) NOT NULL,
    [name] NVARCHAR(100) NOT NULL,
    [description] NVARCHAR(255),
    [rootNodeId] NVARCHAR(20),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [org_structure_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [createdBy] NVARCHAR(20),
    [updatedAt] DATETIME2 NOT NULL,
    [updatedBy] NVARCHAR(20),
    [isDeleted] BIT NOT NULL CONSTRAINT [org_structure_isDeleted_df] DEFAULT 0,
    [deletedAt] DATETIME2,
    [deletedBy] NVARCHAR(20),
    CONSTRAINT [org_structure_pkey] PRIMARY KEY CLUSTERED ([structureId])
);

-- CreateTable
CREATE TABLE [dbo].[org_chart] (
    [nodeId] NVARCHAR(20) NOT NULL,
    [structureId] NVARCHAR(20) NOT NULL,
    [userId] NVARCHAR(20),
    [parentId] NVARCHAR(20),
    [name] NVARCHAR(100),
    [position] NVARCHAR(100) NOT NULL,
    [orderIndex] INT NOT NULL CONSTRAINT [org_chart_orderIndex_df] DEFAULT 0,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [org_chart_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [createdBy] NVARCHAR(20),
    [updatedAt] DATETIME2 NOT NULL,
    [updatedBy] NVARCHAR(20),
    [isDeleted] BIT NOT NULL CONSTRAINT [org_chart_isDeleted_df] DEFAULT 0,
    [deletedAt] DATETIME2,
    [deletedBy] NVARCHAR(20),
    CONSTRAINT [org_chart_pkey] PRIMARY KEY CLUSTERED ([nodeId])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [org_structure_structureId_idx] ON [dbo].[org_structure]([structureId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [org_chart_userId_idx] ON [dbo].[org_chart]([userId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [org_chart_parentId_idx] ON [dbo].[org_chart]([parentId]);

-- AddForeignKey
ALTER TABLE [dbo].[org_chart] ADD CONSTRAINT [org_chart_parentId_fkey] FOREIGN KEY ([parentId]) REFERENCES [dbo].[org_chart]([nodeId]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[org_chart] ADD CONSTRAINT [org_chart_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[users]([userId]) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[org_chart] ADD CONSTRAINT [org_chart_structureId_fkey] FOREIGN KEY ([structureId]) REFERENCES [dbo].[org_structure]([structureId]) ON DELETE CASCADE ON UPDATE NO ACTION;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
