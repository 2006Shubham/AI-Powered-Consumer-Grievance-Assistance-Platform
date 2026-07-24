import os
import aiofiles
from pathlib import Path
from typing import Tuple, Optional
import logging
from imagekitio import ImageKit

from backend.shared.config import get_settings

logger = logging.getLogger("storage_service")

ALLOWED_EXTENSIONS = {".pdf", ".png", ".jpg", ".jpeg", ".txt"}
MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB

class StorageService:
    def __init__(self):
        settings = get_settings()
        self.base_path = Path(settings.storage_path)
        self.imagekit_private_key = settings.imagekit_private_key
        
        self.ik: Optional[ImageKit] = None
        if self.imagekit_private_key:
            self.ik = ImageKit(private_key=self.imagekit_private_key)

    def _get_case_directory(self, user_id: str, case_id: str) -> Path:
        dir_path = self.base_path / "evidence" / user_id / case_id
        dir_path.mkdir(parents=True, exist_ok=True)
        return dir_path

    async def save_file(self, user_id: str, case_id: str, filename: str, content: bytes) -> Tuple[str, str, Optional[str]]:
        ext = Path(filename).suffix.lower()
        if ext not in ALLOWED_EXTENSIONS:
            raise ValueError(f"Extension {ext} is not allowed. Supported extensions: {', '.join(ALLOWED_EXTENSIONS)}")

        if len(content) > MAX_FILE_SIZE_BYTES:
            raise ValueError("File size exceeds 10MB limit.")

        safe_filename = "".join([c for c in filename if c.isalnum() or c in (".", "_", "-")])

        # 1. Use ImageKit Cloud Storage if configured
        if self.ik:
            try:
                folder_path = f"/evidence/{user_id}/{case_id}"
                res = self.ik.files.upload(
                    file=content,
                    file_name=safe_filename,
                    folder=folder_path
                )
                storage_key = res.file_id
                file_url = res.url
                return storage_key, f"imagekit://{res.file_path}", file_url
            except Exception as e:
                logger.error(f"ImageKit upload failed, falling back to local storage: {e}")

        # 2. Local Storage Fallback
        dir_path = self._get_case_directory(user_id, case_id)
        file_path = dir_path / safe_filename

        counter = 1
        stem = Path(safe_filename).stem
        while file_path.exists():
            file_path = dir_path / f"{stem}_{counter}{ext}"
            counter += 1

        async with aiofiles.open(file_path, "wb") as f:
            await f.write(content)

        relative_storage_key = str(file_path.relative_to(self.base_path)).replace("\\", "/")
        return relative_storage_key, str(file_path), None

    def get_full_path(self, relative_storage_key: str) -> Path:
        full_path = self.base_path / relative_storage_key
        if not full_path.exists():
            raise FileNotFoundError(f"File at {relative_storage_key} does not exist.")
        return full_path

    async def delete_file(self, relative_storage_key: str) -> bool:
        # Delete from ImageKit if configured
        if self.ik:
            try:
                self.ik.files.delete(file_id=relative_storage_key)
                return True
            except Exception as e:
                logger.warning(f"ImageKit file delete attempted for {relative_storage_key}: {e}")

        # Delete local file
        try:
            full_path = self.get_full_path(relative_storage_key)
            if full_path.exists():
                os.remove(full_path)
                return True
        except FileNotFoundError:
            pass
        return False
