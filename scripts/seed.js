// Run with: npm run seed
// Inserts a couple of sample products so the storefront isn't empty on first run.
const { createProduct, listProducts } = require("../lib/products");

const existing = listProducts({ includeHidden: true });
if (existing.length > 0) {
  console.log(`Database already has ${existing.length} product(s). Skipping seed.`);
  process.exit(0);
}

const samples = [
  {
    name: "Heritage Wool Coat",
    description: "A tailored wool coat in warm beige tones. Limited pre-order batch, ships in 3 weeks.",
    price: 12500,
    stock: 20,
    status: "preorder",
    images: [],
    sizes: ["S", "M", "L", "XL"],
    colors: ["Beige", "Camel"],
  },
  {
    name: "Linen Table Runner",
    description: "Handwoven linen table runner, natural undyed fiber.",
    price: 2400,
    stock: 45,
    status: "active",
    images: [],
    sizes: [],
    colors: ["Natural", "Ivory"],
  },
];

for (const s of samples) {
  createProduct(s);
  console.log(`Created product: ${s.name}`);
}
console.log("Seed complete.");
