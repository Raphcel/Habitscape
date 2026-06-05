from fastapi import APIRouter, UploadFile, File, HTTPException
from PIL import Image
import io
from app.services.detection_service import run_detection
from app.models.schemas import DetectionResponse

router = APIRouter()


@router.post("/detect", response_model=DetectionResponse, summary="Deteksi makanan dari gambar")
async def detect_food(file: UploadFile = File(...)):
    """
    Upload gambar makanan, return daftar makanan yang terdeteksi.

    - **file**: Gambar (JPG/PNG), maks 10MB
    - **Returns**: List makanan terdeteksi + confidence + bounding box
    """
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File harus berupa gambar (JPG/PNG)")

    contents = await file.read()
    if len(contents) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Ukuran gambar maksimal 10MB")

    try:
        image = Image.open(io.BytesIO(contents)).convert("RGB")
        result = run_detection(image)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gagal memproses gambar: {str(e)}")
