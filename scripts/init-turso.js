require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@libsql/client");

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function main() {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      price REAL NOT NULL DEFAULT 0,
      images TEXT NOT NULL DEFAULT '[]',
      sizes TEXT NOT NULL DEFAULT '[]',
      colors TEXT NOT NULL DEFAULT '[]',
      stock INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'active',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      full_name TEXT NOT NULL,
      phone1 TEXT NOT NULL,
      phone2 TEXT NOT NULL,
      wilaya TEXT NOT NULL,
      commune TEXT NOT NULL,
      delivery_type TEXT NOT NULL,
      shipping_cost REAL NOT NULL,
      subtotal REAL NOT NULL,
      total_price REAL NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      product_id INTEGER,
      product_name TEXT NOT NULL,
      product_price REAL NOT NULL,
      size TEXT,
      color TEXT,
      quantity INTEGER NOT NULL DEFAULT 1,
      line_total REAL NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE SET NULL
    );
  `);

  console.log("Tables created successfully on Turso.");
}

main().catch((err) => {
  console.error("Failed to set up Turso tables:", err);
  process.exit(1);
});