ALTER TABLE `companies` ADD `default_tax_rate` real DEFAULT 17 NOT NULL;--> statement-breakpoint
ALTER TABLE `companies` ADD `payment_terms_days` integer DEFAULT 30 NOT NULL;