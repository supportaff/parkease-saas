# ParkEase 🅿️

Airbnb for parking spots — built entirely on **Google Cloud Platform**.

## Roles

| Role | Access |
|------|--------|
| **Admin** | Approve listings, manage users, monitor all bookings |
| **Space Owner** | List parking spots, set availability, track bookings/earnings |
| **Tenant** | Browse map, find spots, book & pay via PayU |

## GCP Tech Stack

| Service | Purpose |
|---------|---------|
| **Firebase Hosting** | Frontend hosting (React + Vite) |
| **Firebase Auth** | Authentication with custom claims (admin/owner/tenant) |
| **Cloud Firestore** | Real-time database for spots, bookings, users |
| **Cloud Run** | Backend API (Node.js + Express) |
| **Cloud Storage** | File uploads (spot images, documents) |
| **Secret Manager** | API keys, PayU salt, SendGrid keys |
| **Cloud Build** | CI/CD — auto-deploy on GitHub push |
| **Google Maps Platform** | Maps JS API, Places Autocomplete, Geocoding |

## Frontend (React + Vite)

| Feature | Tech |
|---------|------|
| Framework | React 18 + Vite |
| Auth | Firebase Auth (email/password + Google OAuth) |
| Maps | Google Maps JS API with color-coded markers |
| Real-time | Firestore `onSnapshot` for live map updates |
| Payments | PayU (hash generation, redirect, webhook verification) |
| Deployment | Firebase Hosting via Cloud Build |

## Backend (Cloud Run + Express)

| Feature | Tech |
|---------|------|
| Runtime | Node.js + Express on Cloud Run |
| Database | Cloud Firestore (collections: users, spaces, spots, bookings) |
| Auth | Firebase Admin SDK + custom claims (admin/owner/tenant) |
| Payments | **PayU** — hash generation, form params, success/failure redirect, server-side webhook |
| Notifications | SendGrid for booking confirmations |
| Secrets | GCP Secret Manager |
| CI/CD | Cloud Build — auto-deploy to Cloud Run + Firebase Hosting |

### API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/health` | None | Health check |
| `POST` | `/api/auth/register` | Bearer | Set user role & create Firestore user doc |
| `GET` | `/api/auth/me` | Bearer | Get current user profile |
| `PUT` | `/api/auth/profile` | Bearer | Update name/phone |
| `POST` | `/api/listings` | Owner/Admin | Create parking space + auto-generate spots |
| `GET` | `/api/listings` | Optional | List spaces (role-filtered). Query: `?lat=&lng=&radius=` |
| `GET` | `/api/listings/:id` | None | Space detail with all spots |
| `PUT` | `/api/listings/:id` | Owner/Admin | Update space |
| `DELETE` | `/api/listings/:id` | Owner/Admin | Soft-delete (set disabled) |
| `POST` | `/api/bookings` | Tenant | Create booking (Firestore transaction — concurrency safe) |
| `GET` | `/api/bookings` | Bearer | List bookings (role-scoped) |
| `GET` | `/api/bookings/:id` | Bearer | Booking detail |
| `PUT` | `/api/bookings/:id/cancel` | Bearer | Cancel booking (frees spot) |
| `PUT` | `/api/bookings/:id/checkin` | Bearer | Mark spot occupied (QR) |
| `PUT` | `/api/bookings/:id/checkout` | Bearer | Mark completed, free spot |
| `POST` | `/api/payments/create-order` | Tenant | Generate PayU form params for booking |
| `POST` | `/api/payments/success` | Public | PayU success redirect (verifies hash → confirms booking) |
| `POST` | `/api/payments/failure` | Public | PayU failure redirect |
| `POST` | `/api/payments/webhook` | Public | PayU server-side notification |
| `GET` | `/api/admin/stats` | Admin | Dashboard overview (users, spaces, bookings, revenue) |
| `GET` | `/api/admin/spaces` | Admin | All spaces (incl. pending/disabled) |
| `PUT` | `/api/admin/spaces/:id/approve` | Admin | Approve pending space |
| `PUT` | `/api/admin/spaces/:id/toggle` | Admin | Toggle active/disabled |
| `GET` | `/api/admin/users` | Admin | List all users |
| `PUT` | `/api/admin/users/:id/role` | Admin | Change user role |
| `GET` | `/api/admin/bookings` | Admin | All bookings (optional `?status=` filter) |
| `GET` | `/api/admin/payouts` | Admin | Completed bookings pending owner payout |
| `POST` | `/api/admin/payouts/:id/mark-paid` | Admin | Mark owner payout as paid |

### API File Structure

```
api/
├── index.js              # Express entry — mounts all routes, PayU body parsing
├── lib/
│   ├── firebase.js       # Firebase Admin SDK singleton (init on startup)
│   ├── auth.js           # Auth middleware (verify token, role gate, optional auth)
│   └── payu.js           # PayU hash generation + response verification utilities
├── routes/
│   ├── auth.js           # Register, profile, custom claims
│   ├── listings.js       # CRUD for spaces, spot auto-generation, map endpoint
│   ├── bookings.js       # Booking lifecycle (transaction-safe), checkin/checkout
│   ├── payments.js       # PayU create-order, success/failure/webhook handlers
│   └── admin.js          # Stats, space approval, user management, payouts
├── package.json
└── node_modules/

## Project Structure

```
parkease-saas/
├── api/                  # Cloud Run backend
│   ├── index.js          # Express entry point
│   ├── routes/           # Auth, listings, bookings, payments, admin
│   ├── middleware/       # Firebase auth verification, role check
│   └── package.json
├── src/                  # React frontend
│   ├── main.jsx          # Entry point
│   ├── App.jsx           # Router
│   ├── pages/            # Landing, Login, Tenant, Owner, Admin, Booking
│   ├── components/       # Navbar, Map, SpotCard, etc.
│   ├── hooks/            # useGoogleMaps, useFirestore
│   └── styles/           # Global CSS
├── lib/                  # Firebase config
├── public/
├── firebase.json         # Firebase Hosting config
├── cloudbuild.yaml       # Cloud Build CI/CD
└── README.md
```

## Data Model (Firestore)

```
users/{userId}
  ├── role: "admin" | "owner" | "tenant"
  ├── name, email, phone
  ├── walletBalance (number — for owner payouts)
  ├── createdAt, updatedAt

spaces/{spaceId}
  ├── ownerId (ref: users)
  ├── name, address, location (GeoPoint)
  ├── basePrice: 20            // ₹/hr
  ├── totalSpots, photos[], amenities[]
  ├── status: "pending" | "active" | "disabled"
  ├── rating, reviewCount
  ├── createdAt, updatedAt

spots/{spotId} (subcollection under spaces)
  ├── label: "A1", "B2"
  ├── type: "car" | "bike"
  ├── currentStatus: "available" | "booked" | "occupied"   // single source of truth
  ├── currentBookingId (ref: bookings — null when available)
  ├── createdAt

bookings/{bookingId}
  ├── spaceId, spotId, tenantId, ownerId
  ├── startTime, endTime (ISO strings)
  ├── hours, amount, commission (10%), ownerPayout
  ├── status: "pending_payment" | "upcoming" | "active" | "completed" | "cancelled"
  ├── txnId (PayU transaction reference)
  ├── paymentId, paymentMethod
  ├── ownerPayoutStatus: "pending" | "paid"
  ├── checkedInAt, checkedOutAt
  ├── createdAt, updatedAt

## Getting Started

```bash
# Clone & install
git clone https://github.com/supportaff/parkease-saas.git
cd parkease-saas

# Frontend
npm install
cp .env.example .env   # Fill in Firebase + Maps + PayU keys
npm run dev

# Backend
cd api
npm install
node index.js
```

> **Note:** No GCP services deployed without explicit approval from [Prakzy](https://github.com/supportaff).
