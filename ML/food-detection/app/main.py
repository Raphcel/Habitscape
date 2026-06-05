from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import detection, nutrition, recap

app = FastAPI(
    title="Food Nutrition Detection API",
    description="API untuk deteksi makanan dan rekap gizi harian menggunakan YOLO + DeepSeek AI",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Ganti dengan domain frontend di production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(detection.router, prefix="/api/v1", tags=["Detection"])
app.include_router(nutrition.router, prefix="/api/v1", tags=["Nutrition"])
app.include_router(recap.router, prefix="/api/v1", tags=["Recap"])


@app.get("/", tags=["Health"])
def root():
    return {"status": "ok", "message": "Food Nutrition Detection API is running"}


@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "healthy"}
