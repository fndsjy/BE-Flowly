/*
  Warnings:

  - You are about to drop the `procedure_ik` table. If the table is not empty, all the data it contains will be lost.

*/
BEGIN TRY

BEGIN TRAN;

-- DropForeignKey
ALTER TABLE [dbo].[procedure_ik] DROP CONSTRAINT [procedure_ik_sopId_fkey];

-- DropTable
DROP TABLE [dbo].[procedure_ik];

-- CreateTable
CREATE TABLE [dbo].[master_ik] (
    [ikId] NVARCHAR(20) NOT NULL,
    [ikName] NVARCHAR(150) NOT NULL,
    [ikNumber] NVARCHAR(50) NOT NULL,
    [effectiveDate] DATETIME2 NOT NULL,
    [ikContent] NVARCHAR(max),
    [isActive] BIT NOT NULL CONSTRAINT [master_ik_isActive_df] DEFAULT 1,
    [isDeleted] BIT NOT NULL CONSTRAINT [master_ik_isDeleted_df] DEFAULT 0,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [master_ik_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [createdBy] NVARCHAR(20),
    [updatedAt] DATETIME2 NOT NULL,
    [updatedBy] NVARCHAR(20),
    [deletedAt] DATETIME2,
    [deletedBy] NVARCHAR(20),
    CONSTRAINT [master_ik_pkey] PRIMARY KEY CLUSTERED ([ikId])
);

-- CreateTable
CREATE TABLE [dbo].[procedure_sop_ik] (
    [sopIkId] NVARCHAR(20) NOT NULL,
    [sopId] NVARCHAR(20) NOT NULL,
    [ikId] NVARCHAR(20) NOT NULL,
    [isActive] BIT NOT NULL CONSTRAINT [procedure_sop_ik_isActive_df] DEFAULT 1,
    [isDeleted] BIT NOT NULL CONSTRAINT [procedure_sop_ik_isDeleted_df] DEFAULT 0,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [procedure_sop_ik_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [createdBy] NVARCHAR(20),
    [updatedAt] DATETIME2 NOT NULL,
    [updatedBy] NVARCHAR(20),
    [deletedAt] DATETIME2,
    [deletedBy] NVARCHAR(20),
    CONSTRAINT [procedure_sop_ik_pkey] PRIMARY KEY CLUSTERED ([sopIkId])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [master_ik_ikNumber_idx] ON [dbo].[master_ik]([ikNumber]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [procedure_sop_ik_sopId_isActive_isDeleted_idx] ON [dbo].[procedure_sop_ik]([sopId], [isActive], [isDeleted]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [procedure_sop_ik_ikId_isActive_isDeleted_idx] ON [dbo].[procedure_sop_ik]([ikId], [isActive], [isDeleted]);

-- AddForeignKey
ALTER TABLE [dbo].[procedure_sop_ik] ADD CONSTRAINT [procedure_sop_ik_sopId_fkey] FOREIGN KEY ([sopId]) REFERENCES [dbo].[procedure_sop]([sopId]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[procedure_sop_ik] ADD CONSTRAINT [procedure_sop_ik_ikId_fkey] FOREIGN KEY ([ikId]) REFERENCES [dbo].[master_ik]([ikId]) ON DELETE NO ACTION ON UPDATE NO ACTION;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
