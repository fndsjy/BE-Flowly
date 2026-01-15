BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[jabatan] (
    [jabatanId] NVARCHAR(20) NOT NULL,
    [jabatanName] NVARCHAR(100) NOT NULL,
    [jabatanLevel] INT NOT NULL,
    [jabatanDesc] NVARCHAR(255),
    [jabatanIsActive] BIT NOT NULL,
    [createdAt] DATETIME2 NOT NULL,
    [createdBy] NVARCHAR(20),
    [updatedAt] DATETIME2 NOT NULL,
    [updatedBy] NVARCHAR(20),
    [isDeleted] BIT NOT NULL,
    [deletedAt] DATETIME2,
    [deletedBy] NVARCHAR(20),
    CONSTRAINT [jabatan_pkey] PRIMARY KEY CLUSTERED ([jabatanId])
);

-- AlterTable
ALTER TABLE [dbo].[chart] ADD [jobDesc] NVARCHAR(500);

-- AlterTable
ALTER TABLE [dbo].[chart_member] ADD [jabatan] NVARCHAR(50);

-- CreateIndex
CREATE NONCLUSTERED INDEX [jabatan_jabatanId_idx] ON [dbo].[jabatan]([jabatanId]);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
