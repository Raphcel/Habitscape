from fastapi import APIRouter, HTTPException
from app.services.ai_service import generate_daily_recommendation
from app.models.schemas import DailyRecapRequest, DailyRecapResponse

router = APIRouter()


@router.post(
    "/recap/daily",
    response_model=DailyRecapResponse,
    summary="Rekap gizi harian + rekomendasi AI",
)
async def daily_recap(request: DailyRecapRequest):
    """
    Kirim semua data makan dalam sehari, dapatkan rekap gizi + rekomendasi personal dari AI.

    Frontend perlu menyimpan data tiap makan (dari /analyze atau /detect + /nutrition),
    lalu kirim semua sekaligus ke endpoint ini di akhir hari atau kapanpun user mau lihat rekap.

    - **user_id**: ID user dari sistem kamu
    - **date**: Tanggal dalam format YYYY-MM-DD
    - **meals**: List semua sesi makan dalam sehari
    - **user_profile**: (opsional) Data user untuk rekomendasi lebih personal
    """
    if not request.meals:
        raise HTTPException(status_code=400, detail="Data makan tidak boleh kosong")

    # Hitung total dari semua makan
    total_calories = sum(m.nutrition.total_calories for m in request.meals)
    total_protein = sum(m.nutrition.total_protein_g for m in request.meals)
    total_carbs = sum(m.nutrition.total_carbs_g for m in request.meals)
    total_fat = sum(m.nutrition.total_fat_g for m in request.meals)

    try:
        recommendation, score = await generate_daily_recommendation(
            meals=request.meals,
            total_calories=total_calories,
            total_protein=total_protein,
            total_carbs=total_carbs,
            total_fat=total_fat,
            user_profile=request.user_profile,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gagal generate rekomendasi: {str(e)}")

    return DailyRecapResponse(
        user_id=request.user_id,
        date=request.date,
        total_calories=round(total_calories, 1),
        total_protein_g=round(total_protein, 1),
        total_carbs_g=round(total_carbs, 1),
        total_fat_g=round(total_fat, 1),
        meals_count=len(request.meals),
        ai_recommendation=recommendation,
        nutritional_score=score,
    )
