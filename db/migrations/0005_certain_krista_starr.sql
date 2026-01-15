-- Step 1: Add new columns (chain_id as nullable first)
ALTER TABLE "bids" ADD COLUMN "chain_id" smallint;--> statement-breakpoint
ALTER TABLE "bids" ADD COLUMN "bid_group_id" varchar(64);--> statement-breakpoint

-- Step 2: Migrate existing data (extract first chainId from chainIds JSON array)
-- This handles existing records by parsing the JSON array and taking the first value
UPDATE "bids" 
SET "chain_id" = CAST(
  TRIM(BOTH '[]' FROM SPLIT_PART("chain_ids", ',', 1))::TEXT 
  AS SMALLINT
)
WHERE "chain_id" IS NULL AND "chain_ids" IS NOT NULL;--> statement-breakpoint

-- Step 3: Make chain_id NOT NULL after data migration
ALTER TABLE "bids" ALTER COLUMN "chain_id" SET NOT NULL;--> statement-breakpoint

-- Step 4: Drop old chainIds column
ALTER TABLE "bids" DROP COLUMN "chain_ids";--> statement-breakpoint

-- Step 5: Create indexes for better query performance
CREATE INDEX IF NOT EXISTS "idx_bids_chain_id" ON "bids"("chain_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_bids_bid_group_id" ON "bids"("bid_group_id");