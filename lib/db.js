const path = require("path");
const fs = require("fs");
const Database = require("better-sqlite3");

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "store.db");

const globalForDb = globalThis;

function columnExists(instance, table, column) {
  const cols = instance.prepare(`PRAGMA table_info(${table})`).all();
  return cols.some((c) => c.name === column);
}

function migrateToOrderItems(instance) {
  // Old schema: orders had product_id/product_name/... directly on the row.
  // New schema: orders is just the header; order_items holds the products.
  const hasOldColumns = columnExists(instance, "orders", "product_id");
  if (!hasOldColumns) return; // already migrated or fresh DB

  const alreadyHasItems = instance
    .prepare("SELECT COUNT(*) as c FROM order_items")
    .get().c;

  if (alreadyHasItems === 0) {
    // Copy every existing single-product order into order_items
    // so past orders keep showing their product.
    instance.exec(`
      INSERT INTO order_items (order_id, product_id, product_name, product_price, size, color, quantity, line_total)
      SELECT id, product_id, product_name, product_price, size, color, quantity, subtotal
      FROM orders;
    `);
  }

  // Drop the now-redundant columns from orders by rebuilding the table
  // (SQLite doesn't support DROP COLUMN directly in older versions).
  instance.exec(`
    CREATE TABLE orders_new (
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

    INSERT INTO orders_new (id, full_name, phone1, phone2, wilaya, commune, delivery_type, shipping_cost, subtotal, total_price, status, created_at)
    SELECT id, full_name, phone1, phone2, wilaya, commune, delivery_type, shipping_cost, subtotal, total_price, status, created_at
    FROM orders;

    DROP TABLE orders;
    ALTER TABLE orders_new RENAME TO orders;
  `);
}

function initDb() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

  const instance = new Database(DB_PATH);
  instance.pragma("journal_mode = WAL");
  instance.pragma("foreign_keys = ON");
  instance.pragma("busy_timeout = 5000");

  instance.exec(`
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

  migrateToOrderItems(instance);

  return instance;
}

function getDb() {
  if (!globalForDb.__preorder_db) {
    globalForDb.__preorder_db = initDb();
  }
  return globalForDb.__preorder_db;
}

const db = new Proxy(
  {},
  {
    get(_target, prop) {
      const instance = getDb();
      const value = instance[prop];
      return typeof value === "function" ? value.bind(instance) : value;
    },
  }
);

module.exports = db;