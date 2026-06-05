import httpx
import os
from dotenv import load_dotenv

load_dotenv()

SUMOPOD_API_KEY  = os.getenv("SUMOPOD_API_KEY", "")
SUMOPOD_BASE_URL = os.getenv("SUMOPOD_BASE_URL", "https://ai.sumopod.com/v1")
# PERBAIKAN 1: Disamakan dengan SUMOPOD_MODEL yang ada di file .env kamu
SUMOPOD_MODEL    = os.getenv("SUMOPOD_MODEL", "deepseek-v4-pro")

# PERBAIKAN 2: Membersihkan whitespace di awal/akhir prompt menggunakan .strip()
SYSTEM_PROMPT = """
Kamu adalah asisten kesehatan yang ramah dan profesional.
Berikan rekomendasi singkat, praktis, dan personal berdasarkan hasil klasifikasi BMI pengguna.

Aturan respons:
- Gunakan Bahasa Indonesia yang mudah dipahami
- Maksimal 4 poin rekomendasi (pola makan, olahraga, tidur, stres)
- Bersifat motivatif, tidak menghakimi
- Akhiri dengan satu kalimat penyemangat
""".strip()


async def get_ai_recommendation(bmi_category: str, confidence: float, user_data: dict) -> str:
    alcohol_label = ["tidak mengonsumsi alkohol", "konsumsi alkohol ringan", "konsumsi alkohol berat"]
    alcohol_idx   = min(int(user_data.get("alcohol_num", 0)), 2)

    user_prompt = f"""
Hasil klasifikasi BMI pengguna:
- Kategori BMI : {bmi_category} (keyakinan model: {confidence * 100:.1f}%)

Data gaya hidup:
- Usia              : {user_data.get('age')} tahun
- Tinggi badan      : {user_data.get('height_cm')} cm
- Jam tidur/hari    : {user_data.get('sleep_hours')} jam
- Level stres       : {user_data.get('stress_level')}/10
- Kalori harian     : {user_data.get('calorie_daily')} kcal
- Total lemak/hari  : {user_data.get('fat_total_g')} gram
- Frekuensi olahraga: {user_data.get('exercise_freq_num')}x/minggu
- Kualitas diet     : {user_data.get('diet_quality_num')}/5
- Perokok           : {'Ya' if user_data.get('smoker_num') else 'Tidak'}
- Alkohol           : {alcohol_label[alcohol_idx]}

Berikan rekomendasi kesehatan yang personal dan praktis.
""".strip()

    headers = {
        "Authorization": f"Bearer {SUMOPOD_API_KEY}",
        "Content-Type": "application/json",
    }

    payload = {
        "model": SUMOPOD_MODEL,  # Menggunakan model yang benar
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user",   "content": user_prompt},
        ],
        "max_tokens": 600,
        "temperature": 0.7,
    }

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                f"{SUMOPOD_BASE_URL}/chat/completions",
                json=payload,
                headers=headers,
            )
            response.raise_for_status()
            return response.json()["choices"][0]["message"]["content"]

    except httpx.HTTPStatusError as e:
        return f"[Rekomendasi AI tidak tersedia: HTTP {e.response.status_code}]"
    except Exception as e:
        return f"[Rekomendasi AI tidak tersedia: {str(e)}]"