BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[access_role] (
    [accessId] NVARCHAR(20) NOT NULL,
    [subjectType] NVARCHAR(10) NOT NULL,
    [subjectId] NVARCHAR(20) NOT NULL,
    [resourceType] NVARCHAR(20) NOT NULL,
    [masAccessId] NVARCHAR(20),
    [resourceKey] NVARCHAR(50),
    [accessLevel] NVARCHAR(10) NOT NULL,
    [isActive] BIT NOT NULL CONSTRAINT [access_role_isActive_df] DEFAULT 1,
    [isDeleted] BIT NOT NULL CONSTRAINT [access_role_isDeleted_df] DEFAULT 0,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [access_role_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [createdBy] NVARCHAR(20),
    [updatedAt] DATETIME2 NOT NULL,
    [updatedBy] NVARCHAR(20),
    [deletedAt] DATETIME2,
    [deletedBy] NVARCHAR(20),
    CONSTRAINT [access_role_pkey] PRIMARY KEY CLUSTERED ([accessId]),
    CONSTRAINT [access_role_subjectType_subjectId_resourceType_masAccessId_resourceKey_key] UNIQUE NONCLUSTERED ([subjectType],[subjectId],[resourceType],[masAccessId],[resourceKey])
);

-- CreateTable
CREATE TABLE [dbo].[master_access_role] (
    [masAccessId] NVARCHAR(20) NOT NULL,
    [resourceType] NVARCHAR(20) NOT NULL,
    [resourceKey] NVARCHAR(50) NOT NULL,
    [displayName] NVARCHAR(100) NOT NULL,
    [route] NVARCHAR(200),
    [parentKey] NVARCHAR(50),
    [orderIndex] INT NOT NULL CONSTRAINT [master_access_role_orderIndex_df] DEFAULT 0,
    [isActive] BIT NOT NULL CONSTRAINT [master_access_role_isActive_df] DEFAULT 1,
    [isDeleted] BIT NOT NULL CONSTRAINT [master_access_role_isDeleted_df] DEFAULT 0,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [master_access_role_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [createdBy] NVARCHAR(20),
    [updatedAt] DATETIME2 NOT NULL,
    [updatedBy] NVARCHAR(20),
    [deletedAt] DATETIME2,
    [deletedBy] NVARCHAR(20),
    CONSTRAINT [master_access_role_pkey] PRIMARY KEY CLUSTERED ([masAccessId]),
    CONSTRAINT [master_access_role_resourceType_resourceKey_key] UNIQUE NONCLUSTERED ([resourceType],[resourceKey])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [access_role_subjectType_subjectId_idx] ON [dbo].[access_role]([subjectType], [subjectId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [access_role_resourceType_masAccessId_idx] ON [dbo].[access_role]([resourceType], [masAccessId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [master_access_role_parentKey_idx] ON [dbo].[master_access_role]([parentKey]);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
