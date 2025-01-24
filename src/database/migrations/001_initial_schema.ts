import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  // Create ENUM types
  await knex.raw(`
    CREATE TYPE user_status AS ENUM ('active', 'draft', 'pending');
    CREATE TYPE order_status AS ENUM ('active', 'draft', 'pending', 'completed', 'cancelled');
    CREATE TYPE transaction_type AS ENUM ('deposit', 'withdrawal', 'purchase', 'sale', 'referral');
    CREATE TYPE transaction_status AS ENUM ('active', 'draft', 'pending', 'completed', 'failed');
    CREATE TYPE referral_status AS ENUM ('active', 'draft', 'pending', 'paid', 'cancelled');
  `);

  // Create users table
  await knex.schema.createTable("users", (table) => {
    table.increments("user_id").primary();
    table.string("username").unique().notNullable();
    table.string("email").unique().notNullable();
    table.string("password_hash").notNullable();
    table.string("full_name");
    table.string("phone");
    table.decimal("balance", 15, 2).defaultTo(0);
    table.string("referral_code").unique();
    table.specificType("status", "user_status").defaultTo("pending");
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
    table.boolean("is_deleted").defaultTo(false);
  });

  // Create categories table
  await knex.schema.createTable("categories", (table) => {
    table.increments("category_id").primary();
    table.string("name").notNullable();
    table.text("description");
    table.specificType("status", "user_status").defaultTo("pending");
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
  });

  // Create subjects table
  await knex.schema.createTable("subjects", (table) => {
    table.increments("subject_id").primary();
    table.string("name").notNullable();
    table.text("description");
    table.specificType("status", "user_status").defaultTo("pending");
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
  });

  // Create universities table
  await knex.schema.createTable("universities", (table) => {
    table.increments("university_id").primary();
    table.string("name").notNullable();
    table.text("description");
    table.specificType("status", "user_status").defaultTo("pending");
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
  });

  // Create documents table
  await knex.schema.createTable("documents", (table) => {
    table.increments("document_id").primary();
    table.string("title").notNullable();
    table.text("description");
    table.decimal("price", 15, 2).notNullable();
    table.string("file_path").notNullable();
    table.string("instruct_path");
    table.integer("user_id").references("user_id").inTable("users");
    table
      .integer("category_id")
      .references("category_id")
      .inTable("categories");
    table.integer("subject_id").references("subject_id").inTable("subjects");
    table
      .integer("university_id")
      .references("university_id")
      .inTable("universities");
    table.integer("view_count").defaultTo(0);
    table.integer("download_count").defaultTo(0);
    table.specificType("status", "user_status").defaultTo("pending");
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
  });

  // Create orders table
  await knex.schema.createTable("orders", (table) => {
    table.increments("order_id").primary();
    table.integer("user_id").references("user_id").inTable("users");
    table.decimal("total_amount", 15, 2).notNullable();
    table.specificType("status", "order_status").defaultTo("pending");
    table.timestamp("created_at").defaultTo(knex.fn.now());
  });

  // Create order_items table
  await knex.schema.createTable("order_items", (table) => {
    table.increments("order_item_id").primary();
    table.integer("order_id").references("order_id").inTable("orders");
    table.integer("document_id").references("document_id").inTable("documents");
    table.decimal("price", 15, 2).notNullable();
    table.specificType("status", "user_status").defaultTo("pending");
    table.timestamp("created_at").defaultTo(knex.fn.now());
  });

  // Create transactions table
  await knex.schema.createTable("transactions", (table) => {
    table.increments("transaction_id").primary();
    table.integer("user_id").references("user_id").inTable("users");
    table.decimal("amount", 15, 2).notNullable();
    table.specificType("type", "transaction_type").notNullable();
    table.specificType("status", "transaction_status").defaultTo("pending");
    table.integer("reference_id");
    table.text("description");
    table.timestamp("created_at").defaultTo(knex.fn.now());
  });

  // Create referral_history table
  await knex.schema.createTable("referral_history", (table) => {
    table.increments("referral_id").primary();
    table.integer("referrer_id").references("user_id").inTable("users");
    table.integer("referred_id").references("user_id").inTable("users");
    table.integer("order_id").references("order_id").inTable("orders");
    table.decimal("commission_amount", 15, 2).notNullable();
    table.specificType("status", "referral_status").defaultTo("pending");
    table.timestamp("created_at").defaultTo(knex.fn.now());
  });

  // Create file_images table
  await knex.schema.createTable("file_images", (table) => {
    table.increments("image_id").primary();
    table.integer("document_id").references("document_id").inTable("documents");
    table.string("image_path").notNullable();
    table.string("name");
    table.specificType("status", "user_status").defaultTo("pending");
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  // Drop tables in reverse order
  await knex.schema
    .dropTableIfExists("file_images")
    .dropTableIfExists("referral_history")
    .dropTableIfExists("transactions")
    .dropTableIfExists("order_items")
    .dropTableIfExists("orders")
    .dropTableIfExists("documents")
    .dropTableIfExists("universities")
    .dropTableIfExists("subjects")
    .dropTableIfExists("categories")
    .dropTableIfExists("users");

  // Drop ENUM types
  await knex.raw(`
    DROP TYPE IF EXISTS user_status;
    DROP TYPE IF EXISTS order_status;
    DROP TYPE IF EXISTS transaction_type;
    DROP TYPE IF EXISTS transaction_status;
    DROP TYPE IF EXISTS referral_status;
  `);
}
