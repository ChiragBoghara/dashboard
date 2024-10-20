const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  password: "admin",
  host: "localhost",
  port: 5432, // default Postgres port
  database: "MyDashboard",
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};
