BEGIN TRY

BEGIN TRAN;

UPDATE [dbo].[master_access_role]
SET
    [isActive] = 1,
    [isDeleted] = 0,
    [deletedAt] = NULL,
    [deletedBy] = NULL,
    [updatedAt] = CURRENT_TIMESTAMP
WHERE [resourceType] = N'MODULE'
  AND [resourceKey] = N'ADMIN_ACCESS_ROLE';

UPDATE [dbo].[master_access_role]
SET
    [isActive] = 0,
    [isDeleted] = 1,
    [deletedAt] = CURRENT_TIMESTAMP,
    [deletedBy] = N'migration',
    [updatedAt] = CURRENT_TIMESTAMP
WHERE [resourceType] = N'MODULE'
  AND [resourceKey] = N'ADMIN_AUDIT_LOG';

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
