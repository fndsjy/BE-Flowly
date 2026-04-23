BEGIN TRY

BEGIN TRAN;

-- Drop default constraints before dropping obsolete max remedial columns
ALTER TABLE [dbo].[onboarding_stage_exam]
DROP CONSTRAINT [onboarding_stage_exam_maxRemedial_df];

ALTER TABLE [dbo].[onboarding_stage_exam]
DROP COLUMN [maxRemedial];

ALTER TABLE [dbo].[onboarding_stage_progress]
DROP CONSTRAINT [onboarding_stage_progress_maxRemedial_df];

ALTER TABLE [dbo].[onboarding_stage_progress]
DROP COLUMN [maxRemedial];

-- CreateTable
CREATE TABLE [dbo].[onboarding_exam_attempt] (
    [onboardingExamAttemptId] NVARCHAR(100) NOT NULL,
    [onboardingAssignmentId] NVARCHAR(100) NOT NULL,
    [onboardingStageProgressId] NVARCHAR(100) NOT NULL,
    [onboardingStageExamId] NVARCHAR(100) NOT NULL,
    [examId] INT NOT NULL,
    [attemptNo] INT NOT NULL,
    [startedAt] DATETIME2 NOT NULL,
    [submittedAt] DATETIME2,
    [endedAt] DATETIME2,
    [totalQuestionCount] INT,
    [answeredQuestionCount] INT,
    [correctQuestionCount] INT,
    [score] FLOAT(53),
    [status] NVARCHAR(30) NOT NULL,
    [employeeExamSessionId] NVARCHAR(50),
    [note] NVARCHAR(1000),
    [isActive] BIT NOT NULL CONSTRAINT [onboarding_exam_attempt_isActive_df] DEFAULT 1,
    [isDeleted] BIT NOT NULL CONSTRAINT [onboarding_exam_attempt_isDeleted_df] DEFAULT 0,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [onboarding_exam_attempt_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [createdBy] NVARCHAR(20),
    [updatedAt] DATETIME2 NOT NULL,
    [updatedBy] NVARCHAR(20),
    [deletedAt] DATETIME2,
    [deletedBy] NVARCHAR(20),
    CONSTRAINT [onboarding_exam_attempt_pkey] PRIMARY KEY CLUSTERED ([onboardingExamAttemptId]),
    CONSTRAINT [onboarding_exam_attempt_stageProgress_attemptNo_key] UNIQUE NONCLUSTERED ([onboardingStageProgressId], [attemptNo]),
    CONSTRAINT [onboarding_exam_attempt_assignment_fkey] FOREIGN KEY ([onboardingAssignmentId]) REFERENCES [dbo].[onboarding_assignment]([onboardingAssignmentId]) ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT [onboarding_exam_attempt_stageProgress_fkey] FOREIGN KEY ([onboardingStageProgressId]) REFERENCES [dbo].[onboarding_stage_progress]([onboardingStageProgressId]) ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT [onboarding_exam_attempt_stageExam_fkey] FOREIGN KEY ([onboardingStageExamId]) REFERENCES [dbo].[onboarding_stage_exam]([onboardingStageExamId]) ON DELETE NO ACTION ON UPDATE NO ACTION
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [onboarding_exam_attempt_assignment_isDeleted_isActive_idx]
ON [dbo].[onboarding_exam_attempt]([onboardingAssignmentId], [isDeleted], [isActive]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [onboarding_exam_attempt_stageProgress_status_isDeleted_isActive_idx]
ON [dbo].[onboarding_exam_attempt]([onboardingStageProgressId], [status], [isDeleted], [isActive]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [onboarding_exam_attempt_stageExam_isDeleted_isActive_idx]
ON [dbo].[onboarding_exam_attempt]([onboardingStageExamId], [isDeleted], [isActive]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [onboarding_exam_attempt_employeeExamSession_idx]
ON [dbo].[onboarding_exam_attempt]([employeeExamSessionId]);

COMMIT TRAN;

END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
        ROLLBACK TRAN;
    THROW;
END CATCH
