# Secure-File-Sharing-System (TrustShare)

[![Security: AES-256](https://img.shields.io/badge/Security-AES--256--GCM-blue.svg)](#security--encryption)
[![Backend: FastAPI](https://img.shields.io/badge/Backend-FastAPI%20Python-009688.svg)](https://fastapi.tiangolo.com/)
[![Frontend: Next.js](https://img.shields.io/badge/Frontend-Next.js%20React-000000.svg)](https://nextjs.org/)
[![Docker: Ready](https://img.shields.io/badge/Docker-Containerized-2496ED.svg)](#deployment)

A secure file-sharing platform and document management system that lets users upload, store, and share files safely using server-side AES-256-GCM encryption, multi-factor authentication (2FA/MFA), granular permissions, temporary links, download tracking, threat detection, and real-time audit logs.

---

## 🎨 Enterprise UI/UX & Information Architecture

TrustShare features a streamlined enterprise dark glassmorphic design system:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ TrustShare  🔒 AES-256 Vault                     🔔  ⚙️ Settings  T test_hero ▾  Logout │
├─────────────────┬───────────────────────────────────────────────────────────┤
│ WORKSPACE       │ Vault Files (3 files)                       [Upload File] │
│   Files (3)     ├───────────────────────────────────────────────────────────┤
│   Uploads       │ [Search documents...]            [Category Filter ▾] [🔄]  │
│   Shared Files  ├───────────────────────────────────────────────────────────┤
│   Active Shares │ File Name           Category    Size     Updated  Actions │
│                 │ 🔒 financial.pdf    Document   4.2 MB   8/24/2026 📥 🔗 🗑️ │
│ ACTIVITY        │ 🔒 database.sql     Code       1.1 MB   8/24/2026 📥 🔗 🗑️ │
│   Audit Logs    │                                                           │
│                 ├───────────────────────────────────────────────────────────┤
│ ADMINISTRATION  │                                                           │
│   Admin Console │                                                           │
│   Analytics     │                                                           │
│                 │                                                           │
│ 💾 Vault Storage│                                                           │
│ 34.5 MB / 1 GB  │                                                           │
│ [████░░░░░░] 3% │                                                           │
└─────────────────┴───────────────────────────────────────────────────────────┘
```

### UX & IA Principles Applied
- **Single Persistent Lock Indicator**: Consolidates repetitive encryption blurbs into one clean badge (`🔒 AES-256 Vault`) in the header.
- **Consolidated Role Display**: Displays the user's system role once under their name inside the profile dropdown menu, removing duplicate badges.
- **Streamlined Navigation**: Destructured sidebar categories (`Files`, `Uploads`, `Shared Files`, `Active Shares`, `Audit Logs`, `Admin Console`, `Analytics`).
- **Dynamic Vault Storage Meter**: Real-time storage usage progress bar integrated at the base of the navigation sidebar.
- **UI Design System Primitives**: Reusable `Card`, `Button`, `Badge`, `Input`, and `AppLayout` shell components for modular maintainability.

---

## Technical Architecture

```
                                    +-----------------------------------------+
                                    |         Next.js / React Client          |
                                    |  (Glassmorphism UI, Uploads, Analytics) |
                                    +--------------------+--------------------+
                                                         | HTTPS / REST / JWT
                                                         v
                                    +-----------------------------------------+
                                    |             FastAPI Backend             |
                                    |  - JWT / OAuth2 / TOTP 2FA Auth Engine  |
                                    |  - AES-256-GCM Server-Side Encryption   |
                                    |  - Envelope Key Management & Rotation   |
                                    |  - Audit Trail & Threat Detection       |
                                    +---------+------------------+------------+
                                              |                  |
                       +----------------------+                  +----------------------+
                       v                                                                v
          +-------------------------+                                      +-------------------------+
          |  SQLAlchemy Database    |                                      | Encrypted Storage Store |
          |  (Users, Keys, Folders, |                                      |  (AES-256 Encrypted     |
          |   File Metadata, Audit) |                                      |   Ciphertext Storage)   |
          +-------------------------+                                      +-------------------------+
```

---

## Core Security & Platform Modules

### 1. User Authentication & Access Control
- **JWT Authentication**: Secure Access & Refresh tokens with RBAC (`user`, `manager`, `admin`).
- **Multi-Factor Authentication (MFA)**: TOTP 2FA setup with QR code generation & validation (`pyotp`).
- **Password Recovery & Hashing**: Salting & password hashing via `bcrypt`.

### 2. Server-Side AES-256 Encryption Engine
- **Unique Per-File Encryption Key**: Every uploaded file is assigned a newly generated 256-bit AES key.
- **AES-256-GCM Authenticated Encryption**: Ciphertext is protected with a 12-byte nonce & 16-byte authentication tag. Zero plaintext is stored on disk.
- **Envelope Key Management**: Unique file keys are encrypted with a Server Master Key before storing in the database.
- **Temporary In-Memory Decryption Stream**: Files are decrypted temporarily in RAM for authorized downloads without writing temporary files to disk.

### 3. Secure File Sharing & Access Management
- **Token-Based Share Links**: Random cryptographically secure URL tokens (`/share/[token]`).
- **Granular Permissions**: View-Only vs Download Access options.
- **Time-Limited Access**: Link expiration rules (1 Hour, 24 Hours, 7 Days, Custom).
- **Passphrase & Download Limits**: Optional password protection and maximum download counter tracking.

### 4. Audit Logging & Suspicious Activity Monitoring
- **Complete Audit Trail**: Real-time event log tracking logins, file uploads, downloads, share links, and authorization failures with IP & User-Agent records.
- **Automated Threat Detection Engine**: Automatically flags rapid burst downloads, failed authentication spikes, and generates high-severity security alerts.

### 5. Analytics & Security Dashboards
- **Storage Metrics**: Total encrypted storage, protected files count, total downloads, active shares.
- **Visual Categorization**: Category distribution charts (Documents, Images, Code, Archives, Video).

---

## Getting Started & Local Setup

### Prerequisites
- Python 3.11+
- Node.js 18+

### 1. Backend Setup
```bash
cd backend
python -m pip install -r requirements.txt
python -m pytest tests/test_encryption_and_flow.py  # Run test suite
python -m uvicorn main:app --reload --port 8000
```
- API Docs: `http://127.0.0.1:8000/docs`

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
- Web Application: `http://localhost:3000`

---

## Containerized Deployment (Docker)

To deploy the full platform using Docker Compose:
```bash
docker-compose up --build -d
```
This launches:
- **FastAPI API**: `http://localhost:8000`
- **Next.js Web Client**: `http://localhost:3000`
