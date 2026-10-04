# StoreRate - MERN Store Rating & Review Platform

A full-stack web application built using the **MERN Stack** (MongoDB, Express.js, React.js, Node.js) based strictly on the requirements specified in **Campus-Roxiler-FSDI-Assessment (1).pdf**.

The platform implements a **Single Login System** where all three user roles (**System Administrator**, **Normal User**, and **Store Owner**) authenticate through a unified portal and are automatically routed to their respective dashboards.

---

## 🌟 Demo Credentials

For quick evaluation, the login page features **1-Click Demo Buttons** that automatically populate credentials:

| Role | Email | Password | Name |
| :--- | :--- | :--- | :--- |
| **System Administrator** | `admin@roxiler.com` | `Admin@12345` | Administrator Account Roxiler |
| **Store Owner** | `owner@freshmart.com` | `Owner@12345` | Johnathan Store Owner Person |
| **Normal User** | `alice@customer.com` | `User@12345` | Alice Regular Customer User |
| **Normal User (Alternate)** | `robert@customer.com` | `User@12345` | Robert Regular Shopper Dude |

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18+) & npm

### 1. Start the Backend API
```bash
cd backend
npm start
```
> **Automatic Database Setup**: The backend connects to `process.env.MONGODB_URI` if available. If no standalone MongoDB server is running locally, it automatically initializes an embedded in-memory MongoDB database and auto-seeds the demo dataset on first startup! No complex database installation required.

### 2. Start the Frontend Application
In a separate terminal:
```bash
cd frontend
npm run dev
```
Open **`http://localhost:3000`** in your browser.

### 3. Run Automated Tests
```bash
cd backend
npm test
```
Runs the full automated test suite validating authentication, RBAC, form rules, sorting, filtering, store ratings, and password updates.

---

## 📋 Features by Role (PDF Requirements Checklist)

### 1. Single Login System & Navigation
- [x] Unified single login page (`/login`) for all users.
- [x] Automatic role-based redirection:
  - System Administrator $\rightarrow$ `/admin`
  - Normal User $\rightarrow$ `/stores`
  - Store Owner $\rightarrow$ `/owner`
- [x] Protected routes with RBAC middleware preventing unauthorized access.
- [x] Unified logout button with session invalidation.

---

### 2. System Administrator (`ADMIN`)
- [x] **Dashboard Metrics**:
  - Total number of users
  - Total number of stores
  - Total number of submitted ratings
- [x] **Add Stores**:
  - Modal to register new stores with Name, Email, Address, and optional Store Owner assignment.
- [x] **Add Users**:
  - Modal to create Normal Users, Admin Users, or Store Owners.
- [x] **Store Listings**:
  - Displays: Store Name, Email, Address, and Average Rating (with gold stars).
  - Sorting support on Name, Email, Address, and Rating.
  - Multi-field filters by Name, Email, and Address.
- [x] **User Listings**:
  - Displays: Full Name, Email, Address, and Role badge.
  - **Store Owner Rating**: If the user is a Store Owner, their store's rating is explicitly displayed.
  - Multi-field filters by Name, Email, Address, and Role (`ALL`, `USER`, `ADMIN`, `STORE_OWNER`).
  - Sorting support on Name, Email, Address, and Role.

---

### 3. Normal User (`USER`)
- [x] **Sign Up & Registration**:
  - Dedicated sign up page (`/register`) with real-time validation checklist.
  - Form fields: Name, Email, Address, Password.
- [x] **Store Directory**:
  - View all registered stores.
  - Live search by **Store Name** and **Address**.
  - Displays: Store Name, Address, Overall Rating, and User's Submitted Rating.
- [x] **Rating Submission & Modification**:
  - Interactive 1 to 5 star rating modal.
  - Allows submitting a new rating or modifying existing ratings.
  - Dynamically updates the store's average rating in real-time.
- [x] **Account Security**:
  - Can update password after logging in via the navigation bar.

---

### 4. Store Owner (`STORE_OWNER`)
- [x] **Dashboard Overview**:
  - Displays registered store profile (Name, Email, Address, Total Reviews).
  - Prominent **Average Store Rating** showcase with star distribution.
- [x] **Customer Raters Table**:
  - Displays table of all users who submitted ratings for their store:
    - User Name
    - User Email
    - Rating Submitted (1 to 5 stars)
    - Date and Time
  - Full column sorting support (Name, Email, Rating, Date).
- [x] **Account Security**:
  - Can update password after logging in via the navigation bar.

---

## 🔒 Form Validations (Strict Compliance)

As mandated in the assessment PDF, both frontend and backend enforce:

| Field | Rule | Implementation & UX Feedback |
| :--- | :--- | :--- |
| **Name** | Min 20 characters, Max 60 characters | Live length counter `(N/60)` + validation checklist badge |
| **Address** | Max 400 characters | Textarea with live character counter `(N/400)` |
| **Password** | 8-16 characters, $\ge$ 1 uppercase letter, $\ge$ 1 special character | Dynamic 3-point checklist indicator with green checkmarks |
| **Email** | RFC-compliant email address format | Regex validation on client and server |
| **Ratings** | Integer between 1 and 5 | Interactive 5-star selector preventing invalid scores |

---

## 🛠️ Tech Stack & Directory Structure

- **Backend**: Express.js, Node.js, Mongoose, JSON Web Tokens (JWT), Bcrypt.js, Express-Validator, MongoDB-Memory-Server.
- **Frontend**: React.js (Vite), Tailwind CSS, Lucide React icons, Axios, React Router v6.

```
roxiler/
├── backend/
│   ├── config/
│   │   └── db.js                 # Mongo connector with auto in-memory fallback
│   ├── controllers/
│   │   ├── adminController.js    # Stats, user & store management
│   │   ├── authController.js     # Single login, signup, password update
│   │   ├── ratingController.js   # Rating submission & recalculation
│   │   └── storeController.js    # Store queries & owner dashboard
│   ├── middleware/
│   │   ├── authMiddleware.js     # JWT verification & role authorization
│   │   └── validationMiddleware.js # PDF validation rules
│   ├── models/
│   │   ├── Rating.js             # Rating model with average aggregation
│   │   ├── Store.js              # Store model
│   │   └── User.js               # User model with bcrypt pre-save hook
│   ├── routes/                   # Express route definitions
│   ├── seed/
│   │   └── seedData.js           # Auto-seeder with demo accounts & stores
│   ├── tests/
│   │   └── verify_api.js         # Automated end-to-end API test suite
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── api/axiosClient.js    # Axios instance with JWT interceptor
│   │   ├── components/           # Navbar, StarRating, Modals
│   │   ├── context/AuthContext.jsx # Global auth state & role helpers
│   │   ├── pages/                # Login, Register, Admin, User & Owner dashboards
│   │   ├── App.jsx               # Routes & RBAC guards
│   │   └── main.jsx
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
├── package.json                  # Root npm scripts
└── README.md
```
