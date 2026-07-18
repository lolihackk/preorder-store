import { NextResponse } from "next/server";
import { cookies } from "next/headers";
const { listProducts, createProduct } = require("@/lib/products");
const { COOKIE_NAME, verifySessionToken } = require("@/lib/auth");

function isAdmin() {
  const token = cookies().get(COOKIE_NAME)?.value;
  return !!verifySessionToken(token);
}

// GET /api/products — public list (used by the storefront + admin table)
export async function GET() {
  const admin = isAdmin();
  return NextResponse.json({ products: listProducts({ includeHidden: admin }) });
}

// POST /api/products — admin only, create a product
export async function POST(request) {
  if (!isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  if (!body.name || !body.name.trim()) {
    return NextResponse.json({ error: "Product name is required." }, { status: 400 });
  }
  if (body.price == null || Number(body.price) < 0) {
    return NextResponse.json({ error: "A valid price is required." }, { status: 400 });
  }

  const product = createProduct(body);
  return NextResponse.json({ product }, { status: 201 });
}
