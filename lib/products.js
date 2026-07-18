const db = require("./db");

function rowToProduct(row) {
  if (!row) return null;
  return {
    ...row,
    images: JSON.parse(row.images || "[]"),
    sizes: JSON.parse(row.sizes || "[]"),
    colors: JSON.parse(row.colors || "[]"),
  };
}

function listProducts({ includeHidden = false } = {}) {
  const rows = includeHidden
    ? db.prepare("SELECT * FROM products ORDER BY created_at DESC").all()
    : db.prepare("SELECT * FROM products WHERE status != 'hidden' ORDER BY created_at DESC").all();
  return rows.map(rowToProduct);
}

function getProduct(id) {
  const row = db.prepare("SELECT * FROM products WHERE id = ?").get(id);
  return rowToProduct(row);
}

function createProduct(data) {
  const stmt = db.prepare(`
    INSERT INTO products (name, description, price, images, sizes, colors, stock, status, updated_at)
    VALUES (@name, @description, @price, @images, @sizes, @colors, @stock, @status, datetime('now'))
  `);
  const info = stmt.run({
    name: data.name,
    description: data.description || "",
    price: Number(data.price) || 0,
    images: JSON.stringify(data.images || []),
    sizes: JSON.stringify(data.sizes || []),
    colors: JSON.stringify(data.colors || []),
    stock: Number(data.stock) || 0,
    status: data.status || "active",
  });
  return getProduct(info.lastInsertRowid);
}

function updateProduct(id, data) {
  const existing = getProduct(id);
  if (!existing) return null;
  const merged = { ...existing, ...data };
  db.prepare(`
    UPDATE products SET
      name = @name,
      description = @description,
      price = @price,
      images = @images,
      sizes = @sizes,
      colors = @colors,
      stock = @stock,
      status = @status,
      updated_at = datetime('now')
    WHERE id = @id
  `).run({
    id,
    name: merged.name,
    description: merged.description || "",
    price: Number(merged.price) || 0,
    images: JSON.stringify(merged.images || []),
    sizes: JSON.stringify(merged.sizes || []),
    colors: JSON.stringify(merged.colors || []),
    stock: Number(merged.stock) || 0,
    status: merged.status || "active",
  });
  return getProduct(id);
}

function deleteProduct(id) {
  db.prepare("DELETE FROM products WHERE id = ?").run(id);
  return true;
}

function decrementStock(id, quantity) {
  db.prepare("UPDATE products SET stock = MAX(stock - ?, 0), updated_at = datetime('now') WHERE id = ?").run(quantity, id);
}

module.exports = {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  decrementStock,
};
