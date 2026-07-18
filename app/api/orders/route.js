import { NextResponse } from "next/server";
import { cookies } from "next/headers";
const { listOrders, createOrder } = require("@/lib/orders");
const { getProduct, decrementStock } = require("@/lib/products");
const { calculateShipping } = require("@/lib/shippingData");
const { COOKIE_NAME, verifySessionToken } = require("@/lib/auth");

function isAdmin() {
  const token = cookies().get(COOKIE_NAME)?.value;
  return !!verifySessionToken(token);
}

// GET /api/orders — admin only, returns every pre-order.
export async function GET() {
  if (!isAdmin()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ orders: listOrders() });
}

// POST /api/orders — public checkout endpoint.
export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const {
    productId, size, color, quantity,
    fullName, phone1, phone2, wilaya, commune, deliveryType,
  } = body;

  // --- validation -------------------------------------------------------
  const errors = {};
  if (!productId) errors.productId = "Missing product.";
  if (!fullName || !fullName.trim()) errors.fullName = "Full name is required.";
  if (!phone1 || !/^0[5-7][0-9]{8}$/.test(phone1.trim())) errors.phone1 = "Enter a valid Algerian phone number.";
  if (phone2 && !/^0[5-7][0-9]{8}$/.test(phone2.trim())) errors.phone2 = "Enter a valid Algerian phone number.";
  if (!wilaya) errors.wilaya = "Wilaya is required.";
  if (!commune || !commune.trim()) errors.commune = "Commune is required.";
  if (!deliveryType || !["home", "stopdesk"].includes(deliveryType)) errors.deliveryType = "Choose a delivery type.";

  const product = productId ? getProduct(productId) : null;
  if (!product) errors.productId = "Product not found.";

  const qty = Math.max(1, parseInt(quantity, 10) || 1);
  if (product && product.stock <= 0) errors.stock = "This product is sold out.";
  if (product && qty > product.stock) errors.stock = `Only ${product.stock} unit(s) left.`;

  let shipping = { available: false, cost: null };
  if (!errors.wilaya && !errors.deliveryType && !errors.commune) {
    shipping = calculateShipping({ wilaya, deliveryType, commune });
    if (!shipping.available) errors.deliveryType = shipping.error || "Delivery not available for this selection.";
  }

  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ error: "Validation failed", fields: errors }, { status: 400 });
  }

  const subtotal = product.price * qty;
  const shippingCost = shipping.cost;
  const total = subtotal + shippingCost;

  const order = createOrder({
    product_id: product.id,
    product_name: product.name,
    product_price: product.price,
    size: size || null,
    color: color || null,
    quantity: qty,
    full_name: fullName.trim(),
    phone1: phone1.trim(),
    phone2: phone2 ? phone2.trim() : "",
    wilaya,
    commune: commune.trim(),
    delivery_type: deliveryType,
    shipping_cost: shippingCost,
    subtotal,
    total_price: total,
  });

  decrementStock(product.id, qty);

  return NextResponse.json({ order }, { status: 201 });
}
