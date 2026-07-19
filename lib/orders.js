const db = require("./db");

function listOrders() {
  return db.prepare("SELECT * FROM orders ORDER BY created_at DESC").all();
}

function getOrder(id) {
  return db.prepare("SELECT * FROM orders WHERE id = ?").get(id);
}

function createOrder(data) {
  const stmt = db.prepare(`
    INSERT INTO orders (
      product_id, product_name, product_price, size, color, quantity,
      full_name, phone1, phone2, wilaya, commune, delivery_type,
      shipping_cost, subtotal, total_price, status
    ) VALUES (
      @product_id, @product_name, @product_price, @size, @color, @quantity,
      @full_name, @phone1, @phone2, @wilaya, @commune, @delivery_type,
      @shipping_cost, @subtotal, @total_price, 'pending'
    )
  `);
  const info = stmt.run(data);
  return getOrder(info.lastInsertRowid);
}

function updateOrderStatus(id, status) {
  db.prepare("UPDATE orders SET status = ? WHERE id = ?").run(status, id);
  return getOrder(id);
}

function deleteOrder(id) {
  db.prepare("DELETE FROM orders WHERE id = ?").run(id);
  return true;
}

module.exports = { listOrders, getOrder, createOrder, updateOrderStatus, deleteOrder };