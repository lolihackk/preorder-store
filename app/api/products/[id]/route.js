import { NextResponse } from "next/server";
import { cookies } from "next/headers";
const { getProduct, updateProduct, deleteProduct } = require("@/lib/products");
const { COOKIE_NAME, verifySessionToken } = require("@/lib/auth");

function isAdmin() {
  const token = cookies().get(COOKIE_NAME)?.value;
  return !!verifySessionToken(token);
}

export async function GET(request, { params }) {
  const product = getProduct(params.id);
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ product });
}

export async function PUT(request, { params }) {
  if (!isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const existing = getProduct(params.id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await request.json().catch(() => ({}));
  const product = updateProduct(params.id, body);
  return NextResponse.json({ product });
}

export async function DELETE(request, { params }) {
  if (!isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const existing = getProduct(params.id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  deleteProduct(params.id);
  return NextResponse.json({ ok: true });
}
