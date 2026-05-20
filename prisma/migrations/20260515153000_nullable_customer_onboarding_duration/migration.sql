DECLARE @constraintName NVARCHAR(128);

SELECT @constraintName = dc.name
FROM sys.default_constraints dc
JOIN sys.columns c
  ON c.default_object_id = dc.object_id
JOIN sys.tables t
  ON t.object_id = c.object_id
JOIN sys.schemas s
  ON s.schema_id = t.schema_id
WHERE s.name = N'dbo'
  AND t.name = N'onboarding_portal_template'
  AND c.name = N'defaultDurationDay';

IF @constraintName IS NOT NULL
BEGIN
  EXEC(N'ALTER TABLE [dbo].[onboarding_portal_template] DROP CONSTRAINT [' + @constraintName + N']');
END;

ALTER TABLE [dbo].[onboarding_portal_template]
ALTER COLUMN [defaultDurationDay] INT NULL;

SET @constraintName = NULL;

SELECT @constraintName = dc.name
FROM sys.default_constraints dc
JOIN sys.columns c
  ON c.default_object_id = dc.object_id
JOIN sys.tables t
  ON t.object_id = c.object_id
JOIN sys.schemas s
  ON s.schema_id = t.schema_id
WHERE s.name = N'dbo'
  AND t.name = N'onboarding_assignment'
  AND c.name = N'durationDay';

IF @constraintName IS NOT NULL
BEGIN
  EXEC(N'ALTER TABLE [dbo].[onboarding_assignment] DROP CONSTRAINT [' + @constraintName + N']');
END;

ALTER TABLE [dbo].[onboarding_assignment]
ALTER COLUMN [durationDay] INT NULL;

ALTER TABLE [dbo].[onboarding_assignment]
ALTER COLUMN [dueAt] DATETIME2 NULL;

UPDATE [dbo].[onboarding_portal_template]
SET [defaultDurationDay] = NULL
WHERE [portalKey] = N'CUSTOMER'
  AND [isDeleted] = 0;

UPDATE [dbo].[onboarding_assignment]
SET [durationDay] = NULL,
    [dueAt] = NULL
WHERE [portalKey] = N'CUSTOMER'
  AND [isDeleted] = 0;
