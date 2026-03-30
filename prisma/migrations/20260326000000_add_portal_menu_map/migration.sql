BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[portal_menu_map] (
    [portalMenuMapId] NVARCHAR(20) NOT NULL,
    [portalMasAccessId] NVARCHAR(20) NOT NULL,
    [menuMasAccessId] NVARCHAR(20) NOT NULL,
    [orderIndex] INT NOT NULL CONSTRAINT [portal_menu_map_orderIndex_df] DEFAULT 0,
    [isActive] BIT NOT NULL CONSTRAINT [portal_menu_map_isActive_df] DEFAULT 1,
    [isDeleted] BIT NOT NULL CONSTRAINT [portal_menu_map_isDeleted_df] DEFAULT 0,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [portal_menu_map_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [createdBy] NVARCHAR(20),
    [updatedAt] DATETIME2 NOT NULL,
    [updatedBy] NVARCHAR(20),
    [deletedAt] DATETIME2,
    [deletedBy] NVARCHAR(20),
    CONSTRAINT [portal_menu_map_pkey] PRIMARY KEY CLUSTERED ([portalMenuMapId]),
    CONSTRAINT [portal_menu_map_portalMasAccessId_menuMasAccessId_key] UNIQUE NONCLUSTERED ([portalMasAccessId], [menuMasAccessId]),
    CONSTRAINT [portal_menu_map_portalMasAccessId_fkey] FOREIGN KEY ([portalMasAccessId]) REFERENCES [dbo].[master_access_role]([masAccessId]) ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT [portal_menu_map_menuMasAccessId_fkey] FOREIGN KEY ([menuMasAccessId]) REFERENCES [dbo].[master_access_role]([masAccessId]) ON DELETE NO ACTION ON UPDATE NO ACTION
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [portal_menu_map_portalMasAccessId_isDeleted_isActive_idx]
ON [dbo].[portal_menu_map]([portalMasAccessId], [isDeleted], [isActive]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [portal_menu_map_menuMasAccessId_isDeleted_isActive_idx]
ON [dbo].[portal_menu_map]([menuMasAccessId], [isDeleted], [isActive]);

-- Seed existing MENU into EMPLOYEE portal so current employee sidebar keeps working
DECLARE @employeeMasAccessId NVARCHAR(20);

SELECT TOP 1
    @employeeMasAccessId = [masAccessId]
FROM [dbo].[master_access_role]
WHERE [resourceType] = N'PORTAL'
  AND [resourceKey] = N'EMPLOYEE'
  AND [isDeleted] = 0
ORDER BY [masAccessId];

IF @employeeMasAccessId IS NOT NULL
BEGIN
    ;WITH [employee_menu_seed] AS (
        SELECT
            [menu].[masAccessId] AS [menuMasAccessId],
            ISNULL([menu].[orderIndex], 0) AS [menuOrderIndex],
            ROW_NUMBER() OVER (
                ORDER BY ISNULL([menu].[orderIndex], 0), [menu].[displayName], [menu].[masAccessId]
            ) AS [seq]
        FROM [dbo].[master_access_role] AS [menu]
        WHERE [menu].[resourceType] = N'MENU'
          AND [menu].[isDeleted] = 0
          AND NOT EXISTS (
              SELECT 1
              FROM [dbo].[portal_menu_map] AS [existing]
              WHERE [existing].[portalMasAccessId] = @employeeMasAccessId
                AND [existing].[menuMasAccessId] = [menu].[masAccessId]
          )
    )
    INSERT INTO [dbo].[portal_menu_map] (
        [portalMenuMapId],
        [portalMasAccessId],
        [menuMasAccessId],
        [orderIndex],
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
            N'PMM',
            RIGHT(N'0' + CAST(DAY(GETDATE()) AS NVARCHAR(2)), 2),
            RIGHT(N'0' + CAST(MONTH(GETDATE()) AS NVARCHAR(2)), 2),
            RIGHT(CAST(YEAR(GETDATE()) AS NVARCHAR(4)), 2),
            N'-',
            RIGHT(N'00000' + CAST([seed].[seq] AS NVARCHAR(5)), 5)
        ),
        @employeeMasAccessId,
        [seed].[menuMasAccessId],
        CASE
            WHEN [seed].[menuOrderIndex] > 0 THEN [seed].[menuOrderIndex]
            ELSE [seed].[seq] * 10
        END,
        1,
        0,
        CURRENT_TIMESTAMP,
        NULL,
        CURRENT_TIMESTAMP,
        NULL,
        NULL,
        NULL
    FROM [employee_menu_seed] AS [seed];
END

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
