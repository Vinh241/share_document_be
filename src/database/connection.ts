import knex from "knex";
import config from "../config";

const db = knex({
  client: "pg",
  connection: {
    host: config.database.host,
    port: config.database.port,
    user: config.database.username,
    password: config.database.password,
    database: config.database.database,
  },
  pool: {
    min: 2,
    max: 10,
  },
});

export default db;
