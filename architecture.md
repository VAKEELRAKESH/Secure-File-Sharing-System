# TrustShare — System Architecture & Design Specification

This document details the software architecture, cryptographic pipeline, data storage layer, and security controls of **TrustShare**, an enterprise-grade encrypted file-sharing and document management platform.

---

## 1. System Architecture Overview

```
+---------------------------------------------------------------------------------------------------+
|                                        CLIENT APPLICATION                                         |
|                 Next.js 14 (React) — Dashboard, Vault, Admin, OTP Verification, Sharing           |
+--------------------------------------------------+------------------------------------------------+
                                                   | HTTPS / REST / JWT Bearer
                                                   v
+---------------------------------------------------------------------------------------------------+
|                                      FASTAPI API SERVER                                           |
|   - OAuth2 / JWT Authentication   - Role-Based Access Control (user, admin)                       |
|   - AES-256-GCM Crypto Engine     - Envelope Key Management (Local KMS / AWS / Azure adapters)    |
|   - OTP & 2FA Verification Engine - Audit Logging & Threat Detection                              |
|   - Notification Dispatcher (SMTP)- In-Memory Decrypted Streaming                                 |
+--------------------------------------------------+------------------------------------------------+
                                                   |
                         +-------------------------+-------------------------+
                         |                                                   |
                         v                                                   v
+---------------------------------------------------+   +-------------------------------------------+
|               DATABASE LAYER                      |   |         ENCRYPTED STORAGE STORE           |
|   - SQLite (Local Dev / Automated Testing)        |   |   - AES-256-GCM Ciphertext on Disk        |
|   - PostgreSQL (Production / Docker Deployment)   |   |   - Zero Plaintext at Rest                |
|   - SQLAlchemy 2.0 ORM Schema & Audit Logs        |   |   - Unique Per-File Encryption Keys       |
+---------------------------------------------------+   +-------------------------------------------+
```

---

## 2. Component Architecture Breakdown

### A. Frontend Web Client (`frontend/src/`)
- **Framework**: Next.js 14 + React with client-side state management and Axios HTTP interceptors.
- **Design System**: Vanilla CSS tokens in `globals.css` with Tailwind CSS integration supporting dynamic Light (warm cream `#F0EEE6`) and Dark (deep slate `#0F1117`) modes.
- **Key Modules**:
  - **Vault Management (`FilesView.jsx`)**: Encrypted document list, search filtering, category sorting, and instant download/share actions.
  - **File Uploader (`FileUploader.jsx`)**: Drag-and-drop multipart upload with category and tag tagging.
  - **OTP Verification View (`verify-otp/page.js`)**: 6-digit numeric input with countdown timer and resend cooldown.
  - **MFA Security Modal (`MfaModal.jsx`)**: QR code display for Google Authenticator / Authy enrollment and 6-digit TOTP verification.
  - **Active Shares View (`ActiveSharesView.jsx`)**: Tokenized share links, access revocation, and passphrase protection status.
  - **Audit Logging & Analytics (`AuditLogTable.jsx`, `AnalyticsCharts.jsx`)**: Threat detection alerts and storage utilization tracking.

### B. Backend Services (`backend/app/`)
- **FastAPI Core**: Modular router architecture under `/api`:
  - `auth.py`: User registration, 6-digit email OTP verification, password hashing (`bcrypt`), JWT token generation, MFA TOTP setup/validation, and secure out-of-band password resets.
  - `files.py`: Chunked file uploads, folder structures, metadata tracking, and in-memory streaming downloads.
  - `shares.py`: Cryptographic share token generation, expiration validation, download counter enforcement, and passphrase checking.
  - `audit.py`: Append-only audit trail and threat detection alert feeds.
  - `analytics.py`: Storage usage breakdown by category and security metrics.
  - `admin.py`: User account management and role-based permissions (`user`, `admin`).

### C. Cryptographic & Security Pipeline (`backend/app/core/crypto.py`)
- **Cipher**: AES-256-GCM (Galois/Counter Mode) authenticated encryption with 12-byte random initialization vectors (IV) and 16-byte authentication tags.
- **Envelope Encryption**:
  - Every file payload is encrypted with a distinct, randomly generated 256-bit key.
  - The per-file key is encrypted using the Server Master Key via `wrap_file_key()` and stored in the database.
  - Master key resolution is handled via the `BaseKeyProvider` abstraction (`LocalEnvKeyProvider` active for development; `AwsKmsKeyProvider` and `AzureKeyVaultKeyProvider` adapter interfaces ready for cloud KMS environments).
- **Decryption Pipeline**: Decryption happens strictly in-memory via `io.BytesIO` streams during authorized user downloads—no plaintext is ever written to temporary disk space.

### D. Data Storage & Persistence
- **Relational Storage**:
  - **Development / Testing**: SQLite (`trustshare.db`) for lightweight, zero-dependency local execution.
  - **Production**: PostgreSQL 15 containerized via Docker Compose (`docker-compose.yml`) using `psycopg2-binary`.
- **Encrypted Payload Store**:
  - Encrypted ciphertext blocks stored under `storage_encrypted/`.

### E. Notification & Out-of-Band Delivery (`backend/app/services/notification_service.py`)
- **SMTP Email Dispatch**: Standard Python `smtplib` / `EmailMessage` engine supporting TLS/SSL SMTP servers.
- **Development Fallback**: When SMTP credentials are not configured, notifications (OTP codes, password reset tokens, security alerts) are dispatched cleanly to the developer console log.

---

## 3. Security Specifications & Verification Matrix

| Security Feature | Implementation | Verification Status |
| :--- | :--- | :---: |
| **AES-256-GCM SSE** | `AES256CryptoService` | ✅ Tested (`test_crypto_engine_aes256`) |
| **OTP Email Verification** | `/api/auth/verify-otp`, `/resend-otp` | ✅ Tested (`test_otp_verification.py`) |
| **TOTP 2FA (RFC 6238)** | `pyotp` + QR Code Base64 | ✅ Tested |
| **Password Reset Security** | Non-leaking generic response + out-of-band JWT | ✅ Tested (`test_password_reset_security.py`) |
| **RBAC Authorization** | OAuth2 JWT Bearer + Role checks | ✅ Tested |
| **Dynamic Light/Dark Themes**| CSS variables + Tailwind Class Mode | ✅ Verified in UI |
