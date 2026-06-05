from pydantic import BaseModel, Field


# ─────────────────────────────────────────────
# REQUEST  — user cukup isi 10 fitur dasar ini
# ─────────────────────────────────────────────
class BMIInput(BaseModel):
    fat_total_g: float = Field(..., example=70, description="Total lemak harian (gram)")
    height_cm: float = Field(..., example=170, description="Tinggi badan (cm)")
    age: float = Field(..., example=22, description="Usia (tahun)")
    sleep_hours: float = Field(..., example=6.0, description="Jam tidur per hari")
    calorie_daily: float = Field(..., example=2200, description="Kalori harian (kcal)")
    diet_quality_num: int = Field(..., example=3, description="Kualitas diet (1–5)")
    smoker_num: int = Field(..., example=0, description="Perokok? (0=tidak, 1=ya)")
    alcohol_num: int = Field(..., example=1, description="Konsumsi alkohol (0=tidak, 1=ringan, 2=berat)")
    stress_level: float = Field(..., example=8, description="Level stres (1–10)")
    exercise_freq_num: float = Field(..., example=4, description="Frekuensi olahraga per minggu")

    class Config:
        json_schema_extra = {
            "example": {
                "fat_total_g": 70,
                "height_cm": 170,
                "age": 22,
                "sleep_hours": 6,
                "calorie_daily": 2200,
                "diet_quality_num": 3,
                "smoker_num": 0,
                "alcohol_num": 1,
                "stress_level": 8,
                "exercise_freq_num": 4,
            }
        }


# ─────────────────────────────────────────────
# RESPONSE
# ─────────────────────────────────────────────
class BMIPredictionResponse(BaseModel):
    bmi_category: str = Field(..., description="Kategori BMI: Underweight / Normal / Overweight / Obese")
    bmi_category_encoded: int = Field(..., description="0=Underweight, 1=Normal, 2=Overweight, 3=Obese")
    confidence: float = Field(..., description="Probabilitas kelas tertinggi (0–1)")
    probabilities: dict = Field(..., description="Probabilitas tiap kategori")
    ai_recommendation: str = Field(..., description="Rekomendasi kesehatan dari DeepSeek")
