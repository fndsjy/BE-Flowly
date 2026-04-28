ALTER TABLE [dbo].[onboarding_exam_attempt]
ALTER COLUMN [examId] INT NULL;

UPDATE [dbo].[onboarding_exam_attempt]
SET [examId] = NULL
WHERE [examId] IS NOT NULL;
