from supabase import create_client
from dotenv import load_dotenv
import os

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

print("URL:", SUPABASE_URL)
print("KEY STARTS WITH:", SUPABASE_KEY[:15])

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)