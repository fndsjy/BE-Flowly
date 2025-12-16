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

-- CreateTable
CREATE TABLE [dbo].[chart] (
    [chartId] NVARCHAR(20) NOT NULL,
    [pilarId] INT NOT NULL,
    [sbuId] INT NOT NULL,
    [sbuSubId] INT NOT NULL,
    [parentId] NVARCHAR(20),
    [position] NVARCHAR(100) NOT NULL,
    [capacity] INT NOT NULL CONSTRAINT [chart_capacity_df] DEFAULT 1,
    [orderIndex] INT NOT NULL CONSTRAINT [chart_orderIndex_df] DEFAULT 0,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [chart_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [createdBy] NVARCHAR(20),
    [updatedAt] DATETIME2 NOT NULL,
    [updatedBy] NVARCHAR(20),
    [isDeleted] BIT NOT NULL CONSTRAINT [chart_isDeleted_df] DEFAULT 0,
    [deletedAt] DATETIME2,
    [deletedBy] NVARCHAR(20),
    CONSTRAINT [chart_pkey] PRIMARY KEY CLUSTERED ([chartId])
);

-- CreateTable
CREATE TABLE [dbo].[chart_member] (
    [memberChartId] NVARCHAR(20) NOT NULL,
    [chartId] NVARCHAR(20) NOT NULL,
    [userId] INT,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [chart_member_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [createdBy] NVARCHAR(20),
    [updatedAt] DATETIME2 NOT NULL,
    [updatedBy] NVARCHAR(20),
    [isDeleted] BIT NOT NULL CONSTRAINT [chart_member_isDeleted_df] DEFAULT 0,
    [deletedAt] DATETIME2,
    [deletedBy] NVARCHAR(20),
    CONSTRAINT [chart_member_pkey] PRIMARY KEY CLUSTERED ([memberChartId]),
    CONSTRAINT [chart_member_chartId_userId_key] UNIQUE NONCLUSTERED ([chartId],[userId])
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

-- CreateIndex
CREATE NONCLUSTERED INDEX [chart_parentId_idx] ON [dbo].[chart]([parentId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [chart_pilarId_idx] ON [dbo].[chart]([pilarId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [chart_sbuId_idx] ON [dbo].[chart]([sbuId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [chart_sbuSubId_idx] ON [dbo].[chart]([sbuSubId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [chart_member_chartId_idx] ON [dbo].[chart_member]([chartId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [chart_member_userId_idx] ON [dbo].[chart_member]([userId]);

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

-- AddForeignKey
ALTER TABLE [dbo].[chart] ADD CONSTRAINT [chart_parentId_fkey] FOREIGN KEY ([parentId]) REFERENCES [dbo].[chart]([chartId]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[chart_member] ADD CONSTRAINT [chart_member_chartId_fkey] FOREIGN KEY ([chartId]) REFERENCES [dbo].[chart]([chartId]) ON DELETE NO ACTION ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
