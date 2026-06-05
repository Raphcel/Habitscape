from fastapi import APIRouter, HTTPException
from app.schemas import BMIInput, BMIPredictionResponse
from app.ml_service import predict_bmi
from app.ai_service import get_ai_recommendation

router = APIRouter()


@router.post(
    "/predict-bmi",
    response_model=BMIPredictionResponse,
    summary="Klasifikasi BMI + Rekomendasi AI",
    description="""
Terima **10 fitur dasar** dari user, lalu secara otomatis:
1. Hitung 5 fitur turunan (sesuai pipeline training)
2. Jalankan neural network → klasifikasi BMI
3. Kirim hasil ke DeepSeek via SumoPod → rekomendasi kesehatan personal

**Output kategori:**
| Encoded | Label |
|---------|-------|
| 0 | Underweight |
| 1 | Normal |
| 2 | Overweight |
| 3 | Obese |
""",
)
async def predict_bmi_endpoint(payload: BMIInput):
    try:
        user_data = payload.model_dump()

        # 1. Prediksi ML
        result = predict_bmi(user_data)

        # 2. Rekomendasi AI
        recommendation = await get_ai_recommendation(
            bmi_category=result["bmi_category"],
            confidence=result["confidence"],
            user_data=user_data,
        )

        return BMIPredictionResponse(**result, ai_recommendation=recommendation)

    except FileNotFoundError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Terjadi error: {str(e)}")


@router.get("/health", summary="Health check")
def health():
    return {"status": "ok"}
