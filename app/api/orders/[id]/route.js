import { NextResponse } from "next/server";
import { cookies } from "next/headers";
const { updateOrderStatus, getOrder } = require("@/lib/orders");
const { COOKIE_NAME, verifySessionToken } = require("@/lib/auth");

const VALID_STATUSES = ["pending", "confirmed", "shipped", "delivered", "cancelled"];

function isAdmin() {
  const token = cookies().get(COOKIE_NAME)?.value;
  return !!verifySessionToken(token);
}

export async function PATCH(request, { params }) {
  if (!isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  if (!VALID_STATUSES.includes(body.status)) {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  }
  if (!getOrder(params.id)) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }
  const order = updateOrderStatus(params.id, body.status);
  return NextResponse.json({ order });
}
