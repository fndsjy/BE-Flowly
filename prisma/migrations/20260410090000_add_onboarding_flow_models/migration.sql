BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[onboarding_portal_template] (
    [onboardingPortalTemplateId] NVARCHAR(100) NOT NULL,
    [portalKey] NVARCHAR(50) NOT NULL,
    [portalName] NVARCHAR(100) NOT NULL,
    [defaultDurationDay] INT NOT NULL CONSTRAINT [onboarding_portal_template_defaultDurationDay_df] DEFAULT 90,
    [isActive] BIT NOT NULL CONSTRAINT [onboarding_portal_template_isActive_df] DEFAULT 1,
    [isDeleted] BIT NOT NULL CONSTRAINT [onboarding_portal_template_isDeleted_df] DEFAULT 0,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [onboarding_portal_template_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [createdBy] NVARCHAR(20),
    [updatedAt] DATETIME2 NOT NULL,
    [updatedBy] NVARCHAR(20),
    [deletedAt] DATETIME2,
    [deletedBy] NVARCHAR(20),
    CONSTRAINT [onboarding_portal_template_pkey] PRIMARY KEY CLUSTERED ([onboardingPortalTemplateId]),
    CONSTRAINT [onboarding_portal_template_portalKey_key] UNIQUE NONCLUSTERED ([portalKey])
);

-- CreateTable
CREATE TABLE [dbo].[onboarding_stage_template] (
    [onboardingStageTemplateId] NVARCHAR(100) NOT NULL,
    [onboardingPortalTemplateId] NVARCHAR(100) NOT NULL,
    [stageOrder] INT NOT NULL,
    [stageCode] NVARCHAR(50) NOT NULL,
    [stageName] NVARCHAR(100) NOT NULL,
    [stageDescription] NVARCHAR(1000),
    [isActive] BIT NOT NULL CONSTRAINT [onboarding_stage_template_isActive_df] DEFAULT 1,
    [isDeleted] BIT NOT NULL CONSTRAINT [onboarding_stage_template_isDeleted_df] DEFAULT 0,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [onboarding_stage_template_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [createdBy] NVARCHAR(20),
    [updatedAt] DATETIME2 NOT NULL,
    [updatedBy] NVARCHAR(20),
    [deletedAt] DATETIME2,
    [deletedBy] NVARCHAR(20),
    CONSTRAINT [onboarding_stage_template_pkey] PRIMARY KEY CLUSTERED ([onboardingStageTemplateId]),
    CONSTRAINT [onboarding_stage_template_portal_stageOrder_key] UNIQUE NONCLUSTERED ([onboardingPortalTemplateId], [stageOrder]),
    CONSTRAINT [onboarding_stage_template_portal_stageCode_key] UNIQUE NONCLUSTERED ([onboardingPortalTemplateId], [stageCode]),
    CONSTRAINT [onboarding_stage_template_portalTemplate_fkey] FOREIGN KEY ([onboardingPortalTemplateId]) REFERENCES [dbo].[onboarding_portal_template]([onboardingPortalTemplateId]) ON DELETE NO ACTION ON UPDATE NO ACTION
);

-- CreateTable
CREATE TABLE [dbo].[onboarding_stage_material] (
    [onboardingStageMaterialId] NVARCHAR(100) NOT NULL,
    [onboardingStageTemplateId] NVARCHAR(100) NOT NULL,
    [materiId] INT NOT NULL,
    [orderIndex] INT NOT NULL CONSTRAINT [onboarding_stage_material_orderIndex_df] DEFAULT 0,
    [isRequired] BIT NOT NULL CONSTRAINT [onboarding_stage_material_isRequired_df] DEFAULT 1,
    [note] NVARCHAR(1000),
    [isActive] BIT NOT NULL CONSTRAINT [onboarding_stage_material_isActive_df] DEFAULT 1,
    [isDeleted] BIT NOT NULL CONSTRAINT [onboarding_stage_material_isDeleted_df] DEFAULT 0,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [onboarding_stage_material_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [createdBy] NVARCHAR(20),
    [updatedAt] DATETIME2 NOT NULL,
    [updatedBy] NVARCHAR(20),
    [deletedAt] DATETIME2,
    [deletedBy] NVARCHAR(20),
    CONSTRAINT [onboarding_stage_material_pkey] PRIMARY KEY CLUSTERED ([onboardingStageMaterialId]),
    CONSTRAINT [onboarding_stage_material_stage_materi_key] UNIQUE NONCLUSTERED ([onboardingStageTemplateId], [materiId]),
    CONSTRAINT [onboarding_stage_material_stageTemplate_fkey] FOREIGN KEY ([onboardingStageTemplateId]) REFERENCES [dbo].[onboarding_stage_template]([onboardingStageTemplateId]) ON DELETE NO ACTION ON UPDATE NO ACTION
);

-- CreateTable
CREATE TABLE [dbo].[onboarding_stage_exam] (
    [onboardingStageExamId] NVARCHAR(100) NOT NULL,
    [onboardingStageTemplateId] NVARCHAR(100) NOT NULL,
    [examId] INT NOT NULL,
    [passScore] INT,
    [maxRemedial] INT NOT NULL CONSTRAINT [onboarding_stage_exam_maxRemedial_df] DEFAULT 3,
    [orderIndex] INT NOT NULL CONSTRAINT [onboarding_stage_exam_orderIndex_df] DEFAULT 0,
    [note] NVARCHAR(1000),
    [isActive] BIT NOT NULL CONSTRAINT [onboarding_stage_exam_isActive_df] DEFAULT 1,
    [isDeleted] BIT NOT NULL CONSTRAINT [onboarding_stage_exam_isDeleted_df] DEFAULT 0,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [onboarding_stage_exam_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [createdBy] NVARCHAR(20),
    [updatedAt] DATETIME2 NOT NULL,
    [updatedBy] NVARCHAR(20),
    [deletedAt] DATETIME2,
    [deletedBy] NVARCHAR(20),
    CONSTRAINT [onboarding_stage_exam_pkey] PRIMARY KEY CLUSTERED ([onboardingStageExamId]),
    CONSTRAINT [onboarding_stage_exam_stage_exam_key] UNIQUE NONCLUSTERED ([onboardingStageTemplateId], [examId]),
    CONSTRAINT [onboarding_stage_exam_stageTemplate_fkey] FOREIGN KEY ([onboardingStageTemplateId]) REFERENCES [dbo].[onboarding_stage_template]([onboardingStageTemplateId]) ON DELETE NO ACTION ON UPDATE NO ACTION
);

-- CreateTable
CREATE TABLE [dbo].[onboarding_assignment] (
    [onboardingAssignmentId] NVARCHAR(100) NOT NULL,
    [onboardingPortalTemplateId] NVARCHAR(100) NOT NULL,
    [portalKey] NVARCHAR(50) NOT NULL,
    [participantReferenceType] NVARCHAR(50) NOT NULL,
    [participantReferenceId] NVARCHAR(100) NOT NULL,
    [startedAt] DATETIME2 NOT NULL,
    [durationDay] INT NOT NULL CONSTRAINT [onboarding_assignment_durationDay_df] DEFAULT 90,
    [dueAt] DATETIME2 NOT NULL,
    [status] NVARCHAR(30) NOT NULL,
    [currentStageOrder] INT,
    [assignedAt] DATETIME2 NOT NULL CONSTRAINT [onboarding_assignment_assignedAt_df] DEFAULT CURRENT_TIMESTAMP,
    [assignedBy] NVARCHAR(20),
    [note] NVARCHAR(1000),
    [completedAt] DATETIME2,
    [completedBy] NVARCHAR(20),
    [failedAt] DATETIME2,
    [failedBy] NVARCHAR(20),
    [parentOnboardingAssignmentId] NVARCHAR(100),
    [isActive] BIT NOT NULL CONSTRAINT [onboarding_assignment_isActive_df] DEFAULT 1,
    [isDeleted] BIT NOT NULL CONSTRAINT [onboarding_assignment_isDeleted_df] DEFAULT 0,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [onboarding_assignment_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [createdBy] NVARCHAR(20),
    [updatedAt] DATETIME2 NOT NULL,
    [updatedBy] NVARCHAR(20),
    [deletedAt] DATETIME2,
    [deletedBy] NVARCHAR(20),
    CONSTRAINT [onboarding_assignment_pkey] PRIMARY KEY CLUSTERED ([onboardingAssignmentId]),
    CONSTRAINT [onboarding_assignment_portalTemplate_fkey] FOREIGN KEY ([onboardingPortalTemplateId]) REFERENCES [dbo].[onboarding_portal_template]([onboardingPortalTemplateId]) ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT [onboarding_assignment_parent_fkey] FOREIGN KEY ([parentOnboardingAssignmentId]) REFERENCES [dbo].[onboarding_assignment]([onboardingAssignmentId]) ON DELETE NO ACTION ON UPDATE NO ACTION
);

-- CreateTable
CREATE TABLE [dbo].[onboarding_stage_progress] (
    [onboardingStageProgressId] NVARCHAR(100) NOT NULL,
    [onboardingAssignmentId] NVARCHAR(100) NOT NULL,
    [onboardingStageTemplateId] NVARCHAR(100) NOT NULL,
    [stageOrder] INT NOT NULL,
    [stageCode] NVARCHAR(50) NOT NULL,
    [stageName] NVARCHAR(100) NOT NULL,
    [status] NVARCHAR(30) NOT NULL,
    [remedialCount] INT NOT NULL CONSTRAINT [onboarding_stage_progress_remedialCount_df] DEFAULT 0,
    [maxRemedial] INT NOT NULL CONSTRAINT [onboarding_stage_progress_maxRemedial_df] DEFAULT 3,
    [startedAt] DATETIME2,
    [passedAt] DATETIME2,
    [completedAt] DATETIME2,
    [failedAt] DATETIME2,
    [note] NVARCHAR(1000),
    [isActive] BIT NOT NULL CONSTRAINT [onboarding_stage_progress_isActive_df] DEFAULT 1,
    [isDeleted] BIT NOT NULL CONSTRAINT [onboarding_stage_progress_isDeleted_df] DEFAULT 0,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [onboarding_stage_progress_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [createdBy] NVARCHAR(20),
    [updatedAt] DATETIME2 NOT NULL,
    [updatedBy] NVARCHAR(20),
    [deletedAt] DATETIME2,
    [deletedBy] NVARCHAR(20),
    CONSTRAINT [onboarding_stage_progress_pkey] PRIMARY KEY CLUSTERED ([onboardingStageProgressId]),
    CONSTRAINT [onboarding_stage_progress_assignment_stageOrder_key] UNIQUE NONCLUSTERED ([onboardingAssignmentId], [stageOrder]),
    CONSTRAINT [onboarding_stage_progress_assignment_fkey] FOREIGN KEY ([onboardingAssignmentId]) REFERENCES [dbo].[onboarding_assignment]([onboardingAssignmentId]) ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT [onboarding_stage_progress_stageTemplate_fkey] FOREIGN KEY ([onboardingStageTemplateId]) REFERENCES [dbo].[onboarding_stage_template]([onboardingStageTemplateId]) ON DELETE NO ACTION ON UPDATE NO ACTION
);

-- CreateTable
CREATE TABLE [dbo].[onboarding_decision] (
    [onboardingDecisionId] NVARCHAR(100) NOT NULL,
    [onboardingAssignmentId] NVARCHAR(100) NOT NULL,
    [decisionType] NVARCHAR(30) NOT NULL,
    [nextDurationDay] INT,
    [note] NVARCHAR(2000),
    [decidedAt] DATETIME2 NOT NULL CONSTRAINT [onboarding_decision_decidedAt_df] DEFAULT CURRENT_TIMESTAMP,
    [decidedBy] NVARCHAR(20),
    [isActive] BIT NOT NULL CONSTRAINT [onboarding_decision_isActive_df] DEFAULT 1,
    [isDeleted] BIT NOT NULL CONSTRAINT [onboarding_decision_isDeleted_df] DEFAULT 0,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [onboarding_decision_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [createdBy] NVARCHAR(20),
    [updatedAt] DATETIME2 NOT NULL,
    [updatedBy] NVARCHAR(20),
    [deletedAt] DATETIME2,
    [deletedBy] NVARCHAR(20),
    CONSTRAINT [onboarding_decision_pkey] PRIMARY KEY CLUSTERED ([onboardingDecisionId]),
    CONSTRAINT [onboarding_decision_assignment_fkey] FOREIGN KEY ([onboardingAssignmentId]) REFERENCES [dbo].[onboarding_assignment]([onboardingAssignmentId]) ON DELETE NO ACTION ON UPDATE NO ACTION
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [onboarding_portal_template_isDeleted_isActive_idx]
ON [dbo].[onboarding_portal_template]([isDeleted], [isActive]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [onboarding_stage_template_portal_isDeleted_isActive_idx]
ON [dbo].[onboarding_stage_template]([onboardingPortalTemplateId], [isDeleted], [isActive]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [onboarding_stage_material_stage_isDeleted_isActive_idx]
ON [dbo].[onboarding_stage_material]([onboardingStageTemplateId], [isDeleted], [isActive]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [onboarding_stage_material_materi_isDeleted_isActive_idx]
ON [dbo].[onboarding_stage_material]([materiId], [isDeleted], [isActive]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [onboarding_stage_exam_stage_isDeleted_isActive_idx]
ON [dbo].[onboarding_stage_exam]([onboardingStageTemplateId], [isDeleted], [isActive]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [onboarding_stage_exam_exam_isDeleted_isActive_idx]
ON [dbo].[onboarding_stage_exam]([examId], [isDeleted], [isActive]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [onboarding_assignment_portalTemplate_isDeleted_isActive_idx]
ON [dbo].[onboarding_assignment]([onboardingPortalTemplateId], [isDeleted], [isActive]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [onboarding_assignment_portal_status_isDeleted_isActive_idx]
ON [dbo].[onboarding_assignment]([portalKey], [status], [isDeleted], [isActive]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [onboarding_assignment_participant_isDeleted_isActive_idx]
ON [dbo].[onboarding_assignment]([participantReferenceType], [participantReferenceId], [isDeleted], [isActive]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [onboarding_assignment_parent_idx]
ON [dbo].[onboarding_assignment]([parentOnboardingAssignmentId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [onboarding_stage_progress_assignment_status_isDeleted_isActive_idx]
ON [dbo].[onboarding_stage_progress]([onboardingAssignmentId], [status], [isDeleted], [isActive]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [onboarding_stage_progress_stageTemplate_isDeleted_isActive_idx]
ON [dbo].[onboarding_stage_progress]([onboardingStageTemplateId], [isDeleted], [isActive]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [onboarding_decision_assignment_decidedAt_idx]
ON [dbo].[onboarding_decision]([onboardingAssignmentId], [decidedAt]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [onboarding_decision_decisionType_isDeleted_isActive_idx]
ON [dbo].[onboarding_decision]([decisionType], [isDeleted], [isActive]);

-- Seed current portals with default onboarding duration 90 days
;WITH [portal_seed] AS (
    SELECT
        [portal].[resourceKey] AS [portalKey],
        [portal].[displayName] AS [portalName],
        ROW_NUMBER() OVER (
            ORDER BY [portal].[displayName], [portal].[masAccessId]
        ) AS [seq]
    FROM [dbo].[master_access_role] AS [portal]
    WHERE [portal].[resourceType] = N'PORTAL'
      AND [portal].[isDeleted] = 0
      AND NOT EXISTS (
          SELECT 1
          FROM [dbo].[onboarding_portal_template] AS [existing]
          WHERE [existing].[portalKey] = [portal].[resourceKey]
      )
)
INSERT INTO [dbo].[onboarding_portal_template] (
    [onboardingPortalTemplateId],
    [portalKey],
    [portalName],
    [defaultDurationDay],
    [isActive],
    [isDeleted],
    [createdAt],
    [createdBy],
    [updatedAt],
    [updatedBy],
    [deletedAt],
    [deletedBy]
)
SELECT
    CONCAT(
        N'OPT',
        RIGHT(N'0' + CAST(DAY(GETDATE()) AS NVARCHAR(2)), 2),
        RIGHT(N'0' + CAST(MONTH(GETDATE()) AS NVARCHAR(2)), 2),
        RIGHT(CAST(YEAR(GETDATE()) AS NVARCHAR(4)), 2),
        N'-',
        RIGHT(N'00000' + CAST([seed].[seq] AS NVARCHAR(10)), 5)
    ),
    [seed].[portalKey],
    [seed].[portalName],
    90,
    1,
    0,
    CURRENT_TIMESTAMP,
    NULL,
    CURRENT_TIMESTAMP,
    NULL,
    NULL,
    NULL
FROM [portal_seed] AS [seed];

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
