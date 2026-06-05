import uuid
import numpy as np
from PIL import Image
from app.config import settings

# ── Label map dari metadata.yaml ─────────────────────────────
CLASS_NAMES = {
    0: "ayam goreng",
    1: "bakso",
    2: "bakwan",
    3: "bubur ayam",
    4: "ikan goreng",
    5: "mangkuk",
    6: "mie ayam",
    7: "nasi",
    8: "nasi goreng",
    9: "nasi kuning",
    10: "piring",
    11: "rendang",
    12: "sambal",
    13: "sate",
    14: "soto",
    15: "tahu goreng",
    16: "telur goreng",
    17: "telur rebus",
    18: "tempe goreng",
}

NON_FOOD_CLASSES = {"piring", "mangkuk"}

# ── Singleton model ───────────────────────────────────────────
_model = None


def get_model():
    global _model
    if _model is None:
        from ultralytics import YOLO
        # Ultralytics bisa load SavedModel folder langsung
        _model = YOLO(settings.TF_MODEL_PATH)
    return _model


# ── Public API ────────────────────────────────────────────────
def run_detection(image: Image.Image):
    from app.models.schemas import DetectedFood, DetectionResponse

    model = get_model()
    img_array = np.array(image)

    results = model(img_array, conf=settings.TF_CONFIDENCE_THRESHOLD)

    detected_foods = []
    for result in results:
        for box in result.boxes:
            cls_id = int(box.cls[0])
            label = CLASS_NAMES.get(cls_id, "unknown")

            if label in NON_FOOD_CLASSES:
                continue

            confidence = float(box.conf[0])
            bbox = box.xyxy[0].tolist()

            detected_foods.append(DetectedFood(
                label=label,
                confidence=round(confidence, 3),
                bbox=[round(v, 1) for v in bbox],
            ))

    unique_foods = list({f.label for f in detected_foods})

    return DetectionResponse(
        detected_foods=detected_foods,
        unique_foods=unique_foods,
        image_id=str(uuid.uuid4()),
    )