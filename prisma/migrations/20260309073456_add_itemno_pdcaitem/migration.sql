/*
  Warnings:

  - A unique constraint covering the columns `[caseId,ownerEmployeeId,itemNo,isDeleted]` on the table `case_pdca_item` will be added. If there are existing duplicate values, this will fail.

*/
BEGIN TRY

BEGIN TRAN;

-- DropIndex
ALTER TABLE [dbo].[case_pdca_item] DROP CONSTRAINT [case_pdca_item_caseId_itemNo_isDeleted_key];

-- CreateIndex
ALTER TABLE [dbo].[case_pdca_item] ADD CONSTRAINT [case_pdca_item_caseId_ownerEmployeeId_itemNo_isDeleted_key] UNIQUE NONCLUSTERED ([caseId], [ownerEmployeeId], [itemNo], [isDeleted]);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
