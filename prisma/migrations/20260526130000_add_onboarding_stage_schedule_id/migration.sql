ALTER TABLE [dbo].[onboarding_stage_template]
ADD [scheduleId] INT NULL;

CREATE NONCLUSTERED INDEX [onboarding_stage_template_scheduleId_idx]
ON [dbo].[onboarding_stage_template]([scheduleId]);
