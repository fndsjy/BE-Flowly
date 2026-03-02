-- Drop unique constraint on caseId + itemNo
ALTER TABLE [dbo].[case_pdca_item] DROP CONSTRAINT [case_pdca_item_caseId_itemNo_key];

-- Add unique constraint including isDeleted
ALTER TABLE [dbo].[case_pdca_item]
ADD CONSTRAINT [case_pdca_item_caseId_itemNo_isDeleted_key]
UNIQUE NONCLUSTERED ([caseId], [itemNo], [isDeleted]);
