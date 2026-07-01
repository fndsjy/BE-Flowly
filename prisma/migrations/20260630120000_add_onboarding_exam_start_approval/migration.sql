BEGIN TRY

BEGIN TRAN;

CREATE TABLE [dbo].[onboarding_exam_start_approval] (
    [onboardingExamStartApprovalId] NVARCHAR(100) NOT NULL,
    [onboardingAssignmentId] NVARCHAR(100) NOT NULL,
    [onboardingStageProgressId] NVARCHAR(100) NOT NULL,
    [participantReferenceId] NVARCHAR(100) NOT NULL,
    [purpose] NVARCHAR(20) NOT NULL,
    [passwordHash] NVARCHAR(255) NOT NULL,
    [expiresAt] DATETIME2 NOT NULL,
    [usedAt] DATETIME2,
    [failedAttemptCount] INT NOT NULL CONSTRAINT [onboarding_exam_start_approval_failedAttemptCount_df] DEFAULT 0,
    [status] NVARCHAR(20) NOT NULL,
    [notificationOutboxId] NVARCHAR(20),
    [isActive] BIT NOT NULL CONSTRAINT [onboarding_exam_start_approval_isActive_df] DEFAULT 1,
    [isDeleted] BIT NOT NULL CONSTRAINT [onboarding_exam_start_approval_isDeleted_df] DEFAULT 0,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [onboarding_exam_start_approval_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [createdBy] NVARCHAR(20),
    [updatedAt] DATETIME2 NOT NULL,
    [updatedBy] NVARCHAR(20),
    [deletedAt] DATETIME2,
    [deletedBy] NVARCHAR(20),
    CONSTRAINT [onboarding_exam_start_approval_pkey] PRIMARY KEY CLUSTERED ([onboardingExamStartApprovalId]),
    CONSTRAINT [onboarding_exam_start_approval_assignment_fkey] FOREIGN KEY ([onboardingAssignmentId]) REFERENCES [dbo].[onboarding_assignment]([onboardingAssignmentId]) ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT [onboarding_exam_start_approval_stageProgress_fkey] FOREIGN KEY ([onboardingStageProgressId]) REFERENCES [dbo].[onboarding_stage_progress]([onboardingStageProgressId]) ON DELETE NO ACTION ON UPDATE NO ACTION
);

CREATE NONCLUSTERED INDEX [onboarding_exam_start_approval_assignment_status_isDeleted_isActive_idx]
ON [dbo].[onboarding_exam_start_approval]([onboardingAssignmentId], [status], [isDeleted], [isActive]);

CREATE NONCLUSTERED INDEX [onboarding_exam_start_approval_stageProgress_status_isDeleted_isActive_idx]
ON [dbo].[onboarding_exam_start_approval]([onboardingStageProgressId], [status], [isDeleted], [isActive]);

CREATE NONCLUSTERED INDEX [onboarding_exam_start_approval_participant_status_isDeleted_isActive_idx]
ON [dbo].[onboarding_exam_start_approval]([participantReferenceId], [status], [isDeleted], [isActive]);

CREATE NONCLUSTERED INDEX [onboarding_exam_start_approval_expiresAt_idx]
ON [dbo].[onboarding_exam_start_approval]([expiresAt]);

CREATE NONCLUSTERED INDEX [onboarding_exam_start_approval_notificationOutbox_idx]
ON [dbo].[onboarding_exam_start_approval]([notificationOutboxId]);

COMMIT TRAN;

END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
        ROLLBACK TRAN;
    THROW;
END CATCH
