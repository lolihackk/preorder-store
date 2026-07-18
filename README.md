# Pre-Order Store

A minimalist beige & white pre-order e-commerce site built with Next.js (App Router),
SQLite, and Tailwind CSS. Includes a public storefront and a password-protected
admin panel.

## Features

**Storefront (User Panel)**
- Browse products, view details, images, sizes/colors, price, stock.
- Pre-order form: full name, two phone numbers, wilaya, commune, delivery type.
- Shipping cost is calculated automatically via `/api/shipping`, using the
  wilaya price table in `lib/shippingData.js`.
- Live order summary (product total + shipping = grand total) before confirming.
- Order is saved to the database and stock is decremented automatically.

**Admin Panel** (`/admin`)
- Add, edit, delete products; upload multiple images per product.
- Manage name, description, price, sizes, colors, stock, and status.
- View every pre-order with customer info, phone numbers, delivery address,
  total price, status, and date — updates automatically (polls every 8s).
- Update order status: pending → confirmed → shipped → delivered / cancelled.

## Tech stack

- **Next.js 14** (App Router, JS) — pages + API routes in one project
- **better-sqlite3** — simple, fast, file-based SQL database (`data/store.db`)
- **Tailwind CSS** — styling, themed with beige/white/clay tokens in `tailwind.config.js`
- **jsonwebtoken + bcryptjs** — admin session cookie auth

## Getting started

```bash
npm install
cp .env.example .env.local   # then edit .env.local with your own admin password + secret
npm run seed                 # optional: adds two sample products
npm run dev
```

Visit `http://localhost:3000` for the store, and `http://localhost:3000/admin`
for the admin panel (log in with the credentials from `.env.local`).

## Environment variables (`.env.local`)

| Variable | Description |
|---|---|
| `ADMIN_USERNAME` | Admin login username |
| `ADMIN_PASSWORD` | Admin login password (plain text, fine for small single-admin setups) |
| `ADMIN_PASSWORD_HASH` | Optional: a bcrypt hash instead of `ADMIN_PASSWORD`, for production |
| `JWT_SECRET` | Long random string used to sign the admin session cookie |
| `NEXT_PUBLIC_SHOP_NAME` | Shown in the header/footer/title |

Generate a bcrypt hash if you want to avoid storing a plain-text password:
```bash
node -e "console.log(require('bcryptjs').hashSync('your-password', 10))"
```

## Updating shipping prices

All wilaya prices and Sétif communes live in `lib/shippingData.js`. Edit the
`WILAYAS` array (home/stopdesk price per wilaya) or `SETIF_COMMUNES` /
`SETIF_PRICING` directly — no other code needs to change. A price of `0`
means that delivery type is disabled for that wilaya (e.g. Stop Desk is
unavailable in In Guezzam and El Meghaier in the current table).

## Project structure

```
app/
  page.js                     Storefront home (product grid)
  products/[id]/page.js       Product detail + pre-order form
  admin/                      Admin panel pages (guarded, redirect to /admin/login)
  api/
    products/                 Product CRUD (admin-only writes, public reads)
    orders/                   Create pre-order (public), list/update (admin-only)
    shipping/                 GET metadata, POST cost calculation
    upload/                   Product image upload (admin-only)
    admin/login, admin/logout Session cookie auth
components/                   Client + presentational components
lib/
  db.js                       SQLite connection + schema
  products.js, orders.js      Data-access helpers
  shippingData.js             Wilaya price table + Sétif communes
  auth.js, requireAdmin.js    Admin session helpers
data/store.db                 SQLite database file (created automatically)
public/uploads/                Uploaded product images
```

## Deployment notes

This app uses a local SQLite file and stores uploaded images on disk, so it
needs a host with a **persistent filesystem and a long-running Node process**
(e.g. a VPS, Railway, Render, Fly.io) — not a stateless serverless platform
like default Vercel deployments, where the filesystem resets between
requests. If you deploy to a serverless platform, swap `better-sqlite3` for a
hosted database (Postgres/MySQL) and product images for object storage
(S3-compatible bucket) — the data-access layer in `lib/` is isolated
specifically so that swap only touches a few files.

Before going live:
1. Set a strong `JWT_SECRET` and admin password (or `ADMIN_PASSWORD_HASH`).
2. Back up `data/store.db` regularly.
3. Consider adding HTTPS (most hosts provide this by default) since login
   posts credentials to `/api/admin/login`.
