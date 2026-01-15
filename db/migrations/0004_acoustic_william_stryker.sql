-- Add chain_ids column (nullable first to allow migration)
ALTER TABLE "bids" ADD COLUMN "chain_ids" text;--> statement-breakpoint

-- Migrate existing chain_id values to chain_ids as JSON array
UPDATE "bids" SET "chain_ids" = CONCAT('[', "chain_id", ']') WHERE "chain_ids" IS NULL;--> statement-breakpoint

-- Make chain_ids NOT NULL after migration
ALTER TABLE "bids" ALTER COLUMN "chain_ids" SET NOT NULL;--> statement-breakpoint

-- Drop old chain_id column
ALTER TABLE "bids" DROP COLUMN "chain_id";