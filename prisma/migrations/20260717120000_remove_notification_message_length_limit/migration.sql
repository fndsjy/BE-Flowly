ALTER TABLE [notification_template]
ALTER COLUMN [messageTemplate] NVARCHAR(MAX) NOT NULL;

ALTER TABLE [notification_outbox]
ALTER COLUMN [message] NVARCHAR(MAX) NOT NULL;
