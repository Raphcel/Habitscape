# 📋 Food Nutrition API — Dokumentasi untuk Tim Fullstack

**Base URL (dev):** `http://localhost:8000`  
**Swagger UI:** `{base_url}/docs` ← buka ini dulu untuk coba semua endpoint  
**ReDoc:** `{base_url}/redoc`

---

## 🗺️ Alur Sistem

```
User foto makanan
      ↓
POST /api/v1/analyze          ← Satu request untuk semua (recommended)
      ↓
[YOLO PyTorch deteksi] → [DeepSeek estimasi gizi] → [DeepSeek ringkasan]
      ↓
Frontend simpan hasil tiap makan (di state / AsyncStorage)
      ↓
POST /api/v1/recap/daily       ← Kirim semua makan sehari untuk rekap
      ↓
DeepSeek generate rekomendasi personal
```

---

## ⚡ Setup (Dev)

```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Setup env
copy .env.example .env
# Edit .env → isi SUMOPOD_API_KEY

# 3. Taruh model
mkdir weights
# Extract best.pt dari food-detection-v1_all_models.zip ke folder weights/
# Struktur akhir:
# weights/
# └── best.pt

# 4. Jalankan
uvicorn app.main:app --reload --port 8000
```

> ⚠️ **Jangan install tensorflow** — tidak dibutuhkan. Model menggunakan PyTorch via ultralytics.

**Catatan Windows:** Jalankan perintah `copy` bukan `cp`.

**Docker:**
```bash
docker build -t food-api .
docker run -p 8000:8000 \
  -e SUMOPOD_API_KEY=your_key \
  -v $(pwd)/weights:/app/weights \
  food-api
```

---

## ⚙️ Konfigurasi `.env`

```dotenv
SUMOPOD_API_KEY=isi_api_key_kamu
SUMOPOD_BASE_URL=https://ai.sumopod.com/v1
SUMOPOD_MODEL=deepseek-v4-pro

TF_MODEL_PATH=weights/best.pt
TF_CONFIDENCE_THRESHOLD=0.2
TF_INPUT_SIZE=640

MAX_IMAGE_SIZE_MB=10
```

> `TF_MODEL_PATH` namanya memang `TF_` tapi isinya path ke `best.pt` (PyTorch). Ini by design agar tidak perlu ubah kode.  
> `TF_CONFIDENCE_THRESHOLD=0.2` — nilai yang sudah terbukti bekerja saat testing.

---

## 📌 Endpoints

### ⭐ `POST /api/v1/analyze` — All-in-one (Pakai ini)

Upload foto → deteksi → gizi → ringkasan AI. Satu request, semua selesai.

**Request:**
```
Content-Type: multipart/form-data
file: <image_file>   (JPG/PNG, maks 10MB)
```

**JavaScript:**
```javascript
const formData = new FormData();
formData.append('file', imageFile);

const res = await fetch('http://localhost:8000/api/v1/analyze', {
  method: 'POST',
  body: formData,
});
const data = await res.json();
```

**Response `200 OK`:**
```json
{
  "detection": {
    "detected_foods": [
      { "label": "ikan goreng", "confidence": 0.652, "bbox": [1.6, 25.6, 528.0, 590.6] }
    ],
    "unique_foods": ["ikan goreng"],
    "image_id": "2c23a229-7c41-4a7f-9c73-9bfcc98df072"
  },
  "nutrition": {
    "foods": [
      {
        "food_name": "ikan goreng",
        "serving_size_g": 100,
        "calories_kcal": 237,
        "protein_g": 27.3,
        "carbs_g": 0,
        "fat_g": 14.2,
        "fiber_g": 0,
        "notes": "Estimasi untuk ikan kembung goreng tanpa tepung."
      }
    ],
    "total_calories": 237,
    "total_protein_g": 27.3,
    "total_carbs_g": 0,
    "total_fat_g": 14.2
  },
  "ai_summary": "Wah, ikan goreng ini sumber protein yang sangat baik dengan 27,3 gram, cocok untuk menjaga massa otot. Karena digoreng, ada tambahan 14,2 gram lemak, jadi nikmatilah secukupnya saja."
}
```

**Error Responses:**
```json
{ "detail": "Tidak ada makanan yang terdeteksi pada gambar ini" }  // 422
{ "detail": "File harus berupa gambar (JPG/PNG)" }                 // 400
{ "detail": "Ukuran gambar maksimal 10MB" }                        // 400
```

---

### `POST /api/v1/detect` — Deteksi Saja (tanpa AI)

**Request:** multipart/form-data, field `file`

**Response:**
```json
{
  "detected_foods": [
    { "label": "ikan goreng", "confidence": 0.652, "bbox": [1.6, 25.6, 528.0, 590.6] }
  ],
  "unique_foods": ["ikan goreng"],
  "image_id": "uuid-disini"
}
```

---

### `POST /api/v1/nutrition` — Estimasi Gizi dari Nama Makanan

Input berupa JSON array nama makanan — **bukan upload gambar**.

**Request:**
```
Content-Type: application/json
Body: ["nasi goreng", "telur goreng", "sambal"]
```

**JavaScript:**
```javascript
const res = await fetch('/api/v1/nutrition', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(["nasi goreng", "telur goreng", "sambal"]),
});
```

**Daftar 17 makanan valid (piring & mangkuk difilter otomatis):**
```
ayam goreng, bakso, bakwan, bubur ayam, ikan goreng, mie ayam,
nasi, nasi goreng, nasi kuning, rendang, sambal, sate, soto,
tahu goreng, telur goreng, telur rebus, tempe goreng
```

---

### `POST /api/v1/recap/daily` — Rekap Harian + Rekomendasi AI

Kirim semua data makan sehari → dapat rekap total + rekomendasi personal dari AI.

> **Penting:** Frontend perlu menyimpan response `nutrition` dari `/analyze` tiap sesi makan
> (di state/AsyncStorage), lalu kirim semua ke sini saat user mau lihat rekap.

**Request:**
```json
{
  "user_id": "user_123",
  "date": "2026-05-26",
  "meals": [
    {
      "meal_type": "lunch",
      "detected_foods": ["ikan goreng"],
      "timestamp": "2026-05-26T12:00:00",
      "nutrition": {
        "foods": [],
        "total_calories": 237,
        "total_protein_g": 27.3,
        "total_carbs_g": 0,
        "total_fat_g": 14.2
      }
    }
  ],
  "user_profile": {
    "usia": 25,
    "berat_kg": 65,
    "tinggi_cm": 168,
    "gender": "laki-laki",
    "tujuan": "menjaga berat badan"
  }
}
```

**Nilai `meal_type` yang valid:** `breakfast` | `lunch` | `dinner` | `snack`

**Response:**
```json
{
  "user_id": "user_123",
  "date": "2026-05-26",
  "total_calories": 237,
  "total_protein_g": 27.3,
  "total_carbs_g": 0,
  "total_fat_g": 14.2,
  "meals_count": 1,
  "nutritional_score": "Kurang",
  "ai_recommendation": "Berdasarkan rekap hari ini, kamu hanya mengonsumsi ikan goreng untuk makan siang..."
}
```

**Nilai `nutritional_score`:** `Sangat Baik` | `Baik` | `Cukup` | `Perlu Perbaikan` | `Kurang`

---

## 💡 Tips Frontend

| # | Tip |
|---|-----|
| 1 | Gunakan `/analyze` untuk scan foto — sudah include deteksi + gizi + AI summary sekaligus |
| 2 | Simpan seluruh object `nutrition` dari response `/analyze` di state/AsyncStorage per sesi makan |
| 3 | `/analyze` butuh ~3–8 detik (YOLO inference + 2x AI call) — wajib tampilkan loading state |
| 4 | `bbox` = `[x1, y1, x2, y2]` dalam pixel relatif ke ukuran gambar asli, bisa dipakai untuk render bounding box overlay |
| 5 | `user_profile` di `/recap/daily` opsional, tapi makin lengkap → rekomendasi AI makin personal |
| 6 | `image_id` bisa disimpan untuk keperluan logging/debug |
| 7 | Jika deteksi kosong (`detected_foods: []`), minta user foto ulang dengan pencahayaan lebih baik atau sudut berbeda |

---

## ⚠️ Catatan Production

Sebelum deploy, ganti `allow_origins` di `app/main.py`:
```python
# Ganti ini:
allow_origins=["*"]

# Jadi ini:
allow_origins=["https://domain-frontend-kamu.com"]
```