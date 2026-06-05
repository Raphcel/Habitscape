# BMI Classification API

FastAPI untuk prediksi & klasifikasi BMI + rekomendasi AI via DeepSeek (SumoPod).

---

## Struktur Folder

```
bmi-api/
├── app/
│   ├── main.py          # Entry point FastAPI
│   ├── schemas.py       # Request & Response (Pydantic)
│   ├── ml_service.py    # Load model + feature engineering + predict
│   ├── ai_service.py    # Integrasi DeepSeek via SumoPod
│   └── routers/
│       └── bmi.py       # Endpoint /predict-bmi
├── models/              # ← TARUH FILE MODEL DI SINI
│   ├── bmi_model_new.keras
│   └── scaler_bmi_new.pkl
├── .env.example
├── requirements.txt
└── README.md
```

---

## Setup

### 1. Install dependencies

```bash
pip install -r requirements.txt
```

### 2. Taruh file model

Copy 2 file hasil training ke folder `models/`:

```
models/bmi_model_new.keras
models/scaler_bmi_new.pkl
```

### 3. Buat file `.env`

```bash
cp .env.example .env
```

Isi nilai berikut (cek dashboard SumoPod untuk API key dan URL yang tepat):

```env
SUMOPOD_API_KEY=your_key_here
SUMOPOD_BASE_URL=https://api.sumopod.com/v1
DEEPSEEK_MODEL=deepseek-chat
```

### 4. Jalankan server

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Buka **http://localhost:8000/docs** untuk Swagger UI.

---

## Endpoint

### `POST /api/v1/predict-bmi`

User cukup kirim **10 fitur dasar** — feature engineering dihitung otomatis di backend.

**Request Body:**

```json
{
  "fat_total_g": 70,
  "height_cm": 170,
  "age": 22,
  "sleep_hours": 6,
  "calorie_daily": 2200,
  "diet_quality_num": 3,
  "smoker_num": 0,
  "alcohol_num": 1,
  "stress_level": 8,
  "exercise_freq_num": 4
}
```

**Field Reference:**

| Field | Tipe | Keterangan |
|---|---|---|
| `fat_total_g` | float | Total lemak harian (gram) |
| `height_cm` | float | Tinggi badan (cm) |
| `age` | float | Usia (tahun) |
| `sleep_hours` | float | Jam tidur per hari |
| `calorie_daily` | float | Kalori harian (kcal) |
| `diet_quality_num` | int | Kualitas diet (1–5) |
| `smoker_num` | int | Perokok (0=tidak, 1=ya) |
| `alcohol_num` | int | Alkohol (0=tidak, 1=ringan, 2=berat) |
| `stress_level` | float | Level stres (1–10) |
| `exercise_freq_num` | float | Frekuensi olahraga per minggu |

**Response:**

```json
{
  "bmi_category": "Overweight",
  "bmi_category_encoded": 2,
  "confidence": 0.8234,
  "probabilities": {
    "Underweight": 0.0031,
    "Normal": 0.1123,
    "Overweight": 0.8234,
    "Obese": 0.0612
  },
  "ai_recommendation": "Halo! Berdasarkan hasil BMI kamu yang masuk kategori Overweight, berikut rekomendasinya: ..."
}
```

### `GET /api/v1/health`

Health check.

---

## Catatan untuk Fullstack

- `ai_recommendation` tetap diisi walau DeepSeek error (berisi pesan error), jadi frontend tidak perlu null-check khusus
- CORS sudah aktif `allow_origins=["*"]` — ganti dengan domain spesifik di production
- Swagger UI otomatis tersedia di `/docs`
- Model di-load sekali saat request pertama (singleton), request berikutnya langsung dari memory
