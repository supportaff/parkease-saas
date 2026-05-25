# ParkEase 🅿️

Airbnb for parking spots. 3 roles (Admin, Space Owner, Tenant), real-time Google Maps, PayU payments, Firebase + GCP.

## Stack

| Layer | Tech |
|-------|------|
| Frontend | React + Vite + Firebase Auth |
| Backend | Cloud Run (Node.js + Express) |
| DB | Cloud Firestore (real-time) |
| Maps | Google Maps JS API |
| Payments | PayU |
| CI/CD | Cloud Build |

## Roles

- **Admin** – Approve listings, manage users, monitor bookings
- **Space Owner** – List parking spots, set availability, track bookings
- **Tenant** – Browse map, find spots, book & pay

## Getting Started

```bash
npm install
npm run dev
```