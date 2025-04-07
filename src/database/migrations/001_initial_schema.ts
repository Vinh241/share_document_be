import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  // Create ENUM types
  await knex.raw(`
    CREATE TYPE user_status AS ENUM ('active', 'inactive', 'pending');
    CREATE TYPE order_status AS ENUM ('pending', 'processing', 'shipped', 'delivered', 'cancelled');
    CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
    CREATE TYPE payment_method AS ENUM ('credit_card', 'paypal', 'bank_transfer', 'cash_on_delivery');
  `);

  // Create users table
  await knex.schema.createTable("users", (table) => {
    table.bigIncrements("id").primary();
    table.string("email", 255).unique().notNullable();
    table.string("phone_number", 20).unique();
    table.string("password_hash", 255).notNullable();
    table.string("full_name", 255).notNullable();
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
  });

  // Create addresses table
  await knex.schema.createTable("addresses", (table) => {
    table.bigIncrements("id").primary();
    table.bigInteger("user_id").unsigned().references("id").inTable("users");
    table.string("address_line1", 255).notNullable();
    table.string("address_line2", 255);
    table.string("city", 100).notNullable();
    table.string("state", 100).notNullable();
    table.string("postal_code", 20).notNullable();
    table.boolean("is_default").defaultTo(false);
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
  });

  // Create categories table
  await knex.schema.createTable("categories", (table) => {
    table.bigIncrements("id").primary();
    table.string("name", 255).notNullable();
    table.string("slug", 255).unique().notNullable();
    table
      .bigInteger("parent_id")
      .unsigned()
      .references("id")
      .inTable("categories");
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
  });

  // Create publishers table
  await knex.schema.createTable("publishers", (table) => {
    table.bigIncrements("id").primary();
    table.string("name", 255).notNullable();
    table.text("description");
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
  });

  // Create authors table
  await knex.schema.createTable("authors", (table) => {
    table.bigIncrements("id").primary();
    table.string("name", 255).notNullable();
    table.text("biography");
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
  });

  // Create products table
  await knex.schema.createTable("products", (table) => {
    table.bigIncrements("id").primary();
    table.string("name", 255).notNullable();
    table.string("slug", 255).unique().notNullable();
    table.text("description");
    table.decimal("price", 10, 2).notNullable();
    table.decimal("sale_price", 10, 2);
    table.integer("stock_quantity").notNullable().defaultTo(0);
    table
      .bigInteger("category_id")
      .unsigned()
      .references("id")
      .inTable("categories");
    table
      .bigInteger("publisher_id")
      .unsigned()
      .references("id")
      .inTable("publishers");
    table
      .bigInteger("author_id")
      .unsigned()
      .references("id")
      .inTable("authors");
    table.string("isbn", 13);
    table.date("publication_date");
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
  });

  // Create product_images table
  await knex.schema.createTable("product_images", (table) => {
    table.bigIncrements("id").primary();
    table
      .bigInteger("product_id")
      .unsigned()
      .references("id")
      .inTable("products");
    table.string("image_url", 255).notNullable();
    table.boolean("is_primary").defaultTo(false);
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
  });

  // Create orders table
  await knex.schema.createTable("orders", (table) => {
    table.bigIncrements("id").primary();
    table.bigInteger("user_id").unsigned().references("id").inTable("users");
    table.specificType("status", "order_status").defaultTo("pending");
    table.decimal("total_amount", 10, 2).notNullable();
    table
      .bigInteger("shipping_address_id")
      .unsigned()
      .references("id")
      .inTable("addresses");
    table.specificType("payment_method", "payment_method").notNullable();
    table.specificType("payment_status", "payment_status").defaultTo("pending");
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
  });

  // Create order_items table
  await knex.schema.createTable("order_items", (table) => {
    table.bigIncrements("id").primary();
    table.bigInteger("order_id").unsigned().references("id").inTable("orders");
    table
      .bigInteger("product_id")
      .unsigned()
      .references("id")
      .inTable("products");
    table.integer("quantity").notNullable();
    table.decimal("unit_price", 10, 2).notNullable();
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
  });

  // Create reviews table
  await knex.schema.createTable("reviews", (table) => {
    table.bigIncrements("id").primary();
    table.bigInteger("user_id").unsigned().references("id").inTable("users");
    table
      .bigInteger("product_id")
      .unsigned()
      .references("id")
      .inTable("products");
    table.integer("rating").notNullable();
    table.text("comment");
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
  });

  // Create cart_items table
  await knex.schema.createTable("cart_items", (table) => {
    table.bigIncrements("id").primary();
    table.bigInteger("user_id").unsigned().references("id").inTable("users");
    table
      .bigInteger("product_id")
      .unsigned()
      .references("id")
      .inTable("products");
    table.integer("quantity").notNullable();
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  // Drop tables in reverse order
  await knex.schema
    .dropTableIfExists("cart_items")
    .dropTableIfExists("reviews")
    .dropTableIfExists("order_items")
    .dropTableIfExists("orders")
    .dropTableIfExists("product_images")
    .dropTableIfExists("products")
    .dropTableIfExists("authors")
    .dropTableIfExists("publishers")
    .dropTableIfExists("categories")
    .dropTableIfExists("addresses")
    .dropTableIfExists("users");

  // Drop ENUM types
  await knex.raw(`
    DROP TYPE IF EXISTS user_status;
    DROP TYPE IF EXISTS order_status;
    DROP TYPE IF EXISTS payment_status;
    DROP TYPE IF EXISTS payment_method;
  `);
}
