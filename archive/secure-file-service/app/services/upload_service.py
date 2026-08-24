from io import BytesIO
from fastapi import UploadFile
from app.config.supabase import supabase
import traceback

async def upload_file_service(file: UploadFile):
    try:
        file_data = await file.read()

        print("Uploading:", file.filename)

        response = supabase.storage.from_("secure-files").upload(
            path=file.filename,
            file=BytesIO(file_data),
            file_options={"upsert": "true"},
        )

        print("SUCCESS:", response)

        return {
            "message": "Success",
            "response": str(response)
        }

    except Exception:
        traceback.print_exc()
        raise