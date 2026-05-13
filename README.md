# Mobile World

Full-stack e-commerce app for Mobile World, a Karachi phone retailer at Star City Mall. Customers browse published inventory, pay by Meezan Bank transfer, upload a payment screenshot, and collect from the shop. The owner manages inventory and orders through the admin panel.

## Stack

- Frontend: React 18, Vite, React Router v6, Tailwind CSS v3
- Backend: Node.js, Express, SQLite with `better-sqlite3`
- Inventory: flat JSON file at `server/data/inventory.json`
- Email: Nodemailer with Gmail SMTP app password
- Auth: JWT in an httpOnly SameSite=Strict cookie, bcrypt password hash
- Uploads: Multer screenshot uploads, jpg/png/webp only, 5MB max

## Local Setup

Install dependencies:

```bash
npm install
npm --prefix client install
npm --prefix server install
```

Create environment files:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

Generate an admin password hash:

```bash
cd server
node -e "console.log(require('bcryptjs').hashSync('yourpassword', 12))"
```

Paste the hash into `server/.env` as `ADMIN_PASSWORD_HASH`, and set `ADMIN_EMAIL`, `JWT_SECRET`, Gmail SMTP fields, Meezan account fields, and `ALLOWED_ORIGIN`.

Run the apps:

```bash
npm run dev
```

Frontend: `http://localhost:5173`  
Backend: `http://localhost:3001`

## Inventory Import

The current inventory was imported from:

```bash
server/scripts/importInventory.js "C:\Users\mobil\Downloads\MobileHQ_2026-05-09.json"
```

Run it again with:

```bash
cd server
node scripts/importInventory.js "C:\path\to\MobileHQ_2026-05-09.json"
```

The importer:

- reads only IPHONE, SAMSUNG, and GOOGLE source categories
- uses `op` as stock
- applies 10% markup to `costPerUnit`
- sets zero-price products to `published: false`
- strips supplier names from display names
- keeps `_importedFrom` for admin review

## Important Safety Rules Implemented

- Public inventory routes return only `published: true` products.
- `costPrice` is stripped from all public inventory responses.
- Stock is deducted only on the backend when an order is accepted.
- Inventory writes use a temp file followed by rename.
- Admin routes use JWT auth after login.
- SQLite writes use parameterized statements.
- CORS uses only `ALLOWED_ORIGIN`.
- Uploads are not directory-listed, and screenshot previews require admin auth.

## Deployment

Deploy `client/` to Vercel and set:

```bash
VITE_API_BASE_URL=https://your-backend.railway.app
VITE_OWNER_ACCOUNT_TITLE=Mobile World
VITE_OWNER_ACCOUNT_NUMBER=0123456789012345
```

Deploy `server/` to Railway and set the variables from `server/.env.example`, especially:

```bash
NODE_ENV=production
ALLOWED_ORIGIN=https://mobile-world.vercel.app
JWT_SECRET=replace_with_64_char_random_string
ADMIN_PASSWORD_HASH=...
```

## Owner Checklist

- Review `server/data/inventory.json` in the admin panel.
- Set prices for products imported with zero price.
- Toggle products live or hidden with the published switch.
- Add real phone image URLs where available.
- Confirm Meezan account details before going live.
