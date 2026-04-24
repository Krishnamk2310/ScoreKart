# ScoreKart 🚀

ScoreKart is a modern, full-stack store rating platform built with **React**, **Node.js/Express**, and **PostgreSQL**. It features a robust role-based access control (RBAC) system for Admins, Users, and Store Owners.

## 🌟 Key Features

### 🛡️ Admin Power
- **Insightful Dashboard**: View global statistics including total users, stores, and ratings.
- **User Management**: Search, filter, and manage all users. Create new accounts for any role.
- **Store Oversight**: Create and manage stores, assign owners, and monitor performance.

### 🏪 Store Owners
- **Personal Dashboard**: Track your store's average rating and see total reviews.
- **Rating Breakdown**: Visualize the distribution of ratings (1-5 stars).
- **Customer Feedback**: View a detailed list of all customer ratings and submission dates.

### 👤 Regular Users
- **Discover Stores**: Browse a list of all registered stores.
- **Rating System**: Rate stores with a clean, interactive star interface.
- **Personal History**: View and update your previous ratings.

### 🔐 Secure & Validated
- **JWT Authentication**: Secure login and protected routes for all roles.
- **Data Integrity**: Comprehensive validation on both client and server (names, passwords, emails).
- **Password Security**: Bcrypt hashing for all user credentials.

---

## 🛠️ Tech Stack

- **Frontend**: React, React Router, CSS3 (Glassmorphism inspired)
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL (with `pg` pool)
- **Security**: JWT (jsonwebtoken), Bcrypt
- **Validation**: Custom utility-based validation

---

## 🚀 Quick Start

### 1. Prerequisites
- Node.js (v18+)
- PostgreSQL (v14+)

### 2. Database Setup
```bash
# Create the database
createdb scorekart

# Initialize the schema and seed data
psql scorekart < backend/schema.sql
```

The schema seeds a default admin account:
- **Email**: `admin@example.com`
- **Password**: `Admin@1234`
> [!WARNING]
> Change the default admin password immediately after your first login.

### 3. Backend Setup
```bash
cd backend
cp .env.example .env
# Edit .env to match your local database settings
npm install
npm run dev
```
*Runs on `http://localhost:3001`*

### 4. Frontend Setup
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```
*Runs on `http://localhost:5173`*

---

## 📂 Project Structure

```text
backend/
├── middleware/       # JWT and Role-based guards
├── routes/           # Auth, Admin, Store, and Rating APIs
├── db.js             # PostgreSQL connection pool
├── schema.sql        # Database initialization script
└── validation.js     # Shared validation logic

frontend/src/
├── components/       # Reusable UI (Navbar, StarRating, etc.)
├── context/          # Auth state management
├── pages/            # View components (Dashboards, Login, Signup)
└── api.js            # Axios-style fetch wrapper
```

