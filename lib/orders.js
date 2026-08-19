const db = require("./db");

async function attachItems(order) {
  if (!order) return order;
  const result = await db.execute({
    sql: "SELECT * FROM order_items WHERE order_id = ?",
    args: [order.id],
  });
  return { ...order, items: result.rows };
}

async function listOrders() {
  const result = await db.execute("SELECT * FROM orders ORDER BY created_at DESC");
  const orders = await Promise.all(result.rows.map(attachItems));
  return orders;
}

async function getOrder(id) {
  const result = await db.execute({
    sql: "SELECT * FROM orders WHERE id = ?",
    args: [id],
  });
  return attachItems(result.rows[0]);
}

// data = { full_name, phone1, phone2, wilaya, commune, delivery_type,
//          shipping_cost, subtotal, total_price,
//          items: [{ product_id, product_name, product_price, size, color, quantity, line_total }, ...] }
async function createOrder(data) {
  const orderResult = await db.execute({
    sql: `
      INSERT INTO orders (
        full_name, phone1, phone2, wilaya, commune, delivery_type,
        shipping_cost, subtotal, total_price, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
    `,
    args: [
      data.full_name,
      data.phone1,
      data.phone2,
      data.wilaya,
      data.commune,
      data.delivery_type,
      data.shipping_cost,
      data.subtotal,
      data.total_price,
    ],
  });

  const orderId = Number(orderResult.lastInsertRowid);

  for (const item of data.items) {
    await db.execute({
      sql: `
        INSERT INTO order_items (order_id, product_id, product_name, product_price, size, color, quantity, line_total)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      args: [
        orderId,
        item.product_id,
        item.product_name,
        item.product_price,
        item.size,
        item.color,
        item.quantity,
        item.line_total,
      ],
    });
  }

  return getOrder(orderId);
}

async function updateOrderStatus(id, status) {
  await db.execute({
    sql: "UPDATE orders SET status = ? WHERE id = ?",
    args: [status, id],
  });
  return getOrder(id);
}

async function deleteOrder(id) {
  const result = await db.execute({
    sql: "DELETE FROM orders WHERE id = ?",
    args: [id],
  });
  return result.rowsAffected > 0;
}

module.exports = { listOrders, getOrder, createOrder, updateOrderStatus, deleteOrder };