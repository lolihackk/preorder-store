import { NextResponse } from "next/server";
const { WILAYAS, SETIF_COMMUNES, calculateShipping } = require("@/lib/shippingData");
const { getCommunesForWilaya } = require("@/lib/algeriaData");

// GET: metadata used to populate the wilaya / commune / delivery-type controls.
export async function GET() {
  const wilayas = WILAYAS.map((w) => ({
    name: w.name,
    homeAvailable: w.home > 0,
    stopdeskAvailable: w.stopdesk > 0,
    isLocal: !!w.isLocal,
    communes: w.isLocal ? SETIF_COMMUNES : getCommunesForWilaya(w.name),
  }));
  return NextResponse.json({ wilayas, setifCommunes: SETIF_COMMUNES });
}

// POST: calculate the shipping cost for a given wilaya + delivery type (+ commune).
export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const { wilaya, deliveryType, commune } = body;

  if (!wilaya || !deliveryType) {
    return NextResponse.json({ available: false, cost: null, error: "wilaya and deliveryType are required." }, { status: 400 });
  }

  const result = calculateShipping({ wilaya, deliveryType, commune });
  return NextResponse.json(result);
}
