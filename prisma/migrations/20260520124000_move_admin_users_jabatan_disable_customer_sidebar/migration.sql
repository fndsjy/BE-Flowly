BEGIN TRY

BEGIN TRAN;

DECLARE @administratorPortalMasAccessId NVARCHAR(20);
DECLARE @adminUsersMenuMasAccessId NVARCHAR(20);
DECLARE @adminJabatanMenuMasAccessId NVARCHAR(20);
DECLARE @notificationTemplateMenuMasAccessId NVARCHAR(20);
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
      AND [resourceKey] = N'ADMIN_USERS'
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
        N'MASADMINUSERSADM',
        N'MENU',
        N'ADMIN_USERS',
        N'Users',
        N'/portal-administrator/users',
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
        [displayName] = N'Users',
        [route] = N'/portal-administrator/users',
        [parentKey] = NULL,
        [isActive] = 1,
        [isDeleted] = 0,
        [deletedAt] = NULL,
        [deletedBy] = NULL,
        [updatedAt] = CURRENT_TIMESTAMP
    WHERE [resourceType] = N'MENU'
      AND [resourceKey] = N'ADMIN_USERS';
END

IF NOT EXISTS (
    SELECT 1
    FROM [dbo].[master_access_role]
    WHERE [resourceType] = N'MENU'
      AND [resourceKey] = N'ADMIN_JABATAN'
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
        N'MASADMINJABATANADM',
        N'MENU',
        N'ADMIN_JABATAN',
        N'Jabatan',
        N'/portal-administrator/jabatan',
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
        [displayName] = N'Jabatan',
        [route] = N'/portal-administrator/jabatan',
        [parentKey] = NULL,
        [isActive] = 1,
        [isDeleted] = 0,
        [deletedAt] = NULL,
        [deletedBy] = NULL,
        [updatedAt] = CURRENT_TIMESTAMP
    WHERE [resourceType] = N'MENU'
      AND [resourceKey] = N'ADMIN_JABATAN';
END

UPDATE [dbo].[master_access_role]
SET
    [displayName] = N'Hak Akses Organisasi',
    [isActive] = 1,
    [isDeleted] = 0,
    [deletedAt] = NULL,
    [deletedBy] = NULL,
    [updatedAt] = CURRENT_TIMESTAMP
WHERE [resourceType] = N'MODULE'
  AND [resourceKey] = N'ADMIN_ACCESS_ROLE';

UPDATE [dbo].[master_access_role]
SET
    [displayName] = N'Template Notif A3',
    [isActive] = 1,
    [isDeleted] = 0,
    [deletedAt] = NULL,
    [deletedBy] = NULL,
    [updatedAt] = CURRENT_TIMESTAMP
WHERE [resourceType] = N'MODULE'
  AND [resourceKey] = N'ADMIN_NOTIFICATION_TEMPLATE';

UPDATE [dbo].[master_access_role]
SET
    [isActive] = 0,
    [isDeleted] = 1,
    [deletedAt] = CURRENT_TIMESTAMP,
    [deletedBy] = N'migration',
    [updatedAt] = CURRENT_TIMESTAMP
WHERE [resourceType] = N'MODULE'
  AND [resourceKey] IN (N'ADMIN_USERS', N'ADMIN_JABATAN', N'ADMIN_AUDIT_LOG');

SELECT TOP 1
    @adminUsersMenuMasAccessId = [masAccessId]
FROM [dbo].[master_access_role]
WHERE [resourceType] = N'MENU'
  AND [resourceKey] = N'ADMIN_USERS'
ORDER BY [masAccessId];

SELECT TOP 1
    @adminJabatanMenuMasAccessId = [masAccessId]
FROM [dbo].[master_access_role]
WHERE [resourceType] = N'MENU'
  AND [resourceKey] = N'ADMIN_JABATAN'
ORDER BY [masAccessId];

SELECT TOP 1
    @notificationTemplateMenuMasAccessId = [masAccessId]
FROM [dbo].[master_access_role]
WHERE [resourceType] = N'MENU'
  AND [resourceKey] = N'ADMINISTRATOR_NOTIF_TEMPLATE'
ORDER BY [masAccessId];

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
   AND @adminUsersMenuMasAccessId IS NOT NULL
BEGIN
    IF EXISTS (
        SELECT 1
        FROM [dbo].[portal_menu_map]
        WHERE [portalMasAccessId] = @administratorPortalMasAccessId
          AND [menuMasAccessId] = @adminUsersMenuMasAccessId
    )
    BEGIN
        UPDATE [dbo].[portal_menu_map]
        SET
            [orderIndex] = 50,
            [isActive] = 1,
            [isDeleted] = 0,
            [deletedAt] = NULL,
            [deletedBy] = NULL,
            [updatedAt] = CURRENT_TIMESTAMP
        WHERE [portalMasAccessId] = @administratorPortalMasAccessId
          AND [menuMasAccessId] = @adminUsersMenuMasAccessId;
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
            N'PMMADMINUSERSADM',
            @administratorPortalMasAccessId,
            @adminUsersMenuMasAccessId,
            50,
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
   AND @adminJabatanMenuMasAccessId IS NOT NULL
BEGIN
    IF EXISTS (
        SELECT 1
        FROM [dbo].[portal_menu_map]
        WHERE [portalMasAccessId] = @administratorPortalMasAccessId
          AND [menuMasAccessId] = @adminJabatanMenuMasAccessId
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
          AND [menuMasAccessId] = @adminJabatanMenuMasAccessId;
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
            N'PMMADMINJABATANADM',
            @administratorPortalMasAccessId,
            @adminJabatanMenuMasAccessId,
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
   AND @notificationTemplateMenuMasAccessId IS NOT NULL
BEGIN
    UPDATE [dbo].[portal_menu_map]
    SET
        [orderIndex] = 70,
        [isActive] = 1,
        [isDeleted] = 0,
        [deletedAt] = NULL,
        [deletedBy] = NULL,
        [updatedAt] = CURRENT_TIMESTAMP
    WHERE [portalMasAccessId] = @administratorPortalMasAccessId
      AND [menuMasAccessId] = @notificationTemplateMenuMasAccessId;
END

IF @administratorPortalMasAccessId IS NOT NULL
   AND @portalAccessMenuMasAccessId IS NOT NULL
BEGIN
    UPDATE [dbo].[portal_menu_map]
    SET
        [orderIndex] = 80,
        [isActive] = 1,
        [isDeleted] = 0,
        [deletedAt] = NULL,
        [deletedBy] = NULL,
        [updatedAt] = CURRENT_TIMESTAMP
    WHERE [portalMasAccessId] = @administratorPortalMasAccessId
      AND [menuMasAccessId] = @portalAccessMenuMasAccessId;
END

IF @administratorPortalMasAccessId IS NOT NULL
   AND @auditLogMenuMasAccessId IS NOT NULL
BEGIN
    UPDATE [dbo].[portal_menu_map]
    SET
        [orderIndex] = 90,
        [isActive] = 1,
        [isDeleted] = 0,
        [deletedAt] = NULL,
        [deletedBy] = NULL,
        [updatedAt] = CURRENT_TIMESTAMP
    WHERE [portalMasAccessId] = @administratorPortalMasAccessId
      AND [menuMasAccessId] = @auditLogMenuMasAccessId;
END

DECLARE @customerMenuIds TABLE ([masAccessId] NVARCHAR(20));

INSERT INTO @customerMenuIds ([masAccessId])
SELECT [masAccessId]
FROM [dbo].[master_access_role]
WHERE [resourceType] = N'MENU'
  AND [resourceKey] IN (
      N'CUSTOMER_DASHBOARD',
      N'CUSTOMER_ONBOARDING',
      N'CUSTOMER_LEARNING',
      N'CUSTOMER_ADMIN'
  );

UPDATE [dbo].[portal_menu_map]
SET
    [isActive] = 0,
    [isDeleted] = 1,
    [deletedAt] = CURRENT_TIMESTAMP,
    [deletedBy] = N'migration',
    [updatedAt] = CURRENT_TIMESTAMP
WHERE [menuMasAccessId] IN (SELECT [masAccessId] FROM @customerMenuIds)
  AND [isDeleted] = 0;

UPDATE [dbo].[master_access_role]
SET
    [isActive] = 0,
    [isDeleted] = 1,
    [deletedAt] = CURRENT_TIMESTAMP,
    [deletedBy] = N'migration',
    [updatedAt] = CURRENT_TIMESTAMP
WHERE (
    [resourceType] = N'MENU'
    AND [resourceKey] IN (
        N'CUSTOMER_DASHBOARD',
        N'CUSTOMER_ONBOARDING',
        N'CUSTOMER_LEARNING',
        N'CUSTOMER_ADMIN'
    )
)
OR (
    [resourceType] = N'MODULE'
    AND [resourceKey] IN (
        N'CUSTOMER_ONBOARDING_CHECKLIST',
        N'CUSTOMER_ONBOARDING_ASSESSMENTS',
        N'CUSTOMER_ONBOARDING_CERTIFICATES',
        N'CUSTOMER_ADMIN_CUSTOMERS'
    )
);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
