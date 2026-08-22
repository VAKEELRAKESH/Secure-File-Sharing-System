import os

def format_file_size(size_bytes: int) -> str:
    """Formats raw byte count into human-readable representation."""
    if not size_bytes:
        return "0 B"
    size = float(size_bytes)
    for unit in ['B', 'KB', 'MB', 'GB', 'TB']:
        if size < 1024.0:
            return f"{size:.2f} {unit}"
        size /= 1024.0
    return f"{size:.2f} PB"

def sanitize_filename(filename: str) -> str:
    """Sanitizes user filename to prevent path traversal vulnerabilities."""
    return os.path.basename(filename).replace(" ", "_")
