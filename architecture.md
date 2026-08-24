# TrustShare - System Architecture Blueprint & Analysis

This document details the enterprise system architecture of **TrustShare - Secure File-Sharing & Document Management System**, reflecting the complete architectural reference blueprint.

---

## 1. Architecture Overview Diagram

```
+---------------------------------------------------------------------------------------------------+
|                                        CLIENT APPLICATIONS                                        |
|   [Web App: Next.js/React]   [Mobile App]   [Desktop Client: Upload/Sync]   [Admin Dashboard]     |
+--------------------------------------------------+------------------------------------------------+
                                                   | HTTPS / REST / JWT
                                                   v
+---------------------------------------------------------------------------------------------------+
|                                       SECURE API GATEWAY                                          |
|   - SSL Termination           - Authentication & Authorization    - Request Sanitation            |
|   - Rate Limiting             - Audit Logging                     - Routing                       |
+--------------------------------------------------+------------------------------------------------+
                                                   |
                                                   v
+---------------------------------------------------------------------------------------------------+
|                                     BACKEND SERVICES LAYER                                        |
|  +----------------+  +----------------+  +-------------------+  +----------------+  +-------------+ |
|  |  AUTH SERVICE  |  |  FILE SERVICE  |  | ENCRYPTION SERVICE|  | SHARING SERVICE|  | NOTIF /     | |
|  | - User Reg/MFA |  | - Upload/Down  |  | - AES-256-GCM SSE |  | - Token Links  |  | ANALYTICS   | |
|  | - OAuth2 / SSO |  | - Metadata/Ver |  | - Envelope Keys   |  | - Permissions  |  | - Audit Log | |
|  +-------+--------+  +-------+--------+  +---------+---------+  +-------+--------+  +------+------+ |
+----------|-------------------|---------------------|------------------|------------------|--------+
           v                   v                     v                  v                  v
+---------------------------------------------------------------------------------------------------+
|                                   MESSAGE QUEUE / EVENT BUS                                       |
|                            (RabbitMQ / Kafka - Async Event Tasks)                                 |
+--------------------------------------------------+------------------------------------------------+
                                                   |
                                                   v
+---------------------------------------------------------------------------------------------------+
|                                      DATA STORAGE LAYER                                           |
|   [PostgreSQL: Users/Meta]   [MongoDB: Activity Logs]   [Redis: Cache/Sessions]   [Encrypted S3]  |
+---------------------------------------------------------------------------------------------------+
```

---

## 2. Component Layer Breakdown

### A. Client Applications Layer
- **Web Client (`frontend/`)**: Next.js 14 + React featuring glassmorphism UI, drag-and-drop uploader, dashboard analytics, MFA modal, and shared token portal.
- **Admin Dashboard**: Real-time storage metrics, audit log tables, security alerts, and threat monitoring.
- **Mobile & Desktop Sync Clients**: External upload/sync daemons interfacing with the API Gateway.

### B. Secure API Gateway Layer
- **SSL Termination**: Encrypted HTTPS communication.
- **Authentication & RBAC**: OAuth2 JWT verification and role-based permissions (`user`, `manager`, `admin`) via [`backend/app/security/roles.py`](file:///c:/MY%20%F0%9F%93%9A/project%20L/File-Sharing%20System/backend/app/security/roles.py).
- **Request Validation**: Pydantic v2 schemas and rate-limiting middleware.
- **Audit Logging**: Captures request origin IP, User-Agent, and action logs.

### C. Backend Microservices (`backend/app/`)
1. **Auth Service**: Registration, bcrypt password hashing, TOTP 2FA ([`mfa.py`](file:///c:/MY%20%F0%9F%93%9A/project%20L/File-Sharing%20System/backend/app/services/mfa.py)), reset tokens ([`reset_token.py`](file:///c:/MY%20%F0%9F%93%9A/project%20L/File-Sharing%20System/backend/app/security/reset_token.py)).
2. **File Service**: Multi-part streaming upload/download, folder trees, metadata indexing, and multi-version tracking (`FileVersion`).
3. **Encryption Service**: AES-256-GCM authenticated server-side encryption ([`crypto.py`](file:///c:/MY%20%F0%9F%93%9A/project%20L/File-Sharing%20System/backend/app/core/crypto.py)) with Master Key envelope wrapping and in-memory decryption streams.
4. **Sharing Service**: Tokenized share links (`/share/[token]`), permission levels, expiration timers, passphrase protection, and download counters ([`shares.py`](file:///c:/MY%20%F0%9F%93%9A/project%20L/File-Sharing%20System/backend/app/api/shares.py)).
5. **Notification Service**: Share access alerts and event-driven email notifications.
6. **Analytics & Threat Detection Engine**: Storage categorization charts, activity tracking, burst download detection, and high-severity security alerts ([`audit_service.py`](file:///c:/MY%20%F0%9F%93%9A/project%20L/File-Sharing%20System/backend/app/services/audit_service.py)).

### D. Data Storage Layer
- **Relational DB**: SQLite (Development) / PostgreSQL (Production) using SQLAlchemy ORM.
- **Encrypted Storage**: Server-side AES-256 encrypted raw ciphertext directory (`storage_encrypted/`) or cloud blob store (AWS S3 / Azure Blob).
- **Cache**: Redis support for session management, token revocation, and rate limiting.
- **Audit Logs DB**: Dedicated append-only store for security logs.

### E. Infrastructure & Observability
- **Containers**: Multi-container Docker deployment ([`docker-compose.yml`](file:///c:/MY%20%F0%9F%93%9A/project%20L/File-Sharing%20System/docker-compose.yml)).
- **Web Server**: NGINX reverse proxy.
- **Monitoring**: Prometheus + Grafana metrics integration.

---

## 3. Repository Alignment Summary

| Architecture Component | Project Location | Status |
| :--- | :--- | :---: |
| **Web Client Application** | [`frontend/src/app/`](file:///c:/MY%20%F0%9F%93%9A/project%20L/File-Sharing%20System/frontend/src/app) | ✅ Active (Next.js 14) |
| **AES-256-GCM Encryption Engine** | [`backend/app/core/crypto.py`](file:///c:/MY%20%F0%9F%93%9A/project%20L/File-Sharing%20System/backend/app/core/crypto.py) | ✅ Active |
| **JWT & RBAC Security** | [`backend/app/security/roles.py`](file:///c:/MY%20%F0%9F%93%9A/project%20L/File-Sharing%20System/backend/app/security/roles.py) | ✅ Active |
| **TOTP 2FA Engine** | [`backend/app/services/mfa.py`](file:///c:/MY%20%F0%9F%93%9A/project%20L/File-Sharing%20System/backend/app/services/mfa.py) | ✅ Active |
| **Audit Logs & Threat Detection** | [`backend/app/services/audit_service.py`](file:///c:/MY%20%F0%9F%93%9A/project%20L/File-Sharing%20System/backend/app/services/audit_service.py) | ✅ Active |
| **Docker Compose Services** | [`docker-compose.yml`](file:///c:/MY%20%F0%9F%93%9A/project%20L/File-Sharing%20System/docker-compose.yml) | ✅ Active |
