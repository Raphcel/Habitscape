# 🍽️ Food Detection & Nutrition API

Bagian dari proyek **Habitscape** — fitur Snap-Food Tracker untuk mendeteksi makanan lokal Indonesia dan menghitung kandungan gizi otomatis menggunakan YOLO + DeepSeek AI.

---

## 📋 Deskripsi

API ini menerima foto makanan, mendeteksi jenis makanan menggunakan model YOLO (PyTorch), lalu mengestimasi kandungan gizi dan memberikan rekomendasi personal menggunakan DeepSeek AI via SumoPod.

**17 kelas makanan yang dapat dideteksi:**
> ayam goreng, bakso, bakwan, bubur ayam, ikan goreng, mie ayam, nasi, nasi goreng, nasi kuning, rendang, sambal, sate, soto, tahu goreng, telur goreng, telur rebus, tempe goreng

---

## 🗂️ Struktur Folder

```
food-detection/
├── app/
│   ├── models/
│   │   └── schemas.py          # Pydantic request/response models
│   ├── routers/
│   │   ├── detection.py        # POST /api/v1/detect
│   │   ├── nutrition.py        # POST /api/v1/nutrition & /analyze
│   │   └── recap.py            # POST /api/v1/recap/daily
│   ├── services/
│   │   ├── detection_service.py  # YOLO inference
│   │   └── ai_service.py         # DeepSeek API calls
│   ├── config.py               # Settings & env vars
│   └── main.py                 # FastAPI entry point
├── weights/                    # ← Tidak di-push (lihat setup model)
│   └── best.pt
├── .env.example
├── API_DOCS.md
├── Dockerfile
└── requirements.txt
```

---

## ⚙️ Setup

### 1. Clone & install dependencies

```bash
git clone https://github.com/rafifdanuja15/Habitscape.git
cd Habitscape/food-detection
pip install -r requirements.txt
```

### 2. Download model

Model tidak disimpan di GitHub. Download dari Google Drive:

📦 **[Download model weights](https://drive.google.com/drive/folders/1rRNdhjqLHTwEjJXHTDu6uvaVWnDvXYEo?usp=sharing)**

Isi folder Drive:
- `best.pt` — model utama (wajib)
- `best_saved_model/` — backup TensorFlow (opsional)

Setelah download, buat folder `weights/` dan taruh `best.pt` di dalamnya:

```
food-detection/
└── weights/
    └── best.pt   ← taruh di sini
```

### 3. Setup environment

```bash
copy .env.example .env
```

Edit file `.env` dan isi nilai berikut:

```dotenv
SUMOPOD_API_KEY=isi_api_key_kamu
SUMOPOD_BASE_URL=https://ai.sumopod.com/v1
SUMOPOD_MODEL=deepseek-v4-pro

TF_MODEL_PATH=weights/best.pt
TF_CONFIDENCE_THRESHOLD=0.2
TF_INPUT_SIZE=640

MAX_IMAGE_SIZE_MB=10
```

> Hubungi AI Engineer tim untuk mendapatkan `SUMOPOD_API_KEY`.

### 4. Jalankan server

```bash
uvicorn app.main:app --reload --port 8000
```

Server berjalan di: `http://localhost:8000`  
Swagger UI: `http://localhost:8000/docs`

---

## 🐳 Docker

```bash
docker build -t food-detection-api .
docker run -p 8000:8000 \
  -e SUMOPOD_API_KEY=your_key \
  -v $(pwd)/weights:/app/weights \
  food-detection-api
```

---

## 📌 Endpoints

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| `POST` | `/api/v1/analyze` | ⭐ Upload foto → deteksi + gizi + AI summary |
| `POST` | `/api/v1/detect` | Upload foto → deteksi makanan saja |
| `POST` | `/api/v1/nutrition` | List nama makanan → estimasi gizi |
| `POST` | `/api/v1/recap/daily` | Semua data makan → rekap harian + rekomendasi AI |

Dokumentasi lengkap dengan contoh request/response: lihat **[API_DOCS.md](./API_DOCS.md)**

---

## 🧪 Testing

### Gambar untuk testing

Download foto makanan untuk uji coba endpoint dari folder Google Drive berikut:

📷 **[Download gambar testing](https://drive.google.com/drive/folders/1rRNdhjqLHTwEjJXHTDu6uvaVWnDvXYEo?usp=sharing)**

### Quick test via curl

```bash
# Test server hidup
curl http://localhost:8000/health

# Test deteksi + gizi + AI (endpoint utama)
curl -X POST http://localhost:8000/api/v1/analyze \
  -F "file=@foto_makanan.jpg"

# Test deteksi saja
curl -X POST http://localhost:8000/api/v1/detect \
  -F "file=@foto_makanan.jpg"

# Test estimasi gizi dari nama makanan
curl -X POST http://localhost:8000/api/v1/nutrition \
  -H "Content-Type: application/json" \
  -d '["nasi", "ayam goreng", "tempe goreng"]'
```

### Contoh response `/api/v1/analyze`

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
  "ai_summary": "Ikan goreng ini sumber protein yang sangat baik dengan 27,3 gram. Karena digoreng, ada tambahan 14,2 gram lemak. Pertimbangkan menambahkan nasi dan sayuran untuk melengkapi asupan karbohidrat dan serat."
}
```

---

## ⚠️ Troubleshooting

| Error | Solusi |
|-------|--------|
| `SUMOPOD_API_KEY missing` | Pastikan file `.env` sudah dibuat dan diisi |
| `weights/best.pt not found` | Download model dari Google Drive, taruh di folder `weights/` |
| Deteksi kosong `[]` | Coba foto ulang dengan pencahayaan lebih baik, atau turunkan `TF_CONFIDENCE_THRESHOLD=0.1` |
| `No module named tensorflow` | Jalankan `pip uninstall tensorflow tensorflow-intel -y` — tidak dibutuhkan |

---

## 👤 Kontak

**AI Engineer:** Muhammad Rafif Danuja  
**Tim:** CC26-PSU279 — Habitscape
