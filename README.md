# Mobile World

Full-stack e-commerce app for Mobile World, a Karachi phone retailer at Star City Mall. Customers browse published PTA Approved and Factory Unlocked inventory, pay by Meezan Bank transfer, upload a payment screenshot, and collect from the shop. The owner manages inventory and orders through the admin panel.

## Stack

- Frontend: React 18, Vite, React Router v6, Tailwind CSS v3
- Backend: Node.js, Express, SQLite locally or Heroku Postgres in production
- Inventory: flat JSON locally or Heroku Postgres in production
- Email: Nodemailer with Gmail SMTP app password
- Auth: JWT in an httpOnly SameSite=Strict cookie, bcrypt password hash
- Uploads: Multer screenshot uploads, local files in dev or Cloudinary in production

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

The current local inventory was imported from:

```bash
server/scripts/importInventory.js "C:\Users\mobil\Downloads\MobileHQ_2026-05-09.json"
```

Run it again with:

```bash
cd server
node scripts/importInventory.js "C:\path\to\MobileHQ_2026-05-09.json"
```

If `DATABASE_URL` is present, the importer writes to Postgres. Otherwise it writes to `server/data/inventory.json`.

The importer:

- reads only IPHONE, SAMSUNG, and GOOGLE source categories
- uses `op` as stock
- applies 10% markup to `costPerUnit`
- sets zero-price products to `published: false`
- strips supplier names from display names
- keeps `_importedFrom` for admin review

## Important Safety Rules Implemented

- Public inventory routes return only `published: true` products.
- Public inventory and order placement allow only `pta` and `fu` approval products.
- `costPrice` is stripped from all public inventory responses.
- Stock is deducted only on the backend when an order is accepted.
- Local inventory writes use a temp file followed by rename; Heroku production writes to Postgres.
- Admin routes use JWT auth after login.
- SQLite writes use parameterized statements.
- CORS uses only `ALLOWED_ORIGIN`.
- Uploads are not directory-listed, and screenshot previews require admin auth.

## Heroku Deployment

This repo is Heroku-ready as a single app. Heroku serves:

- React app from `client/dist`
- API routes from `/api/...`

Create the app:

```bash
heroku create mobile-world
```

Add Postgres:

```bash
heroku addons:create heroku-postgresql:essential-0
```

Generate an admin password hash:

```bash
cd server
node -e "console.log(require('bcryptjs').hashSync('yourpassword', 12))"
cd ..
```

Set config vars:

```bash
heroku config:set NODE_ENV=production
heroku config:set ADMIN_EMAIL=your@email.com
heroku config:set ADMIN_PASSWORD_HASH='paste_hash_here'
heroku config:set JWT_SECRET='replace_with_64_char_random_string'
heroku config:set GMAIL_USER=your@gmail.com
heroku config:set GMAIL_APP_PASSWORD='xxxx_xxxx_xxxx_xxxx'
heroku config:set OWNER_EMAIL=notify@youremail.com
heroku config:set OWNER_ACCOUNT_TITLE='Mobile World'
heroku config:set OWNER_ACCOUNT_NUMBER=0123456789012345
heroku config:set CLOUDINARY_CLOUD_NAME=your_cloud_name
heroku config:set CLOUDINARY_API_KEY=your_api_key
heroku config:set CLOUDINARY_API_SECRET=your_api_secret
heroku config:set APP_URL=https://your-app-name.herokuapp.com
heroku config:set GOOGLE_CLIENT_ID=your_google_client_id
heroku config:set GOOGLE_CLIENT_SECRET=your_google_client_secret
heroku config:set GOOGLE_CALLBACK_URL=https://your-app-name.herokuapp.com/api/auth/google/callback
```

For customer Google login, create an OAuth client in Google Cloud Console and add this authorized redirect URI:

```text
https://your-app-name.herokuapp.com/api/auth/google/callback
```

Deploy:

```bash
git push heroku main
```

Seed inventory into Heroku Postgres from your local machine. First get the Heroku database URL:

```bash
heroku config:get DATABASE_URL
```

Then:

```bash
cd server
$env:DATABASE_URL='paste_database_url_here'
node scripts/importInventory.js "C:\path\to\MobileHQ_2026-05-09.json"
```

## Vercel + Railway Alternative

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
