BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[roles] (
    [roleId] NVARCHAR(20) NOT NULL,
    [roleName] NVARCHAR(50) NOT NULL,
    [roleLevel] INT NOT NULL,
    [roleDesc] NVARCHAR(255),
    [roleIsActive] BIT NOT NULL CONSTRAINT [roles_roleIsActive_df] DEFAULT 1,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [roles_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [createdBy] NVARCHAR(20),
    [updatedAt] DATETIME2 NOT NULL,
    [updatedBy] NVARCHAR(20),
    [isDeleted] BIT NOT NULL CONSTRAINT [roles_isDeleted_df] DEFAULT 0,
    [deletedAt] DATETIME2,
    [deletedBy] NVARCHAR(20),
    CONSTRAINT [roles_pkey] PRIMARY KEY CLUSTERED ([roleId])
);

-- CreateTable
CREATE TABLE [dbo].[users] (
    [userId] NVARCHAR(20) NOT NULL,
    [username] NVARCHAR(30) NOT NULL,
    [password] NVARCHAR(100) NOT NULL,
    [name] NVARCHAR(100) NOT NULL,
    [badgeNumber] NVARCHAR(20) NOT NULL,
    [department] NVARCHAR(50),
    [isActive] BIT NOT NULL CONSTRAINT [users_isActive_df] DEFAULT 1,
    [lastLogin] DATETIME2,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [users_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [createdBy] NVARCHAR(20),
    [updatedAt] DATETIME2 NOT NULL,
    [updatedBy] NVARCHAR(20),
    [isDeleted] BIT NOT NULL CONSTRAINT [users_isDeleted_df] DEFAULT 0,
    [deletedAt] DATETIME2,
    [deletedBy] NVARCHAR(20),
    [roleId] NVARCHAR(20) NOT NULL,
    [token] NVARCHAR(500),
    CONSTRAINT [users_pkey] PRIMARY KEY CLUSTERED ([userId]),
    CONSTRAINT [users_username_key] UNIQUE NONCLUSTERED ([username])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [roles_createdBy_idx] ON [dbo].[roles]([createdBy]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [roles_updatedBy_idx] ON [dbo].[roles]([updatedBy]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [roles_deletedBy_idx] ON [dbo].[roles]([deletedBy]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [users_username_idx] ON [dbo].[users]([username]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [users_badgeNumber_idx] ON [dbo].[users]([badgeNumber]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [users_roleId_idx] ON [dbo].[users]([roleId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [users_createdBy_idx] ON [dbo].[users]([createdBy]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [users_updatedBy_idx] ON [dbo].[users]([updatedBy]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [users_deletedBy_idx] ON [dbo].[users]([deletedBy]);

-- AddForeignKey
ALTER TABLE [dbo].[roles] ADD CONSTRAINT [roles_createdBy_fkey] FOREIGN KEY ([createdBy]) REFERENCES [dbo].[users]([userId]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[roles] ADD CONSTRAINT [roles_updatedBy_fkey] FOREIGN KEY ([updatedBy]) REFERENCES [dbo].[users]([userId]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[roles] ADD CONSTRAINT [roles_deletedBy_fkey] FOREIGN KEY ([deletedBy]) REFERENCES [dbo].[users]([userId]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[users] ADD CONSTRAINT [users_createdBy_fkey] FOREIGN KEY ([createdBy]) REFERENCES [dbo].[users]([userId]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[users] ADD CONSTRAINT [users_updatedBy_fkey] FOREIGN KEY ([updatedBy]) REFERENCES [dbo].[users]([userId]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[users] ADD CONSTRAINT [users_deletedBy_fkey] FOREIGN KEY ([deletedBy]) REFERENCES [dbo].[users]([userId]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[users] ADD CONSTRAINT [users_roleId_fkey] FOREIGN KEY ([roleId]) REFERENCES [dbo].[roles]([roleId]) ON DELETE NO ACTION ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
