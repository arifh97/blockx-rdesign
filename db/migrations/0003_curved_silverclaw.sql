CREATE TYPE "public"."bid_type" AS ENUM('sell', 'buy');--> statement-breakpoint
CREATE TABLE "bid_payment_preferences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"bid_id" uuid NOT NULL,
	"payment_method_type" varchar(50) NOT NULL,
	"priority" smallint DEFAULT 0,
	"notes" text
);
--> statement-breakpoint
ALTER TABLE "bids" ADD COLUMN "bid_type" "bid_type" DEFAULT 'sell' NOT NULL;--> statement-breakpoint
ALTER TABLE "bids" ADD COLUMN "chain_id" bigint NOT NULL;--> statement-breakpoint
ALTER TABLE "bid_payment_preferences" ADD CONSTRAINT "bid_payment_preferences_bid_id_bids_id_fk" FOREIGN KEY ("bid_id") REFERENCES "public"."bids"("id") ON DELETE cascade ON UPDATE no action;