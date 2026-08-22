from fastapi import FastAPI
from app.config.supabase import supabase
from app.routes.files import router

app = FastAPI(
    title="Secure File Management API",
    version="1.0.0"
)

app.include_router(router)

@app.get("/")
def home():
    return {
        "message": "Secure File Management Backend Running 🚀",
        "status": "OK"
    }