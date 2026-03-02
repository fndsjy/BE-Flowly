-- CreateTable
CREATE TABLE [dbo].[case_pdca_item] (
    [casePdcaItemId] NVARCHAR(20) NOT NULL,
    [caseId] NVARCHAR(20) NOT NULL,
    [itemNo] INT NOT NULL,
    [planText] NVARCHAR(1000),
    [doText] NVARCHAR(1000),
    [doStartDate] DATETIME2,
    [doEndDate] DATETIME2,
    [checkText] NVARCHAR(1000),
    [checkStartDate] DATETIME2,
    [checkEndDate] DATETIME2,
    [checkBy] NVARCHAR(100),
    [checkComment] NVARCHAR(500),
    [actText] NVARCHAR(2000),
    [actStartDate] DATETIME2,
    [actEndDate] DATETIME2,
    [isActive] BIT NOT NULL CONSTRAINT [case_pdca_item_isActive_df] DEFAULT 1,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [case_pdca_item_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [createdBy] NVARCHAR(20),
    [updatedAt] DATETIME2 NOT NULL,
    [updatedBy] NVARCHAR(20),
    [isDeleted] BIT NOT NULL CONSTRAINT [case_pdca_item_isDeleted_df] DEFAULT 0,
    [deletedAt] DATETIME2,
    [deletedBy] NVARCHAR(20),
    CONSTRAINT [case_pdca_item_pkey] PRIMARY KEY CLUSTERED ([casePdcaItemId]),
    CONSTRAINT [case_pdca_item_caseId_itemNo_key] UNIQUE NONCLUSTERED ([caseId],[itemNo])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [case_pdca_item_caseId_isDeleted_idx] ON [dbo].[case_pdca_item]([caseId], [isDeleted]);

-- AddForeignKey
ALTER TABLE [dbo].[case_pdca_item] ADD CONSTRAINT [case_pdca_item_caseId_fkey] FOREIGN KEY ([caseId]) REFERENCES [dbo].[case_header]([caseId]) ON DELETE NO ACTION ON UPDATE NO ACTION;
