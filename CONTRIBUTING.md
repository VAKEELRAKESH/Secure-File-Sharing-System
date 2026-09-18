# Contributing to TrustShare

Thank you for considering contributing to **TrustShare**! This document provides guidelines and instructions for contributing to the project.

---

## 📋 Prerequisites

- **Python** 3.11 or higher
- **Node.js** 18.0 or higher
- **Git** for version control
- **Docker** *(optional)* for containerized deployment

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/springboardmentor1438v/Team-3-Secure-File-Sharing-System.git
cd Team-3-Secure-File-Sharing-System
```

### 2. Environment Setup

```bash
cp .env.example .env
# Edit .env with your own SECRET_KEY and MASTER_ENCRYPTION_KEY
```

### 3. Backend Setup

```bash
cd backend
python -m venv venv
# Windows:
.\venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000
```

### 4. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

## 🏗 Project Structure

| Directory | Description |
|---|---|
| `backend/` | FastAPI Python backend (API, models, services, security) |
| `backend/app/api/` | REST API route handlers |
| `backend/app/core/` | Configuration, database, cryptography, and rate limiting |
| `backend/app/models/` | SQLAlchemy ORM models |
| `backend/app/schemas/` | Pydantic validation schemas |
| `backend/app/security/` | Token and role utilities |
| `backend/app/services/` | Business logic services (encryption, audit, notifications) |
| `backend/tests/` | Pytest test suite |
| `frontend/` | Next.js 14 web application |
| `frontend/src/app/` | Next.js App Router pages |
| `frontend/src/components/` | Reusable React components |
| `frontend/src/lib/` | Axios API client and interceptors |

---

## 🧪 Running Tests

```bash
cd backend
python -m pytest -v
```

---

## 📝 Coding Standards

- **Backend**: Follow PEP 8 style guidelines for Python code
- **Frontend**: Use consistent JSX formatting and component naming conventions
- **Commits**: Use [Conventional Commits](https://www.conventionalcommits.org/) format:
  - `feat:` for new features
  - `fix:` for bug fixes
  - `docs:` for documentation changes
  - `test:` for test additions/changes
  - `refactor:` for code refactoring

---

## 🔒 Security Guidelines

- **Never** commit `.env` files, database files (`*.db`), or encrypted storage
- **Never** hardcode secrets, API keys, or credentials in source code
- All file encryption uses AES-256-GCM — do not modify the crypto pipeline without review
- Report security vulnerabilities privately — do not open public issues

---

## 📄 License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).
