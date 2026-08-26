<div align="center">

# 🛡️ TrustShare — Enterprise Encrypted File Sharing Platform

**Next-Generation Zero-Knowledge File Vault & Secure Document Distribution System**

[![Security: AES-256-GCM](https://img.shields.io/badge/Encryption-AES--256--GCM-blue.svg?style=for-the-badge&logo=shield)](https://github.com/VAKEELRAKESH/Secure-File-Sharing-System)
[![Backend: FastAPI](https://img.shields.io/badge/Backend-FastAPI_0.104-009688.svg?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Frontend: Next.js 14](https://img.shields.io/badge/Frontend-Next.js_14-000000.svg?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Docker: Ready](https://img.shields.io/badge/Deployment-Docker_Compose-2496ED.svg?style=for-the-badge&logo=docker)](docker-compose.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)

</div>

---

## 📌 Executive Overview

**TrustShare** is an enterprise-grade, encrypted file-sharing platform designed for high-security document storage, access control, and privacy compliance. Built with **FastAPI** on the backend and **Next.js 14** on the frontend, TrustShare ensures zero-plaintext storage on disk through **server-side AES-256-GCM envelope encryption**, multi-factor authentication (2FA/TOTP), granular share link permissions, real-time threat monitoring, and complete audit logging.

---

## ✨ Key Features & Capabilities

- 🔐 **Server-Side AES-256-GCM Encryption**: Every file payload is encrypted with a unique per-file 256-bit key protected by a Server Master Key.
- 🔑 **Multi-Factor Authentication (2FA/TOTP)**: Built-in 2FA enrollment via Google Authenticator or Authy with QR code generation & verification.
- ✉️ **OTP Email Verification & Async Notifications**: 6-digit email OTP codes required for account activation, sent asynchronously via standard SMTP.
- 🌐 **Granular Link Sharing**: Create cryptographically secure share tokens with optional passphrases, expiration limits (1 hr, 24 hrs, 7 days), and download caps.
- 📊 **Real-Time Audit Trail**: Comprehensive audit logs for every system action with automated detection of failed auth bursts.
- 🎨 **Dynamic UI Themes**: Modern Next.js 14 web application featuring a functional light and dark mode toggle, seamless component rendering, and a dynamic vault storage usage meter.
- ⚡ **In-Memory Decryption Streaming**: Files are decrypted directly in memory during download requests—never written unencrypted to temporary disk space.

---

## 🏛 System Architecture & Data Flow

```text
                                    +-----------------------------------------+
                                    |         Next.js 14 React Client         |
                                    |  (Dynamic Themes, Uploads, Analytics)   |
                                    +--------------------+--------------------+
                                                         | HTTPS / REST / JWT Bearer
                                                         v
                                    +-----------------------------------------+
                                    |             FastAPI Backend             |
                                    |  - JWT Bearer / TOTP 2FA Auth Engine    |
                                    |  - AES-256-GCM Server-Side Encryption   |
                                    |  - KMS Adapters (Local / AWS / Azure)   |
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

## 🔐 Security Specifications & Cryptographic Design

| Security Mechanism | Implementation Details |
|---|---|
| **Symmetric Encryption** | AES-256-GCM (Galois/Counter Mode) with 12-byte initialization vectors (IV) & 16-byte authentication tags |
| **Key Management Interfaces** | Envelope encryption architecture with `LocalEnvKeyProvider` active by default, and `AwsKmsKeyProvider`/`AzureKeyVaultKeyProvider` interface adapters ready for cloud SDK installation. |
| **Authentication** | Custom JWT Bearer flow (`/api/auth/login`) with role-based access control. |
| **Multi-Factor Auth** | Time-based One-Time Passwords (TOTP / RFC 6238) via `pyotp`. |
| **Password Protection** | `bcrypt` adaptive salted hashing. Safe, out-of-band JWT password resets. |
| **Decryption Pipeline** | In-memory RAM streaming (`io.BytesIO`) during authorized user downloads. |

---

## 📂 Repository Structure

```text
Secure-File-Sharing-System/
├── backend/                  # FastAPI Python Backend
│   ├── app/
│   │   ├── api/              # REST Endpoints (Auth, Files, Shares, Admin, Audit)
│   │   ├── core/             # Configuration & Database Engine
│   │   ├── models/           # SQLAlchemy Models (User, File, Share, AuditLog)
│   │   ├── schemas/          # Pydantic Validation Schemas
│   │   ├── security/         # Cryptography & Token Utilities
│   │   └── services/         # Encryption, MFA, Notifications & Key Adapters
│   ├── tests/                # Pytest Test Suite
│   ├── Dockerfile            # Backend Docker Build Spec
│   └── requirements.txt      # Python Dependencies (must match root)
├── frontend/                 # Next.js 14 Web Application
│   ├── src/
│   │   ├── app/              # Next.js App Router Pages
│   │   ├── components/       # Design System & Modular Views
│   │   └── lib/              # Axios API Client & Interceptors
│   ├── package.json          # Node Dependencies
│   └── tailwind.config.js    # Tailwind Styling Config
├── docker-compose.yml        # Multi-Container Deployment Manifest (PostgreSQL + API)
├── architecture.md           # Detailed Architecture Blueprint
├── requirements.txt          # Root Python Dependencies
└── README.md                 # Documentation
```

---

## 🛠️ Quick Start & Installation

### Prerequisites
- **Python**: 3.11 or higher
- **Node.js**: 18.0 or higher
- **Docker** *(Optional)*: Desktop or Engine

### 1. Local Backend Setup (SQLite)
By default, the backend runs against a local SQLite database for easy development.
```bash
cd backend
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000
```
- **Interactive Swagger Docs**: [`http://127.0.0.1:8000/docs`](http://127.0.0.1:8000/docs)

### 2. Local Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
- **Web Application**: [`http://localhost:3000`](http://localhost:3000)

---

## 🐳 Containerized Deployment (PostgreSQL)

To launch the complete production environment using Docker Compose (which spins up a PostgreSQL database container):

```bash
docker-compose up --build -d
```

Services initialized:
- **FastAPI Backend**: `http://localhost:8000`
- **Next.js Web Client**: `http://localhost:3000`

---

## 🧪 Testing & Verification

Run the automated Pytest suite to verify key rotation, encryption stream integrity, and authentication workflows:

```bash
cd backend
python -m pytest -v
```

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
