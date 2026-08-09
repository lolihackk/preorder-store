const db = require("./db");

function attachItems(order) {
  if (!order) return order;
  const items = db
    .prepare("SELECT * FROM order_items WHERE order_id = ?")
    .all(order.id);
  return { ...order, items };
}

function listOrders() {
  const orders = db.prepare("SELECT * FROM orders ORDER BY created_at DESC").all();
  return orders.map(attachItems);
}

function getOrder(id) {
  const order = db.prepare("SELECT * FROM orders WHERE id = ?").get(id);
  return attachItems(order);
}

// data = { full_name, phone1, phone2, wilaya, commune, delivery_type,
//          shipping_cost, subtotal, total_price,
//          items: [{ product_id, product_name, product_price, size, color, quantity, line_total }, ...] }
function createOrder(data) {
  const insertOrder = db.prepare(`
    INSERT INTO orders (
      full_name, phone1, phone2, wilaya, commune, delivery_type,
      shipping_cost, subtotal, total_price, status
    ) VALUES (
      @full_name, @phone1, @phone2, @wilaya, @commune, @delivery_type,
      @shipping_cost, @subtotal, @total_price, 'pending'
    )
  `);

  const insertItem = db.prepare(`
    INSERT INTO order_items (order_id, product_id, product_name, product_price, size, color, quantity, line_total)
    VALUES (@order_id, @product_id, @product_name, @product_price, @size, @color, @quantity, @line_total)
  `);

  const runTransaction = db.transaction((data) => {
    const info = insertOrder.run(data);
    const orderId = info.lastInsertRowid;
    for (const item of data.items) {
      insertItem.run({ ...item, order_id: orderId });
    }
    return orderId;
  });

  const orderId = runTransaction(data);
  return getOrder(orderId);
}

function updateOrderStatus(id, status) {
  db.prepare("UPDATE orders SET status = ? WHERE id = ?").run(status, id);
  return getOrder(id);
}

function deleteOrder(id) {
  // order_items are removed automatically via ON DELETE CASCADE
  const info = db.prepare("DELETE FROM orders WHERE id = ?").run(id);
  return info.changes > 0;
}

module.exports = { listOrders, getOrder, createOrder, updateOrderStatus, deleteOrder };