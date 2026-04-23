BEGIN TRY

BEGIN TRAN;

IF EXISTS (
    SELECT 1
    FROM sys.columns
    WHERE object_id = OBJECT_ID(N'[dbo].[master_access_role]')
      AND name = N'orderIndex'
)
BEGIN
    DECLARE @constraintName NVARCHAR(128);
    DECLARE @dropConstraintSql NVARCHAR(400);

    SELECT @constraintName = dc.name
    FROM sys.default_constraints AS dc
    INNER JOIN sys.columns AS c
        ON c.object_id = dc.parent_object_id
       AND c.column_id = dc.parent_column_id
    WHERE dc.parent_object_id = OBJECT_ID(N'[dbo].[master_access_role]')
      AND c.name = N'orderIndex';

    IF @constraintName IS NOT NULL
    BEGIN
        SET @dropConstraintSql =
            N'ALTER TABLE [dbo].[master_access_role] DROP CONSTRAINT [' +
            REPLACE(@constraintName, N']', N']]') +
            N']';
        EXEC sp_executesql @dropConstraintSql;
    END;

    ALTER TABLE [dbo].[master_access_role]
    DROP COLUMN [orderIndex];
END;

COMMIT TRAN;

END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
        ROLLBACK TRAN;
    THROW;
END CATCH
