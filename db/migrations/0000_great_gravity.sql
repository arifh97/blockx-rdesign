ALTER TABLE "bids" ADD COLUMN "available_hours" text;--> statement-breakpoint
ALTER TABLE "bids" ADD COLUMN "timezone" varchar(50) DEFAULT 'UTC';--> statement-breakpoint
ALTER TABLE "bids" ADD COLUMN "is_global" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "bids" ADD COLUMN "allowed_countries" text[];--> statement-breakpoint
ALTER TABLE "bids" ADD COLUMN "is_private" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "bids" ADD COLUMN "access_token" varchar(64);