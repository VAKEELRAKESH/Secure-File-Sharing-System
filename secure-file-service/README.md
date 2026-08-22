# 🔐 Secure File Service

A secure file management backend built with **FastAPI** and **Supabase Storage**. This project provides REST APIs for securely uploading and managing files while following a modular backend architecture.

---

## 🚀 Features

- 📤 Secure file upload
- ☁️ Supabase Storage integration
- ⚡ FastAPI REST APIs
- 📖 Interactive Swagger API documentation
- 🏗️ Modular project structure
- 🔒 Environment variable configuration using `.env`

---

## 🛠️ Tech Stack

- **Backend:** FastAPI
- **Language:** Python 3.10+
- **Storage:** Supabase Storage
- **Server:** Uvicorn
- **Configuration:** python-dotenv

---

## 📂 Project Structure

```text
secure-file-service/
│── app/
│   ├── config/
│   │   └── supabase.py
│   ├── routes/
│   │   └── files.py
│   ├── services/
│   │   └── upload_service.py
│   └── main.py
│
├── .gitignore
├── requirements.txt
└── README.md
```

---

## ⚙️ Installation

### Clone the repository

```bash
git clone https://github.com/Yaswanth143n/secure-file-service.git
cd secure-file-service
```

### Create a virtual environment

Windows

```bash
python -m venv venv
venv\Scripts\activate
```

Linux/macOS

```bash
python3 -m venv venv
source venv/bin/activate
```

### Install dependencies

```bash
pip install -r requirements.txt
```

---

## 🔑 Environment Variables

Create a `.env` file in the project root.

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_secret_key
```

---

## ▶️ Run the Application

```bash
uvicorn app.main:app --reload
```

Server will start at:

```
http://127.0.0.1:8000
```

Swagger Documentation:

```
http://127.0.0.1:8000/docs
```

ReDoc Documentation:

```
http://127.0.0.1:8000/redoc
```

---

## 📤 Upload API

### Endpoint

```
POST /upload
```

### Request

Use **multipart/form-data**

| Field | Type |
|-------|------|
| file | File |

### Success Response

```json
{
  "message": "File uploaded successfully!",
  "filename": "example.pdf"
}
```

---

## 📦 Dependencies

- FastAPI
- Uvicorn
- Supabase Python SDK
- python-dotenv

---

## 🔮 Future Enhancements

- 🔐 User Authentication (JWT)
- 📂 Folder Management
- 👥 File Sharing & Permissions
- 🔒 AES-256 File Encryption
- 📥 Secure File Download
- 📝 Audit Logs
- ⏳ Expiring Share Links
- 🗑️ Delete & Restore Files
- 📊 Storage Analytics

---

## 👨‍💻 Author

**Yaswanth T**

GitHub: https://github.com/Yaswanth143n

---

## 📄 License

This project is developed for learning, academic, and portfolio purposes.
