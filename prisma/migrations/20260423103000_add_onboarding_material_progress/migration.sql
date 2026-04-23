BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[onboarding_material_progress] (
    [onboardingMaterialProgressId] NVARCHAR(100) NOT NULL,
    [onboardingAssignmentId] NVARCHAR(100) NOT NULL,
    [onboardingStageProgressId] NVARCHAR(100) NOT NULL,
    [onboardingStageMaterialId] NVARCHAR(100) NOT NULL,
    [materiId] INT NOT NULL,
    [sourceFileId] INT NOT NULL CONSTRAINT [onboarding_material_progress_sourceFileId_df] DEFAULT 0,
    [fileName] NVARCHAR(255),
    [fileTitle] NVARCHAR(255),
    [status] NVARCHAR(30) NOT NULL,
    [startedAt] DATETIME2,
    [lastOpenedAt] DATETIME2,
    [completedAt] DATETIME2,
    [openCount] INT NOT NULL CONSTRAINT [onboarding_material_progress_openCount_df] DEFAULT 0,
    [note] NVARCHAR(1000),
    [isActive] BIT NOT NULL CONSTRAINT [onboarding_material_progress_isActive_df] DEFAULT 1,
    [isDeleted] BIT NOT NULL CONSTRAINT [onboarding_material_progress_isDeleted_df] DEFAULT 0,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [onboarding_material_progress_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [createdBy] NVARCHAR(20),
    [updatedAt] DATETIME2 NOT NULL,
    [updatedBy] NVARCHAR(20),
    [deletedAt] DATETIME2,
    [deletedBy] NVARCHAR(20),
    CONSTRAINT [onboarding_material_progress_pkey] PRIMARY KEY CLUSTERED ([onboardingMaterialProgressId]),
    CONSTRAINT [onboarding_material_progress_stageProgress_stageMaterial_sourceFile_key] UNIQUE NONCLUSTERED ([onboardingStageProgressId], [onboardingStageMaterialId], [sourceFileId]),
    CONSTRAINT [onboarding_material_progress_assignment_fkey] FOREIGN KEY ([onboardingAssignmentId]) REFERENCES [dbo].[onboarding_assignment]([onboardingAssignmentId]) ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT [onboarding_material_progress_stageProgress_fkey] FOREIGN KEY ([onboardingStageProgressId]) REFERENCES [dbo].[onboarding_stage_progress]([onboardingStageProgressId]) ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT [onboarding_material_progress_stageMaterial_fkey] FOREIGN KEY ([onboardingStageMaterialId]) REFERENCES [dbo].[onboarding_stage_material]([onboardingStageMaterialId]) ON DELETE NO ACTION ON UPDATE NO ACTION
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [onboarding_material_progress_assignment_stageProgress_isDeleted_isActive_idx]
ON [dbo].[onboarding_material_progress]([onboardingAssignmentId], [onboardingStageProgressId], [isDeleted], [isActive]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [onboarding_material_progress_stageMaterial_isDeleted_isActive_idx]
ON [dbo].[onboarding_material_progress]([onboardingStageMaterialId], [isDeleted], [isActive]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [onboarding_material_progress_materi_isDeleted_isActive_idx]
ON [dbo].[onboarding_material_progress]([materiId], [isDeleted], [isActive]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [onboarding_material_progress_sourceFile_idx]
ON [dbo].[onboarding_material_progress]([sourceFileId]);

COMMIT TRAN;

END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
        ROLLBACK TRAN;
    THROW;
END CATCH
