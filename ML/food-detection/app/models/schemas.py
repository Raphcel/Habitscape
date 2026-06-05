from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


# ── Detection ──────────────────────────────────────────────
class DetectedFood(BaseModel):
    label: str                  # Nama makanan, e.g. "ayam goreng"
    confidence: float           # 0.0 - 1.0
    bbox: List[float]           # [x1, y1, x2, y2]


class DetectionResponse(BaseModel):
    detected_foods: List[DetectedFood]
    unique_foods: List[str]     # Deduplicated food names
    image_id: str               # UUID untuk referensi


# ── Nutrition ───────────────────────────────────────────────
class NutritionInfo(BaseModel):
    food_name: str
    serving_size_g: float       # Estimasi porsi dalam gram
    calories_kcal: float
    protein_g: float
    carbs_g: float
    fat_g: float
    fiber_g: Optional[float] = None
    notes: Optional[str] = None  # Catatan khusus dari AI


class NutritionResponse(BaseModel):
    foods: List[NutritionInfo]
    total_calories: float
    total_protein_g: float
    total_carbs_g: float
    total_fat_g: float


# ── Recap ────────────────────────────────────────────────────
class MealEntry(BaseModel):
    meal_type: str              # "breakfast" | "lunch" | "dinner" | "snack"
    detected_foods: List[str]   # Nama-nama makanan yang terdeteksi
    nutrition: NutritionResponse
    timestamp: datetime


class DailyRecapRequest(BaseModel):
    user_id: str
    date: str                   # format: "YYYY-MM-DD"
    meals: List[MealEntry]
    user_profile: Optional[dict] = None  # Opsional: usia, berat, tinggi, tujuan diet


class DailyRecapResponse(BaseModel):
    user_id: str
    date: str
    total_calories: float
    total_protein_g: float
    total_carbs_g: float
    total_fat_g: float
    meals_count: int
    ai_recommendation: str      # Rekomendasi dari DeepSeek
    nutritional_score: Optional[str] = None  # e.g. "Baik", "Perlu Perbaikan"


# ── Analyze (All-in-one endpoint) ────────────────────────────
class AnalyzeResponse(BaseModel):
    detection: DetectionResponse
    nutrition: NutritionResponse
    ai_summary: str             # Ringkasan singkat dari AI
