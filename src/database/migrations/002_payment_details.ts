import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  // Create payment_details table
  await knex.schema.createTable("payment_details", (table) => {
    table.bigIncrements("id").primary();
    table.bigInteger("order_id").unsigned().references("id").inTable("orders");
    table
      .string("provider")
      .notNullable()
      .comment("Payment provider (momo, etc.)");
    table
      .string("transaction_id")
      .notNullable()
      .comment("Transaction ID from payment provider");
    table.decimal("amount", 10, 2).notNullable();
    table.jsonb("payment_data").comment("JSON data with payment details");
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("payment_details");
}
