import { cookies } from "next/headers";
import { NextResponse } from "next/server";
const { listOrders, createOrder } = require("@/lib/orders");
const { getProduct, decrementStock } = require("@/lib/products");
const { calculateShipping } = require("@/lib/shippingData");
const { COOKIE_NAME, verifySessionToken } = require("@/lib/auth");

function isAdmin() {
  const token = cookies().get(COOKIE_NAME)?.value;
  return !!verifySessionToken(token);
}

// GET /api/orders — admin only, returns every pre-order (with items attached).
export async function GET() {
  if (!isAdmin()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ orders: listOrders() });
}

// POST /api/orders — public checkout endpoint. Accepts a basket of items.
// body: { items: [{ productId, size, color, quantity }], fullName, phone1, phone2, wilaya, commune, deliveryType }
export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const {
    items, fullName, phone1, phone2, wilaya, commune, deliveryType,
  } = body;

  // --- validation -------------------------------------------------------
  const errors = {};
  if (!Array.isArray(items) || items.length === 0) errors.items = "Your basket is empty.";
  if (!fullName || !fullName.trim()) errors.fullName = "Full name is required.";
  if (!phone1 || !/^0[5-7][0-9]{8}$/.test(phone1.trim())) errors.phone1 = "Enter a valid Algerian phone number.";
  if (phone2 && !/^0[5-7][0-9]{8}$/.test(phone2.trim())) errors.phone2 = "Enter a valid Algerian phone number.";
  if (!wilaya) errors.wilaya = "Wilaya is required.";
  if (!commune || !commune.trim()) errors.commune = "Commune is required.";
  if (!deliveryType || !["home", "stopdesk"].includes(deliveryType)) errors.deliveryType = "Choose a delivery type.";

  // Resolve + validate each basket line against the real product record.
  const resolvedItems = [];
  if (Array.isArray(items)) {
    for (const line of items) {
      const product = line.productId ? getProduct(line.productId) : null;
      if (!product) {
        errors.items = `A product in your basket is no longer available.`;
        continue;
      }
      const qty = Math.max(1, parseInt(line.quantity, 10) || 1);
      if (product.stock <= 0) {
        errors.items = `${product.name} is sold out.`;
        continue;
      }
      if (qty > product.stock) {
        errors.items = `Only ${product.stock} unit(s) of ${product.name} left.`;
        continue;
      }
      resolvedItems.push({
        product_id: product.id,
        product_name: product.name,
        product_price: product.price,
        size: line.size || null,
        color: line.color || null,
        quantity: qty,
        line_total: product.price * qty,
      });
    }
  }

  let shipping = { available: false, cost: null };
  if (!errors.wilaya && !errors.deliveryType && !errors.commune) {
    shipping = calculateShipping({ wilaya, deliveryType, commune });
    if (!shipping.available) errors.deliveryType = shipping.error || "Delivery not available for this selection.";
  }

  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ error: "Validation failed", fields: errors }, { status: 400 });
  }

  const subtotal = resolvedItems.reduce((sum, i) => sum + i.line_total, 0);
  const shippingCost = shipping.cost;
  const total = subtotal + shippingCost;

  const order = createOrder({
    full_name: fullName.trim(),
    phone1: phone1.trim(),
    phone2: phone2 ? phone2.trim() : "",
    wilaya,
    commune: commune.trim(),
    delivery_type: deliveryType,
    shipping_cost: shippingCost,
    subtotal,
    total_price: total,
    items: resolvedItems,
  });

  // Decrement stock for every product ordered.
  for (const item of resolvedItems) {
    decrementStock(item.product_id, item.quantity);
  }

  return NextResponse.json({ order }, { status: 201 });
}