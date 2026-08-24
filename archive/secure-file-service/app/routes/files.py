from fastapi import UploadFile
from app.config.supabase import supabase

async def upload_file_service(file: UploadFile):
    file_data = await file.read()

    response = supabase.storage.from_("secure-files").upload(
        path=file.filename,
        file=file_data,
        file_options={"upsert": "true"},
    )

    return {
        "message": "File uploaded successfully!",
        "filename": file.filename,
        "response": str(response),
    }