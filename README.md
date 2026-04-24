# Store Rating App

React + Express + PostgreSQL. JWT auth with three roles: admin, user, store_owner.

## Quick start

### 1. Database

```bash
createdb storerating
psql storerating < backend/schema.sql
```

The schema seeds one admin account:
- Email: `admin@example.com`
- Password: `Admin@1234`

Change this before going anywhere near production.

### 2. Backend

```bash
cd backend
cp .env.example .env        # fill in DATABASE_URL and JWT_SECRET
npm install
npm run dev                 # runs on :3001
```

### 3. Frontend

```bash
cd frontend
cp .env.example .env        # VITE_API_URL=http://localhost:3001
npm install
npm run dev                 # runs on :5173
```

## Role behavior

| Role | Can do |
|------|--------|
| `admin` | See stats, manage all users and stores, create any role |
| `user` | Browse stores, submit/edit ratings, change password |
| `store_owner` | View their store's ratings dashboard, change password |

- Normal users sign up at `/signup`
- `admin` and `store_owner` accounts are created by an admin in the Users panel

## Validation rules (enforced client + server)

- Name: 20–60 chars
- Address: max 400 chars
- Password: 8–16 chars, at least 1 uppercase, 1 special character
- Email: standard format

## Project structure

```
backend/
  index.js          Express entry, middleware wiring
  db.js             pg connection pool
  validation.js     Shared validators
  schema.sql        Tables, indexes, seed admin
  middleware/
    auth.js         JWT verify + role guard
  routes/
    auth.js         POST /api/auth/login|signup
    admin.js        GET|POST /api/admin/stats|users|stores
    stores.js       GET /api/stores
    ratings.js      POST /api/ratings
    users.js        PUT /api/users/me/password, GET /api/users/me/store

frontend/src/
  api.js            fetch wrapper with auth header
  App.jsx           Routes
  context/
    AuthContext.jsx  user state, login/logout
  components/
    Navbar.jsx
    ProtectedRoute.jsx
    StarRating.jsx
  pages/
    Login.jsx
    Signup.jsx
    AdminDashboard.jsx
    AdminUsers.jsx
    AdminStores.jsx
    AdminUserDetail.jsx
    StoreList.jsx
    StoreOwnerDashboard.jsx
    ChangePassword.jsx
```
