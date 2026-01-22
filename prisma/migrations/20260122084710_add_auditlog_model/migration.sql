BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[audit_log] (
    [logId] INT NOT NULL IDENTITY(1,1),
    [module] NVARCHAR(50) NOT NULL,
    [entity] NVARCHAR(50) NOT NULL,
    [entityId] NVARCHAR(50) NOT NULL,
    [action] NVARCHAR(20) NOT NULL,
    [actorId] NVARCHAR(20),
    [actorType] NVARCHAR(20),
    [changes] NVARCHAR(max),
    [snapshot] NVARCHAR(max),
    [meta] NVARCHAR(max),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [audit_log_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [audit_log_pkey] PRIMARY KEY CLUSTERED ([logId])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [audit_log_module_idx] ON [dbo].[audit_log]([module]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [audit_log_entity_idx] ON [dbo].[audit_log]([entity]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [audit_log_entityId_idx] ON [dbo].[audit_log]([entityId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [audit_log_actorId_idx] ON [dbo].[audit_log]([actorId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [audit_log_createdAt_idx] ON [dbo].[audit_log]([createdAt]);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
