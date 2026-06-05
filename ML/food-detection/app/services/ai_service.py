import json
import httpx
from typing import List
from app.config import settings
from app.models.schemas import NutritionInfo, NutritionResponse, MealEntry


# ── Helper: call SumoPod / DeepSeek ──────────────────────────
async def _call_deepseek(system_prompt: str, user_prompt: str) -> str:
    """
    Panggil DeepSeek via SumoPod (OpenAI-compatible endpoint).
    """
    headers = {
        "Authorization": f"Bearer {settings.SUMOPOD_API_KEY}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": settings.SUMOPOD_MODEL,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        "temperature": 0.3,
        "max_tokens": 2000,
    }

    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(
            f"{settings.SUMOPOD_BASE_URL}/chat/completions",
            headers=headers,
            json=payload,
        )
        response.raise_for_status()
        data = response.json()
        return data["choices"][0]["message"]["content"]


# ── Nutrition Estimation ──────────────────────────────────────
async def estimate_nutrition(food_names: List[str]) -> NutritionResponse:
    system_prompt = """Kamu adalah ahli gizi yang bertugas memberikan estimasi kandungan gizi makanan Indonesia.
Selalu jawab HANYA dalam format JSON valid, tanpa penjelasan tambahan, tanpa markdown code block.
Format response:
{
  "foods": [
    {
      "food_name": "nama makanan",
      "serving_size_g": 150,
      "calories_kcal": 250.0,
      "protein_g": 15.0,
      "carbs_g": 20.0,
      "fat_g": 10.0,
      "fiber_g": 2.0,
      "notes": "catatan opsional"
    }
  ]
}"""

    food_list = ", ".join(food_names)
    user_prompt = f"""Berikan estimasi kandungan gizi untuk makanan berikut dengan porsi standar (1 porsi biasa):
{food_list}

Gunakan data gizi makanan Indonesia yang akurat. Jawab HANYA dengan JSON."""

    raw = await _call_deepseek(system_prompt, user_prompt)

    # Bersihkan jika ada markdown fence yang ikut terkirim
    clean = raw.strip().removeprefix("```json").removeprefix("```").removesuffix("```").strip()
    data = json.loads(clean)
    foods = [NutritionInfo(**item) for item in data["foods"]]

    total_calories = sum(f.calories_kcal for f in foods)
    total_protein = sum(f.protein_g for f in foods)
    total_carbs = sum(f.carbs_g for f in foods)
    total_fat = sum(f.fat_g for f in foods)

    return NutritionResponse(
        foods=foods,
        total_calories=round(total_calories, 1),
        total_protein_g=round(total_protein, 1),
        total_carbs_g=round(total_carbs, 1),
        total_fat_g=round(total_fat, 1),
    )


# ── Daily Recap Recommendation ────────────────────────────────
async def generate_daily_recommendation(
    meals: List[MealEntry],
    total_calories: float,
    total_protein: float,
    total_carbs: float,
    total_fat: float,
    user_profile: dict | None = None,
) -> tuple[str, str]:
    system_prompt = """Kamu adalah ahli gizi dan kesehatan yang memberikan rekomendasi personal berdasarkan asupan makanan harian.
Berikan analisis yang jelas, ramah, dan actionable dalam Bahasa Indonesia.
Jawab HANYA dalam format JSON (tanpa markdown):
{
  "recommendation": "teks rekomendasi panjang disini",
  "nutritional_score": "Sangat Baik | Baik | Cukup | Perlu Perbaikan | Kurang"
}"""

    meal_summary = []
    for meal in meals:
        foods_str = ", ".join(meal.detected_foods)
        meal_summary.append(
            f"- {meal.meal_type.capitalize()}: {foods_str} "
            f"({meal.nutrition.total_calories:.0f} kkal)"
        )
    meals_text = "\n".join(meal_summary)

    profile_text = ""
    if user_profile:
        profile_text = f"\nProfil User: {json.dumps(user_profile, ensure_ascii=False)}"

    user_prompt = f"""Berikut rekap makanan harian user hari ini:

{meals_text}

Total Harian:
- Kalori: {total_calories:.0f} kkal
- Protein: {total_protein:.1f} g
- Karbohidrat: {total_carbs:.1f} g
- Lemak: {total_fat:.1f} g
{profile_text}

Berikan rekomendasi gizi yang personal, mencakup:
1. Evaluasi asupan hari ini
2. Nutrisi yang kurang/berlebih
3. Saran makanan untuk besok
4. Tips kesehatan relevan

Jawab HANYA dengan JSON."""

    raw = await _call_deepseek(system_prompt, user_prompt)
    clean = raw.strip().removeprefix("```json").removeprefix("```").removesuffix("```").strip()
    data = json.loads(clean)

    return data["recommendation"], data.get("nutritional_score", "Cukup")


# ── Quick AI Summary ──────────────────────────────────────────
async def generate_quick_summary(food_names: List[str], nutrition: NutritionResponse) -> str:
    system_prompt = """Kamu adalah asisten gizi yang ramah. Berikan komentar singkat (2-3 kalimat) 
dalam Bahasa Indonesia tentang makanan yang terdeteksi dan kandungan gizinya. 
Bersikap positif tapi informatif. Jawab hanya teks biasa, tanpa JSON, tanpa markdown."""

    foods_str = ", ".join(food_names)
    user_prompt = f"""Makanan terdeteksi: {foods_str}
Total kalori: {nutrition.total_calories:.0f} kkal
Protein: {nutrition.total_protein_g:.1f}g | Karbo: {nutrition.total_carbs_g:.1f}g | Lemak: {nutrition.total_fat_g:.1f}g

Berikan komentar singkat yang ramah dan informatif."""

    return await _call_deepseek(system_prompt, user_prompt)
