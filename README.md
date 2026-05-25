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
| Auth | Firebase Admin SDK + custom claims |
| Payments | PayU — hash generation, status verification webhook |
| Email | SendGrid for booking confirmations |
| Secrets | GCP Secret Manager |
| CI/CD | Cloud Build — auto-deploy to Cloud Run + Firebase Hosting |

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
  ├── createdAt

spaces/{spaceId}
  ├── ownerId (ref: users)
  ├── name, address, location (GeoPoint)
  ├── status: "pending" | "approved" | "rejected"
  ├── images[]
  ├── createdAt

spots/{spotId}
  ├── spaceId (ref: spaces)
  ├── label (e.g. "A1", "B2")
  ├── status: "available" | "reserved" | "taken"
  ├── availability: [{ day, startTime, endTime }]

bookings/{bookingId}
  ├── spotId (ref: spots)
  ├── tenantId (ref: users)
  ├── date, startTime, endTime
  ├── status: "confirmed" | "cancelled" | "completed"
  ├── paymentId, amount
  ├── createdAt
```

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
