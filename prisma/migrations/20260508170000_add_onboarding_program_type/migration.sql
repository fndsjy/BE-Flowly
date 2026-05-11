ALTER TABLE [dbo].[onboarding_stage_template]
ADD [programType] NVARCHAR(30) NOT NULL
  CONSTRAINT [onboarding_stage_template_programType_df] DEFAULT 'ONBOARDING';

ALTER TABLE [dbo].[onboarding_assignment]
ADD [programType] NVARCHAR(30) NOT NULL
  CONSTRAINT [onboarding_assignment_programType_df] DEFAULT 'ONBOARDING';

EXEC(N'
UPDATE stageTemplate
SET [programType] = ''LEARNING''
FROM [dbo].[onboarding_stage_template] stageTemplate
INNER JOIN [dbo].[onboarding_portal_template] portalTemplate
  ON portalTemplate.[onboardingPortalTemplateId] = stageTemplate.[onboardingPortalTemplateId]
WHERE portalTemplate.[portalKey] = ''CUSTOMER''
  AND stageTemplate.[isDeleted] = 0;
');

EXEC(N'
UPDATE [dbo].[onboarding_assignment]
SET [programType] = ''LEARNING''
WHERE [portalKey] = ''CUSTOMER''
  AND [participantReferenceType] = ''CUSTOMER''
  AND [isDeleted] = 0;
');

IF EXISTS (
  SELECT 1
  FROM sys.key_constraints
  WHERE [name] = N'onboarding_stage_template_portal_stageOrder_key'
)
BEGIN
  ALTER TABLE [dbo].[onboarding_stage_template]
  DROP CONSTRAINT [onboarding_stage_template_portal_stageOrder_key];
END;

IF EXISTS (
  SELECT 1
  FROM sys.key_constraints
  WHERE [name] = N'onboarding_stage_template_portal_stageCode_key'
)
BEGIN
  ALTER TABLE [dbo].[onboarding_stage_template]
  DROP CONSTRAINT [onboarding_stage_template_portal_stageCode_key];
END;

EXEC(N'
ALTER TABLE [dbo].[onboarding_stage_template]
ADD CONSTRAINT [onboarding_stage_template_portal_program_stageOrder_key]
UNIQUE NONCLUSTERED ([onboardingPortalTemplateId], [programType], [stageOrder]);
');

EXEC(N'
ALTER TABLE [dbo].[onboarding_stage_template]
ADD CONSTRAINT [onboarding_stage_template_portal_program_stageCode_key]
UNIQUE NONCLUSTERED ([onboardingPortalTemplateId], [programType], [stageCode]);
');

EXEC(N'
CREATE NONCLUSTERED INDEX [onboarding_stage_template_portal_program_isDeleted_isActive_idx]
ON [dbo].[onboarding_stage_template]([onboardingPortalTemplateId], [programType], [isDeleted], [isActive]);
');

EXEC(N'
CREATE NONCLUSTERED INDEX [onboarding_assignment_portal_program_status_isDeleted_isActive_idx]
ON [dbo].[onboarding_assignment]([portalKey], [programType], [status], [isDeleted], [isActive]);
');
