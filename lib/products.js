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

async function listProducts({ includeHidden = false } = {}) {
  const sql = includeHidden
    ? "SELECT * FROM products ORDER BY created_at DESC"
    : "SELECT * FROM products WHERE status != 'hidden' ORDER BY created_at DESC";
  const result = await db.execute(sql);
  return result.rows.map(rowToProduct);
}

async function getProduct(id) {
  const result = await db.execute({
    sql: "SELECT * FROM products WHERE id = ?",
    args: [id],
  });
  return rowToProduct(result.rows[0]);
}

async function createProduct(data) {
  const result = await db.execute({
    sql: `
      INSERT INTO products (name, description, price, images, sizes, colors, stock, status, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `,
    args: [
      data.name,
      data.description || "",
      Number(data.price) || 0,
      JSON.stringify(data.images || []),
      JSON.stringify(data.sizes || []),
      JSON.stringify(data.colors || []),
      Number(data.stock) || 0,
      data.status || "active",
    ],
  });
  return getProduct(Number(result.lastInsertRowid));
}

async function updateProduct(id, data) {
  const existing = await getProduct(id);
  if (!existing) return null;
  const merged = { ...existing, ...data };
  await db.execute({
    sql: `
      UPDATE products SET
        name = ?,
        description = ?,
        price = ?,
        images = ?,
        sizes = ?,
        colors = ?,
        stock = ?,
        status = ?,
        updated_at = datetime('now')
      WHERE id = ?
    `,
    args: [
      merged.name,
      merged.description || "",
      Number(merged.price) || 0,
      JSON.stringify(merged.images || []),
      JSON.stringify(merged.sizes || []),
      JSON.stringify(merged.colors || []),
      Number(merged.stock) || 0,
      merged.status || "active",
      id,
    ],
  });
  return getProduct(id);
}

async function deleteProduct(id) {
  await db.execute({ sql: "DELETE FROM products WHERE id = ?", args: [id] });
  return true;
}

async function decrementStock(id, quantity) {
  await db.execute({
    sql: "UPDATE products SET stock = MAX(stock - ?, 0), updated_at = datetime('now') WHERE id = ?",
    args: [quantity, id],
  });
}

module.exports = {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  decrementStock,
};