from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import bmi

app = FastAPI(
    title="BMI Classification API",
    description="Prediksi klasifikasi BMI + rekomendasi AI via DeepSeek (SumoPod)",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Ganti dengan domain frontend di production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(bmi.router, prefix="/api/v1", tags=["BMI"])


@app.get("/")
def root():
    return {"message": "BMI Classification API is running 🚀"}
