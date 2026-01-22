BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[procedure_sop] (
    [sopId] NVARCHAR(20) NOT NULL,
    [sbuSubId] INT NOT NULL,
    [sbuId] INT,
    [pilarId] INT,
    [sopName] NVARCHAR(150) NOT NULL,
    [sopNumber] NVARCHAR(50) NOT NULL,
    [effectiveDate] DATETIME2 NOT NULL,
    [filePath] NVARCHAR(500) NOT NULL,
    [fileName] NVARCHAR(255) NOT NULL,
    [fileMime] NVARCHAR(100),
    [fileSize] INT,
    [isActive] BIT NOT NULL CONSTRAINT [procedure_sop_isActive_df] DEFAULT 1,
    [isDeleted] BIT NOT NULL CONSTRAINT [procedure_sop_isDeleted_df] DEFAULT 0,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [procedure_sop_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [createdBy] NVARCHAR(20),
    [updatedAt] DATETIME2 NOT NULL,
    [updatedBy] NVARCHAR(20),
    [deletedAt] DATETIME2,
    [deletedBy] NVARCHAR(20),
    CONSTRAINT [procedure_sop_pkey] PRIMARY KEY CLUSTERED ([sopId])
);

-- CreateTable
CREATE TABLE [dbo].[procedure_ik] (
    [ikId] NVARCHAR(20) NOT NULL,
    [sopId] NVARCHAR(20) NOT NULL,
    [ikName] NVARCHAR(150) NOT NULL,
    [ikNumber] NVARCHAR(50) NOT NULL,
    [effectiveDate] DATETIME2 NOT NULL,
    [ikContent] NVARCHAR(max),
    [isActive] BIT NOT NULL CONSTRAINT [procedure_ik_isActive_df] DEFAULT 1,
    [isDeleted] BIT NOT NULL CONSTRAINT [procedure_ik_isDeleted_df] DEFAULT 0,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [procedure_ik_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [createdBy] NVARCHAR(20),
    [updatedAt] DATETIME2 NOT NULL,
    [updatedBy] NVARCHAR(20),
    [deletedAt] DATETIME2,
    [deletedBy] NVARCHAR(20),
    CONSTRAINT [procedure_ik_pkey] PRIMARY KEY CLUSTERED ([ikId])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [procedure_sop_sbuSubId_isActive_isDeleted_idx] ON [dbo].[procedure_sop]([sbuSubId], [isActive], [isDeleted]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [procedure_sop_sbuId_idx] ON [dbo].[procedure_sop]([sbuId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [procedure_sop_pilarId_idx] ON [dbo].[procedure_sop]([pilarId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [procedure_sop_sopNumber_idx] ON [dbo].[procedure_sop]([sopNumber]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [procedure_ik_sopId_isActive_isDeleted_idx] ON [dbo].[procedure_ik]([sopId], [isActive], [isDeleted]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [procedure_ik_ikNumber_idx] ON [dbo].[procedure_ik]([ikNumber]);

-- AddForeignKey
ALTER TABLE [dbo].[procedure_ik] ADD CONSTRAINT [procedure_ik_sopId_fkey] FOREIGN KEY ([sopId]) REFERENCES [dbo].[procedure_sop]([sopId]) ON DELETE NO ACTION ON UPDATE NO ACTION;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
