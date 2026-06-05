import numpy as np
import joblib
import tensorflow as tf
from tensorflow.keras import layers
from pathlib import Path

# ─────────────────────────────────────────────
# KONSTANTA
# ─────────────────────────────────────────────
CATEGORY_LABEL = {
    0: "Underweight",
    1: "Normal",
    2: "Overweight",
    3: "Obese",
}

# Urutan fitur HARUS sama dengan saat training (dari notebook)
FEATURE_COLS = [
    "fat_total_g",
    "height_cm",
    "age",
    "sleep_hours",
    "calorie_daily",
    "diet_quality_num",
    "smoker_num",
    "alcohol_high",       # ← derived
    "high_stress",        # ← derived
    "sleep_deprived",     # ← derived
    "alcohol_num",
    "stress_level",
    "fat_ratio_pct",      # ← derived
    "calorie_x_fat",      # ← derived
    "exercise_x_diet",    # ← derived
]

MODEL_PATH  = Path("models/bmi_model_new.keras")
SCALER_PATH = Path("models/scaler_bmi_new.pkl")


# ─────────────────────────────────────────────
# CUSTOM LAYER (wajib didefinisikan ulang saat load)
# ─────────────────────────────────────────────
class SimpleNormalization(layers.Layer):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)

    def call(self, inputs):
        return inputs / (tf.reduce_max(tf.abs(inputs)) + 1e-7)


# ─────────────────────────────────────────────
# SINGLETON  — model & scaler hanya di-load sekali
# ─────────────────────────────────────────────
_model  = None
_scaler = None


def _load():
    global _model, _scaler
    if _model is None:
        if not MODEL_PATH.exists():
            raise FileNotFoundError(
                f"Model tidak ditemukan di '{MODEL_PATH}'. "
                "Pastikan file .keras sudah di-copy ke folder models/"
            )
        _model = tf.keras.models.load_model(
            MODEL_PATH,
            custom_objects={"SimpleNormalization": SimpleNormalization},
            compile=False,
        )
    if _scaler is None:
        if not SCALER_PATH.exists():
            raise FileNotFoundError(
                f"Scaler tidak ditemukan di '{SCALER_PATH}'. "
                "Pastikan file .pkl sudah di-copy ke folder models/"
            )
        _scaler = joblib.load(SCALER_PATH)
    return _model, _scaler


# ─────────────────────────────────────────────
# FEATURE ENGINEERING  (persis dari notebook)
# ─────────────────────────────────────────────
def _build_features(raw: dict) -> np.ndarray:
    """
    Terima 10 fitur dasar dari user, hitung 5 fitur turunan,
    susun sesuai FEATURE_COLS (15 total), kembalikan array (1, 15).
    """
    d = raw.copy()

    # Derived features — identik dengan fungsi prediksi_bmi di notebook
    d["sleep_deprived"]  = int(d["sleep_hours"] < 7)
    d["high_stress"]     = int(d["stress_level"] >= 7)
    d["alcohol_high"]    = int(d["alcohol_num"] >= 2)
    d["fat_ratio_pct"]   = round(d["fat_total_g"] * 9 / d["calorie_daily"] * 100, 2)
    d["exercise_x_diet"] = d["exercise_freq_num"] * d["diet_quality_num"]
    d["calorie_x_fat"]   = d["calorie_daily"] * d["fat_total_g"] / 1000

    # Susun sesuai urutan model
    vector = np.array([[d[col] for col in FEATURE_COLS]])  # shape (1, 15)
    return vector


# ─────────────────────────────────────────────
# PREDICT
# ─────────────────────────────────────────────
def predict_bmi(raw_input: dict) -> dict:
    model, scaler = _load()

    X = _build_features(raw_input)
    X_scaled = scaler.transform(X)

    probs = model.predict(X_scaled, verbose=0)[0]   # shape (4,)
    kelas = int(np.argmax(probs))
    confidence = float(probs[kelas])

    return {
        "bmi_category":         CATEGORY_LABEL[kelas],
        "bmi_category_encoded": kelas,
        "confidence":           round(confidence, 4),
        "probabilities": {
            CATEGORY_LABEL[i]: round(float(p), 4)
            for i, p in enumerate(probs)
        },
    }
