BEGIN TRY

BEGIN TRAN;

DECLARE @administratorPortalMasAccessId NVARCHAR(20);
DECLARE @portalAccessMenuMasAccessId NVARCHAR(20);
DECLARE @auditLogMenuMasAccessId NVARCHAR(20);

SELECT TOP 1
    @administratorPortalMasAccessId = [masAccessId]
FROM [dbo].[master_access_role]
WHERE [resourceType] = N'PORTAL'
  AND [resourceKey] = N'ADMINISTRATOR'
  AND [isDeleted] = 0
ORDER BY [masAccessId];

IF NOT EXISTS (
    SELECT 1
    FROM [dbo].[master_access_role]
    WHERE [resourceType] = N'MENU'
      AND [resourceKey] = N'ADMINISTRATOR_PORTAL_ACCESS'
)
BEGIN
    INSERT INTO [dbo].[master_access_role] (
        [masAccessId],
        [resourceType],
        [resourceKey],
        [displayName],
        [route],
        [parentKey],
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
        N'MASPORTALACCESSADM',
        N'MENU',
        N'ADMINISTRATOR_PORTAL_ACCESS',
        N'Akses Portal Admin',
        N'/portal-administrator/portal-access',
        NULL,
        1,
        0,
        CURRENT_TIMESTAMP,
        NULL,
        CURRENT_TIMESTAMP,
        NULL,
        NULL,
        NULL
    );
END
ELSE
BEGIN
    UPDATE [dbo].[master_access_role]
    SET
        [displayName] = N'Akses Portal Admin',
        [route] = N'/portal-administrator/portal-access',
        [parentKey] = NULL,
        [isActive] = 1,
        [isDeleted] = 0,
        [deletedAt] = NULL,
        [deletedBy] = NULL,
        [updatedAt] = CURRENT_TIMESTAMP
    WHERE [resourceType] = N'MENU'
      AND [resourceKey] = N'ADMINISTRATOR_PORTAL_ACCESS';
END

SELECT TOP 1
    @portalAccessMenuMasAccessId = [masAccessId]
FROM [dbo].[master_access_role]
WHERE [resourceType] = N'MENU'
  AND [resourceKey] = N'ADMINISTRATOR_PORTAL_ACCESS'
ORDER BY [masAccessId];

SELECT TOP 1
    @auditLogMenuMasAccessId = [masAccessId]
FROM [dbo].[master_access_role]
WHERE [resourceType] = N'MENU'
  AND [resourceKey] = N'ADMINISTRATOR_AUDIT_LOG'
ORDER BY [masAccessId];

IF @administratorPortalMasAccessId IS NOT NULL
   AND @portalAccessMenuMasAccessId IS NOT NULL
BEGIN
    IF EXISTS (
        SELECT 1
        FROM [dbo].[portal_menu_map]
        WHERE [portalMasAccessId] = @administratorPortalMasAccessId
          AND [menuMasAccessId] = @portalAccessMenuMasAccessId
    )
    BEGIN
        UPDATE [dbo].[portal_menu_map]
        SET
            [orderIndex] = 60,
            [isActive] = 1,
            [isDeleted] = 0,
            [deletedAt] = NULL,
            [deletedBy] = NULL,
            [updatedAt] = CURRENT_TIMESTAMP
        WHERE [portalMasAccessId] = @administratorPortalMasAccessId
          AND [menuMasAccessId] = @portalAccessMenuMasAccessId;
    END
    ELSE
    BEGIN
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
        VALUES (
            N'PMMPORTALACCESSADM',
            @administratorPortalMasAccessId,
            @portalAccessMenuMasAccessId,
            60,
            1,
            0,
            CURRENT_TIMESTAMP,
            NULL,
            CURRENT_TIMESTAMP,
            NULL,
            NULL,
            NULL
        );
    END
END

IF @administratorPortalMasAccessId IS NOT NULL
   AND @auditLogMenuMasAccessId IS NOT NULL
BEGIN
    UPDATE [dbo].[portal_menu_map]
    SET
        [orderIndex] = 70,
        [updatedAt] = CURRENT_TIMESTAMP
    WHERE [portalMasAccessId] = @administratorPortalMasAccessId
      AND [menuMasAccessId] = @auditLogMenuMasAccessId
      AND [isDeleted] = 0;
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
