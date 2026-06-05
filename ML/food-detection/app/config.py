from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # ── TensorFlow SavedModel ────────────────────
    TF_MODEL_PATH: str = "weights/best_saved_model"
    TF_CONFIDENCE_THRESHOLD: float = 0.5
    TF_INPUT_SIZE: int = 640          # Model dilatih dengan 640x640

    # ── SumoPod / DeepSeek ───────────────────────
    SUMOPOD_API_KEY: str
    SUMOPOD_BASE_URL: str = "https://ai.sumopod.com/v1"
    SUMOPOD_MODEL: str = "deepseek-v4-pro"

    # ── App ──────────────────────────────────────
    MAX_IMAGE_SIZE_MB: int = 10

    class Config:
        env_file = ".env"


settings = Settings()
