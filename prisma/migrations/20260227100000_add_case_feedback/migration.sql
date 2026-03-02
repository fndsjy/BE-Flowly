-- Add feedback approval fields
ALTER TABLE [dbo].[case_header]
ADD [feedbackApprovedAt] DATETIME2 NULL,
    [feedbackApprovedBy] NVARCHAR(20) NULL,
    [feedbackApprovedByEmployeeId] INT NULL;

-- CreateTable
CREATE TABLE [dbo].[case_feedback_comment] (
    [caseFeedbackCommentId] NVARCHAR(20) NOT NULL,
    [caseId] NVARCHAR(20) NOT NULL,
    [commentText] NVARCHAR(1000) NOT NULL,
    [commenterName] NVARCHAR(100) NOT NULL,
    [commenterType] NVARCHAR(20),
    [commenterId] NVARCHAR(20),
    [commenterEmployeeId] INT,
    [isActive] BIT NOT NULL CONSTRAINT [case_feedback_comment_isActive_df] DEFAULT 1,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [case_feedback_comment_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [createdBy] NVARCHAR(20),
    [updatedAt] DATETIME2 NOT NULL,
    [updatedBy] NVARCHAR(20),
    [isDeleted] BIT NOT NULL CONSTRAINT [case_feedback_comment_isDeleted_df] DEFAULT 0,
    [deletedAt] DATETIME2,
    [deletedBy] NVARCHAR(20),
    CONSTRAINT [case_feedback_comment_pkey] PRIMARY KEY CLUSTERED ([caseFeedbackCommentId])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [case_feedback_comment_caseId_isDeleted_idx] ON [dbo].[case_feedback_comment]([caseId], [isDeleted]);

-- AddForeignKey
ALTER TABLE [dbo].[case_feedback_comment] ADD CONSTRAINT [case_feedback_comment_caseId_fkey] FOREIGN KEY ([caseId]) REFERENCES [dbo].[case_header]([caseId]) ON DELETE NO ACTION ON UPDATE NO ACTION;
