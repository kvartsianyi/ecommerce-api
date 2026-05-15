-- migrate:up
CREATE TYPE "public"."order_status" AS ENUM('pending', 'paid', 'canceled');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('unpaid', 'paid', 'failed');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('admin', 'user');--> statement-breakpoint
CREATE TABLE "cart_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"cart_id" integer NOT NULL,
	"product_id" integer NOT NULL,
	"quantity" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "cart_items_cart_id_product_id_unique" UNIQUE("cart_id","product_id"),
	CONSTRAINT "cart_items_product_quantity_check" CHECK ("cart_items"."quantity" > 0)
);
--> statement-breakpoint
CREATE TABLE "carts" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "carts_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "order_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" integer NOT NULL,
	"product_id" integer NOT NULL,
	"quantity" integer NOT NULL,
	"product_title" varchar(50) NOT NULL,
	"product_description" text,
	"product_image" varchar(255),
	"unit_price" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "order_items_product_quantity_check" CHECK ("order_items"."quantity" > 0),
	CONSTRAINT "order_items_unit_price_check" CHECK ("order_items"."unit_price" >= 0)
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"status" "order_status" DEFAULT 'pending' NOT NULL,
	"total_amount" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "orders_total_amount_check" CHECK ("orders"."total_amount" >= 0)
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" integer NOT NULL,
	"stripe_session_id" varchar(255) NOT NULL,
	"stripe_payment_id" varchar(255),
	"status" "payment_status" DEFAULT 'unpaid' NOT NULL,
	"amount" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "payments_amount_check" CHECK ("payments"."amount" >= 0)
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(50) NOT NULL,
	"description" text,
	"image" varchar(255),
	"price" integer NOT NULL,
	"user_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "products_price_check" CHECK ("products"."price" >= 0)
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"first_name" varchar(50) NOT NULL,
	"last_name" varchar(50) NOT NULL,
	"email" varchar(255) NOT NULL,
	"phone" varchar(20) NOT NULL,
	"password" varchar(255) NOT NULL,
	"role" "user_role" DEFAULT 'user' NOT NULL,
	"is_email_confirmed" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_phone_unique" UNIQUE("phone"),
	CONSTRAINT "users_phone_check" CHECK (phone ~ '^\+380\d{9}$')
);
--> statement-breakpoint

CREATE FUNCTION updated_at_trigger() RETURNS trigger
   LANGUAGE plpgsql AS
$$BEGIN
   NEW.updated_at := NOW();
   RETURN NEW;
END;$$;

CREATE TRIGGER updated_at_trigger BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE PROCEDURE updated_at_trigger();
CREATE TRIGGER updated_at_trigger BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE PROCEDURE updated_at_trigger();
CREATE TRIGGER updated_at_trigger BEFORE UPDATE ON carts
  FOR EACH ROW EXECUTE PROCEDURE updated_at_trigger();
CREATE TRIGGER updated_at_trigger BEFORE UPDATE ON cart_items
  FOR EACH ROW EXECUTE PROCEDURE updated_at_trigger();
CREATE TRIGGER updated_at_trigger BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE PROCEDURE updated_at_trigger();
CREATE TRIGGER updated_at_trigger BEFORE UPDATE ON order_items
  FOR EACH ROW EXECUTE PROCEDURE updated_at_trigger();
CREATE TRIGGER updated_at_trigger BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE PROCEDURE updated_at_trigger();

ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_cart_id_carts_id_fk" FOREIGN KEY ("cart_id") REFERENCES "public"."carts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "carts" ADD CONSTRAINT "carts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "products_title_idx" ON "products" USING btree ("title");

-- migrate:down
-- DROP TRIGGER IF EXISTS updated_at_trigger ON users;
-- DROP TRIGGER IF EXISTS updated_at_trigger ON products;
-- DROP TRIGGER IF EXISTS updated_at_trigger ON carts;
-- DROP TRIGGER IF EXISTS updated_at_trigger ON cart_items;
-- DROP TRIGGER IF EXISTS updated_at_trigger ON orders;
-- DROP TRIGGER IF EXISTS updated_at_trigger ON order_items;
-- DROP TRIGGER IF EXISTS updated_at_trigger ON payments;
-- DROP FUNCTION IF EXISTS updated_at_trigger;
-- DROP TABLE IF EXISTS payments;
-- DROP TABLE IF EXISTS order_items;
-- DROP TABLE IF EXISTS orders;
-- DROP TABLE IF EXISTS cart_items;
-- DROP TABLE IF EXISTS carts;
-- DROP TABLE IF EXISTS products;
-- DROP TABLE IF EXISTS users;
-- DROP TYPE IF EXISTS "public"."user_role";
-- DROP TYPE IF EXISTS "public"."order_status";
-- DROP TYPE IF EXISTS "public"."payment_status";