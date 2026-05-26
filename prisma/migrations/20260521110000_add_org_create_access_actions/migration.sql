BEGIN TRY

BEGIN TRAN;

IF NOT EXISTS (
    SELECT 1
    FROM [dbo].[master_access_role]
    WHERE [resourceType] = N'MODULE'
      AND [resourceKey] = N'PILAR_CREATE'
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
        N'MAR210526-ADD01',
        N'MODULE',
        N'PILAR_CREATE',
        N'Tambah Pilar',
        NULL,
        N'ORGANISASI',
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
        [displayName] = N'Tambah Pilar',
        [route] = NULL,
        [parentKey] = N'ORGANISASI',
        [isActive] = 1,
        [isDeleted] = 0,
        [deletedAt] = NULL,
        [deletedBy] = NULL,
        [updatedAt] = CURRENT_TIMESTAMP
    WHERE [resourceType] = N'MODULE'
      AND [resourceKey] = N'PILAR_CREATE';
END

IF NOT EXISTS (
    SELECT 1
    FROM [dbo].[master_access_role]
    WHERE [resourceType] = N'MODULE'
      AND [resourceKey] = N'SBU_CREATE'
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
        N'MAR210526-ADD02',
        N'MODULE',
        N'SBU_CREATE',
        N'Tambah SBU',
        NULL,
        N'ORGANISASI',
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
        [displayName] = N'Tambah SBU',
        [route] = NULL,
        [parentKey] = N'ORGANISASI',
        [isActive] = 1,
        [isDeleted] = 0,
        [deletedAt] = NULL,
        [deletedBy] = NULL,
        [updatedAt] = CURRENT_TIMESTAMP
    WHERE [resourceType] = N'MODULE'
      AND [resourceKey] = N'SBU_CREATE';
END

IF NOT EXISTS (
    SELECT 1
    FROM [dbo].[master_access_role]
    WHERE [resourceType] = N'MODULE'
      AND [resourceKey] = N'SBU_SUB_CREATE'
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
        N'MAR210526-ADD03',
        N'MODULE',
        N'SBU_SUB_CREATE',
        N'Tambah SBU Sub',
        NULL,
        N'ORGANISASI',
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
        [displayName] = N'Tambah SBU Sub',
        [route] = NULL,
        [parentKey] = N'ORGANISASI',
        [isActive] = 1,
        [isDeleted] = 0,
        [deletedAt] = NULL,
        [deletedBy] = NULL,
        [updatedAt] = CURRENT_TIMESTAMP
    WHERE [resourceType] = N'MODULE'
      AND [resourceKey] = N'SBU_SUB_CREATE';
END

COMMIT TRAN;

END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
        ROLLBACK TRAN;
    THROW;
END CATCH
