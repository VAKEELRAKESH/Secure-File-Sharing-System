from typing import Dict, List
from pydantic import BaseModel

class SystemAnalyticsResponse(BaseModel):
    total_users: int
    total_files: int
    total_storage_bytes: int
    total_downloads: int
    active_shares_count: int
    security_alerts_count: int
    category_distribution: Dict[str, int]
    file_type_breakdown: Dict[str, int]
    recent_activity: List[Dict]
