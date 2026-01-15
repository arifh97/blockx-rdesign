CREATE TABLE "bid_payment_accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"bid_id" uuid NOT NULL,
	"payment_account_id" uuid NOT NULL,
	"custom_instructions" text
);
--> statement-breakpoint
CREATE TABLE "user_payment_accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"payment_method" varchar(50) NOT NULL,
	"payment_details_encrypted" text NOT NULL,
	"label" varchar(100),
	"currency" varchar(3),
	"is_default" boolean DEFAULT false,
	"is_verified" boolean DEFAULT false,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "selected_payment_account_id" uuid;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "payment_method" varchar(50);--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "payment_details_snapshot" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "payment_instructions" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "payment_reference" varchar(100);--> statement-breakpoint
ALTER TABLE "bid_payment_accounts" ADD CONSTRAINT "bid_payment_accounts_bid_id_bids_id_fk" FOREIGN KEY ("bid_id") REFERENCES "public"."bids"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bid_payment_accounts" ADD CONSTRAINT "bid_payment_accounts_payment_account_id_user_payment_accounts_id_fk" FOREIGN KEY ("payment_account_id") REFERENCES "public"."user_payment_accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_payment_accounts" ADD CONSTRAINT "user_payment_accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_selected_payment_account_id_user_payment_accounts_id_fk" FOREIGN KEY ("selected_payment_account_id") REFERENCES "public"."user_payment_accounts"("id") ON DELETE no action ON UPDATE no action;