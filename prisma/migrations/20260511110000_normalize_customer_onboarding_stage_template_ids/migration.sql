SET XACT_ABORT ON;

BEGIN TRANSACTION;

DECLARE @StageTemplateIdPrefix NVARCHAR(20);
DECLARE @NextStageTemplateSeq INT;
DECLARE @ReferenceDate DATE;

DECLARE @StageTemplateIdMap TABLE (
  [oldId] NVARCHAR(100) NOT NULL PRIMARY KEY,
  [newId] NVARCHAR(100) NOT NULL UNIQUE
);

SELECT @ReferenceDate = CAST(MIN([createdAt]) AS DATE)
FROM [dbo].[onboarding_stage_template]
WHERE [onboardingStageTemplateId] LIKE N'OST-CUSTOMER-ONBOARDING-%';

IF @ReferenceDate IS NULL
BEGIN
  SET @ReferenceDate = CAST(GETDATE() AS DATE);
END;

SET @StageTemplateIdPrefix = CONCAT(
  'OST',
  RIGHT(CONCAT('0', DATEPART(DAY, @ReferenceDate)), 2),
  RIGHT(CONCAT('0', DATEPART(MONTH, @ReferenceDate)), 2),
  RIGHT(CONVERT(VARCHAR(4), DATEPART(YEAR, @ReferenceDate)), 2)
);

SELECT @NextStageTemplateSeq =
  ISNULL(MAX(TRY_CONVERT(
    INT,
    SUBSTRING(
      [onboardingStageTemplateId],
      CHARINDEX('-', [onboardingStageTemplateId]) + 1,
      LEN([onboardingStageTemplateId])
    )
  )), 0)
FROM [dbo].[onboarding_stage_template]
WHERE [onboardingStageTemplateId] LIKE CONCAT(@StageTemplateIdPrefix, '-%');

;WITH targetRows AS (
  SELECT
    [onboardingStageTemplateId] AS [oldId],
    ROW_NUMBER() OVER (
      ORDER BY [createdAt], [stageOrder], [stageCode], [onboardingStageTemplateId]
    ) AS [rowNumber]
  FROM [dbo].[onboarding_stage_template]
  WHERE [onboardingStageTemplateId] LIKE N'OST-CUSTOMER-ONBOARDING-%'
)
INSERT INTO @StageTemplateIdMap ([oldId], [newId])
SELECT
  [oldId],
  CONCAT(
    @StageTemplateIdPrefix,
    '-',
    CASE
      WHEN @NextStageTemplateSeq + [rowNumber] < 100000
        THEN RIGHT(CONCAT('00000', @NextStageTemplateSeq + [rowNumber]), 5)
      ELSE CONVERT(VARCHAR(20), @NextStageTemplateSeq + [rowNumber])
    END
  )
FROM targetRows;

IF EXISTS (SELECT 1 FROM @StageTemplateIdMap)
BEGIN
  IF EXISTS (
    SELECT 1
    FROM @StageTemplateIdMap idMap
    INNER JOIN [dbo].[onboarding_stage_template] existingStage
      ON existingStage.[onboardingStageTemplateId] = idMap.[newId]
  )
  BEGIN
    THROW 51000, 'Target onboarding stage template ID already exists.', 1;
  END;

  IF EXISTS (
    SELECT 1
    FROM sys.foreign_keys
    WHERE [name] = N'onboarding_stage_material_stageTemplate_fkey'
      AND [parent_object_id] = OBJECT_ID(N'[dbo].[onboarding_stage_material]')
  )
  BEGIN
    ALTER TABLE [dbo].[onboarding_stage_material]
    NOCHECK CONSTRAINT [onboarding_stage_material_stageTemplate_fkey];
  END;

  IF EXISTS (
    SELECT 1
    FROM sys.foreign_keys
    WHERE [name] = N'onboarding_stage_exam_stageTemplate_fkey'
      AND [parent_object_id] = OBJECT_ID(N'[dbo].[onboarding_stage_exam]')
  )
  BEGIN
    ALTER TABLE [dbo].[onboarding_stage_exam]
    NOCHECK CONSTRAINT [onboarding_stage_exam_stageTemplate_fkey];
  END;

  IF EXISTS (
    SELECT 1
    FROM sys.foreign_keys
    WHERE [name] = N'onboarding_stage_progress_stageTemplate_fkey'
      AND [parent_object_id] = OBJECT_ID(N'[dbo].[onboarding_stage_progress]')
  )
  BEGIN
    ALTER TABLE [dbo].[onboarding_stage_progress]
    NOCHECK CONSTRAINT [onboarding_stage_progress_stageTemplate_fkey];
  END;

  UPDATE stageMaterial
  SET [onboardingStageTemplateId] = idMap.[newId]
  FROM [dbo].[onboarding_stage_material] stageMaterial
  INNER JOIN @StageTemplateIdMap idMap
    ON idMap.[oldId] = stageMaterial.[onboardingStageTemplateId];

  UPDATE stageExam
  SET [onboardingStageTemplateId] = idMap.[newId]
  FROM [dbo].[onboarding_stage_exam] stageExam
  INNER JOIN @StageTemplateIdMap idMap
    ON idMap.[oldId] = stageExam.[onboardingStageTemplateId];

  UPDATE stageProgress
  SET [onboardingStageTemplateId] = idMap.[newId]
  FROM [dbo].[onboarding_stage_progress] stageProgress
  INNER JOIN @StageTemplateIdMap idMap
    ON idMap.[oldId] = stageProgress.[onboardingStageTemplateId];

  UPDATE stageTemplate
  SET [onboardingStageTemplateId] = idMap.[newId]
  FROM [dbo].[onboarding_stage_template] stageTemplate
  INNER JOIN @StageTemplateIdMap idMap
    ON idMap.[oldId] = stageTemplate.[onboardingStageTemplateId];

  IF EXISTS (
    SELECT 1
    FROM sys.foreign_keys
    WHERE [name] = N'onboarding_stage_material_stageTemplate_fkey'
      AND [parent_object_id] = OBJECT_ID(N'[dbo].[onboarding_stage_material]')
  )
  BEGIN
    ALTER TABLE [dbo].[onboarding_stage_material]
    WITH CHECK CHECK CONSTRAINT [onboarding_stage_material_stageTemplate_fkey];
  END;

  IF EXISTS (
    SELECT 1
    FROM sys.foreign_keys
    WHERE [name] = N'onboarding_stage_exam_stageTemplate_fkey'
      AND [parent_object_id] = OBJECT_ID(N'[dbo].[onboarding_stage_exam]')
  )
  BEGIN
    ALTER TABLE [dbo].[onboarding_stage_exam]
    WITH CHECK CHECK CONSTRAINT [onboarding_stage_exam_stageTemplate_fkey];
  END;

  IF EXISTS (
    SELECT 1
    FROM sys.foreign_keys
    WHERE [name] = N'onboarding_stage_progress_stageTemplate_fkey'
      AND [parent_object_id] = OBJECT_ID(N'[dbo].[onboarding_stage_progress]')
  )
  BEGIN
    ALTER TABLE [dbo].[onboarding_stage_progress]
    WITH CHECK CHECK CONSTRAINT [onboarding_stage_progress_stageTemplate_fkey];
  END;
END;

COMMIT TRANSACTION;
