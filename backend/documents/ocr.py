import os
import logging
from typing import Optional

logger = logging.getLogger("document_ocr")

class DocumentOCRService:
    """Simple, clean document text extraction service for PDFs and images."""

    def extract_text_from_pdf(self, file_path: str) -> str:
        """Extract selectable text from PDF using PyMuPDF (fitz)."""
        import fitz
        text = ""
        try:
            doc = fitz.open(file_path)
            for page in doc:
                text += page.get_text("text") + "\n"
            doc.close()
        except Exception as e:
            logger.error(f"Error extracting text from PDF {file_path}: {e}")
        return text.strip()

    def extract_text_from_image(self, file_path: str) -> str:
        """Extract text from image files (PNG, JPG, WEBP) using PIL & OCR."""
        text = ""
        try:
            # Try pytesseract if available
            import pytesseract
            from PIL import Image
            img = Image.open(file_path)
            text = pytesseract.image_to_string(img)
        except Exception as e:
            logger.info(f"Pytesseract not available or failed ({e}). Extracting filename and basic metadata.")
            # Fallback simple text representation
            filename = os.path.basename(file_path)
            text = f"Receipt/Invoice Image Document: {filename}"
        return text.strip()

    def extract_file_text(self, file_path: str, mime_type: str = "") -> str:
        """Route to PDF or Image text extractor based on extension or mime type."""
        ext = os.path.splitext(file_path)[1].lower()
        if ext == ".pdf" or "pdf" in mime_type:
            extracted = self.extract_text_from_pdf(file_path)
            if not extracted:
                extracted = f"Scanned Document: {os.path.basename(file_path)}"
            return extracted
        elif ext in [".png", ".jpg", ".jpeg", ".webp"] or "image" in mime_type:
            return self.extract_text_from_image(file_path)
        else:
            return f"Evidence Document: {os.path.basename(file_path)}"
