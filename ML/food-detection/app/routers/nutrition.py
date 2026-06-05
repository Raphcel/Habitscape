from fastapi import APIRouter, HTTPException, UploadFile, File
from PIL import Image
import io
from typing import List
from app.services.detection_service import run_detection
from app.services.ai_service import estimate_nutrition, generate_quick_summary
from app.models.schemas import NutritionResponse, AnalyzeResponse

router = APIRouter()

# Label makanan valid dari metadata.yaml (exclude non-food)
VALID_FOOD_LABELS = {
    "ayam goreng", "bakso", "bakwan", "bubur ayam", "ikan goreng",
    "mie ayam", "nasi", "nasi goreng", "nasi kuning", "rendang",
    "sambal", "sate", "soto", "tahu goreng", "telur goreng",
    "telur rebus", "tempe goreng",
}


@router.post(
    "/nutrition",
    response_model=NutritionResponse,
    summary="Estimasi gizi dari daftar nama makanan",
)
async def get_nutrition(food_names: List[str]):
    """
    Berikan daftar nama makanan, return estimasi kandungan gizi dari AI.

    - **food_names**: List nama makanan, e.g. `["ayam goreng", "nasi", "tempe goreng"]`
    - **Returns**: Kandungan gizi per makanan + total
    """
    if not food_names:
        raise HTTPException(status_code=400, detail="Daftar makanan tidak boleh kosong")

    invalid = [f for f in food_names if f not in VALID_FOOD_LABELS]
    if invalid:
        raise HTTPException(
            status_code=400,
            detail={
                "message": "Makanan tidak dikenali model",
                "invalid": invalid,
                "valid_options": sorted(VALID_FOOD_LABELS),
            },
        )

    try:
        return await estimate_nutrition(food_names)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gagal estimasi gizi: {str(e)}")


@router.post(
    "/analyze",
    response_model=AnalyzeResponse,
    summary="Deteksi + estimasi gizi + ringkasan AI dalam satu request",
)
async def analyze_food_image(file: UploadFile = File(...)):
    """
    Upload gambar → deteksi TF SavedModel → estimasi gizi → ringkasan AI.
    Endpoint all-in-one untuk kemudahan frontend.
    """
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File harus berupa gambar (JPG/PNG)")

    contents = await file.read()
    if len(contents) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Ukuran gambar maksimal 10MB")

    try:
        image = Image.open(io.BytesIO(contents)).convert("RGB")
    except Exception:
        raise HTTPException(status_code=400, detail="Gambar tidak valid atau rusak")

    # Step 1: Deteksi TF
    detection = run_detection(image)

    if not detection.unique_foods:
        raise HTTPException(
            status_code=422,
            detail="Tidak ada makanan yang terdeteksi pada gambar ini",
        )

    # Step 2: Estimasi gizi via DeepSeek
    nutrition = await estimate_nutrition(detection.unique_foods)

    # Step 3: Ringkasan AI
    summary = await generate_quick_summary(detection.unique_foods, nutrition)

    return AnalyzeResponse(
        detection=detection,
        nutrition=nutrition,
        ai_summary=summary,
    )
