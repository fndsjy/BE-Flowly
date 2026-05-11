DECLARE @CustomerPortalTemplateId NVARCHAR(100);
DECLARE @StageTemplateIdPrefix NVARCHAR(20);
DECLARE @NextStageTemplateSeq INT;
DECLARE @NextStageTemplateId NVARCHAR(100);

SELECT @CustomerPortalTemplateId = [onboardingPortalTemplateId]
FROM [dbo].[onboarding_portal_template]
WHERE [portalKey] = 'CUSTOMER'
  AND [isDeleted] = 0;

SET @StageTemplateIdPrefix = CONCAT(
  'OST',
  RIGHT(CONCAT('0', DATEPART(DAY, GETDATE())), 2),
  RIGHT(CONCAT('0', DATEPART(MONTH, GETDATE())), 2),
  RIGHT(CONVERT(VARCHAR(4), DATEPART(YEAR, GETDATE())), 2)
);

SELECT @NextStageTemplateSeq =
  ISNULL(MAX(TRY_CONVERT(
    INT,
    SUBSTRING(
      [onboardingStageTemplateId],
      CHARINDEX('-', [onboardingStageTemplateId]) + 1,
      LEN([onboardingStageTemplateId])
    )
  )), 0) + 1
FROM [dbo].[onboarding_stage_template]
WHERE [onboardingStageTemplateId] LIKE CONCAT(@StageTemplateIdPrefix, '-%');

IF @CustomerPortalTemplateId IS NOT NULL
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM [dbo].[onboarding_stage_template]
    WHERE [onboardingPortalTemplateId] = @CustomerPortalTemplateId
      AND [programType] = 'ONBOARDING'
      AND [stageCode] = 'STAGE_1'
      AND [isDeleted] = 0
  )
  BEGIN
    SET @NextStageTemplateId = CONCAT(
      @StageTemplateIdPrefix,
      '-',
      CASE
        WHEN @NextStageTemplateSeq < 100000
          THEN RIGHT(CONCAT('00000', @NextStageTemplateSeq), 5)
        ELSE CONVERT(VARCHAR(20), @NextStageTemplateSeq)
      END
    );
    SET @NextStageTemplateSeq = @NextStageTemplateSeq + 1;

    INSERT INTO [dbo].[onboarding_stage_template] (
      [onboardingStageTemplateId],
      [onboardingPortalTemplateId],
      [programType],
      [stageOrder],
      [stageCode],
      [stageName],
      [stageDescription],
      [isActive],
      [isDeleted],
      [createdAt],
      [createdBy],
      [updatedAt],
      [updatedBy],
      [deletedAt],
      [deletedBy]
    )
    VALUES (
      @NextStageTemplateId,
      @CustomerPortalTemplateId,
      'ONBOARDING',
      1,
      'STAGE_1',
      'Pengenalan & Persiapan',
      'Tahap awal untuk pengenalan portal customer, akun, aturan dasar, dan target onboarding.',
      1,
      0,
      GETDATE(),
      'SYSTEM',
      GETDATE(),
      'SYSTEM',
      NULL,
      NULL
    );
  END;

  IF NOT EXISTS (
    SELECT 1
    FROM [dbo].[onboarding_stage_template]
    WHERE [onboardingPortalTemplateId] = @CustomerPortalTemplateId
      AND [programType] = 'ONBOARDING'
      AND [stageCode] = 'STAGE_2'
      AND [isDeleted] = 0
  )
  BEGIN
    SET @NextStageTemplateId = CONCAT(
      @StageTemplateIdPrefix,
      '-',
      CASE
        WHEN @NextStageTemplateSeq < 100000
          THEN RIGHT(CONCAT('00000', @NextStageTemplateSeq), 5)
        ELSE CONVERT(VARCHAR(20), @NextStageTemplateSeq)
      END
    );
    SET @NextStageTemplateSeq = @NextStageTemplateSeq + 1;

    INSERT INTO [dbo].[onboarding_stage_template] (
      [onboardingStageTemplateId],
      [onboardingPortalTemplateId],
      [programType],
      [stageOrder],
      [stageCode],
      [stageName],
      [stageDescription],
      [isActive],
      [isDeleted],
      [createdAt],
      [createdBy],
      [updatedAt],
      [updatedBy],
      [deletedAt],
      [deletedBy]
    )
    VALUES (
      @NextStageTemplateId,
      @CustomerPortalTemplateId,
      'ONBOARDING',
      2,
      'STAGE_2',
      'Materi Inti',
      'Tahap pembelajaran inti untuk materi wajib onboarding customer.',
      1,
      0,
      GETDATE(),
      'SYSTEM',
      GETDATE(),
      'SYSTEM',
      NULL,
      NULL
    );
  END;

  IF NOT EXISTS (
    SELECT 1
    FROM [dbo].[onboarding_stage_template]
    WHERE [onboardingPortalTemplateId] = @CustomerPortalTemplateId
      AND [programType] = 'ONBOARDING'
      AND [stageCode] = 'STAGE_3'
      AND [isDeleted] = 0
  )
  BEGIN
    SET @NextStageTemplateId = CONCAT(
      @StageTemplateIdPrefix,
      '-',
      CASE
        WHEN @NextStageTemplateSeq < 100000
          THEN RIGHT(CONCAT('00000', @NextStageTemplateSeq), 5)
        ELSE CONVERT(VARCHAR(20), @NextStageTemplateSeq)
      END
    );
    SET @NextStageTemplateSeq = @NextStageTemplateSeq + 1;

    INSERT INTO [dbo].[onboarding_stage_template] (
      [onboardingStageTemplateId],
      [onboardingPortalTemplateId],
      [programType],
      [stageOrder],
      [stageCode],
      [stageName],
      [stageDescription],
      [isActive],
      [isDeleted],
      [createdAt],
      [createdBy],
      [updatedAt],
      [updatedBy],
      [deletedAt],
      [deletedBy]
    )
    VALUES (
      @NextStageTemplateId,
      @CustomerPortalTemplateId,
      'ONBOARDING',
      3,
      'STAGE_3',
      'Pendalaman & Praktik',
      'Tahap pendalaman untuk praktik, penguatan pemahaman, dan kesiapan menjalankan peran customer.',
      1,
      0,
      GETDATE(),
      'SYSTEM',
      GETDATE(),
      'SYSTEM',
      NULL,
      NULL
    );
  END;

  IF NOT EXISTS (
    SELECT 1
    FROM [dbo].[onboarding_stage_template]
    WHERE [onboardingPortalTemplateId] = @CustomerPortalTemplateId
      AND [programType] = 'ONBOARDING'
      AND [stageCode] = 'STAGE_4'
      AND [isDeleted] = 0
  )
  BEGIN
    SET @NextStageTemplateId = CONCAT(
      @StageTemplateIdPrefix,
      '-',
      CASE
        WHEN @NextStageTemplateSeq < 100000
          THEN RIGHT(CONCAT('00000', @NextStageTemplateSeq), 5)
        ELSE CONVERT(VARCHAR(20), @NextStageTemplateSeq)
      END
    );
    SET @NextStageTemplateSeq = @NextStageTemplateSeq + 1;

    INSERT INTO [dbo].[onboarding_stage_template] (
      [onboardingStageTemplateId],
      [onboardingPortalTemplateId],
      [programType],
      [stageOrder],
      [stageCode],
      [stageName],
      [stageDescription],
      [isActive],
      [isDeleted],
      [createdAt],
      [createdBy],
      [updatedAt],
      [updatedBy],
      [deletedAt],
      [deletedBy]
    )
    VALUES (
      @NextStageTemplateId,
      @CustomerPortalTemplateId,
      'ONBOARDING',
      4,
      'STAGE_4',
      'Evaluasi & Penyelesaian',
      'Tahap akhir untuk evaluasi onboarding customer, penyelesaian administrasi, dan handoff lanjutan.',
      1,
      0,
      GETDATE(),
      'SYSTEM',
      GETDATE(),
      'SYSTEM',
      NULL,
      NULL
    );
  END;
END;
