BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[case_pdca_item] ADD [ownerEmployeeId] INT;

-- CreateTable
CREATE TABLE [dbo].[case_department_assignee] (
    [caseDepartmentAssigneeId] NVARCHAR(20) NOT NULL,
    [caseDepartmentId] NVARCHAR(20) NOT NULL,
    [employeeId] INT NOT NULL,
    [assignedAt] DATETIME2,
    [assignedBy] NVARCHAR(20),
    [isActive] BIT NOT NULL CONSTRAINT [case_department_assignee_isActive_df] DEFAULT 1,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [case_department_assignee_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [createdBy] NVARCHAR(20),
    [updatedAt] DATETIME2 NOT NULL,
    [updatedBy] NVARCHAR(20),
    [isDeleted] BIT NOT NULL CONSTRAINT [case_department_assignee_isDeleted_df] DEFAULT 0,
    [deletedAt] DATETIME2,
    [deletedBy] NVARCHAR(20),
    CONSTRAINT [case_department_assignee_pkey] PRIMARY KEY CLUSTERED ([caseDepartmentAssigneeId]),
    CONSTRAINT [case_department_assignee_caseDepartmentId_employeeId_key] UNIQUE NONCLUSTERED ([caseDepartmentId],[employeeId])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [case_department_assignee_caseDepartmentId_idx] ON [dbo].[case_department_assignee]([caseDepartmentId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [case_department_assignee_employeeId_idx] ON [dbo].[case_department_assignee]([employeeId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [case_pdca_item_caseId_ownerEmployeeId_idx] ON [dbo].[case_pdca_item]([caseId], [ownerEmployeeId]);

-- AddForeignKey
ALTER TABLE [dbo].[case_department_assignee] ADD CONSTRAINT [case_department_assignee_caseDepartmentId_fkey] FOREIGN KEY ([caseDepartmentId]) REFERENCES [dbo].[case_department]([caseDepartmentId]) ON DELETE NO ACTION ON UPDATE NO ACTION;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
