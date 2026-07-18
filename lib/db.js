const path = require("path");
const fs = require("fs");
const Database = require("better-sqlite3");

const DATA_DIR = path.join(process.cwd(), "data");
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const DB_PATH = path.join(DATA_DIR, "store.db");

// Reuse a single connection across hot-reloads in dev.
const globalForDb = globalThis;
const db = globalForDb.__preorder_db || new Database(DB_PATH);
if (process.env.NODE_ENV !== "production") globalForDb.__preorder_db = db;

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    price REAL NOT NULL DEFAULT 0,
    images TEXT NOT NULL DEFAULT '[]',      -- JSON array of /uploads/... paths
    sizes TEXT NOT NULL DEFAULT '[]',       -- JSON array of strings, e.g. ["S","M","L"]
    colors TEXT NOT NULL DEFAULT '[]',      -- JSON array of strings
    stock INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'active',  -- active | preorder | sold_out | hidden
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER,
    product_name TEXT NOT NULL,
    product_price REAL NOT NULL,
    size TEXT,
    color TEXT,
    quantity INTEGER NOT NULL DEFAULT 1,
    full_name TEXT NOT NULL,
    phone1 TEXT NOT NULL,
    phone2 TEXT NOT NULL,
    wilaya TEXT NOT NULL,
    commune TEXT NOT NULL,
    delivery_type TEXT NOT NULL,           -- home | stopdesk
    shipping_cost REAL NOT NULL,
    subtotal REAL NOT NULL,
    total_price REAL NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending', -- pending | confirmed | shipped | delivered | cancelled
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE SET NULL
  );
`);

module.exports = db;
