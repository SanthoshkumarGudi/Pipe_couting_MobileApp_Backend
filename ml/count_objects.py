# backend/ml/count_objects.py
import sys
import json
from ultralytics import YOLO


# Load a lightweight pre-trained model (downloads automatically first time)
model = YOLO("/home/santhosh/Santhosh/reactNative/mobile application 2/backend/ml/models/best(1).pt")  # nano version = fast, good enough for prototype

# Get arguments from Node.js
if len(sys.argv) < 3:
    print(json.dumps({"error": "Missing image path or template name"}))
    sys.exit(1)

image_path = sys.argv[1]
template_name = sys.argv[2].strip().lower()  # e.g. "copper tubes"

# Run detection
# results = model(image_path, verbose=False)
results = model(image_path, conf=0.20, iou=0.45, verbose=False)

# For prototype: count ALL objects (we'll improve this later)
total_detections = len(results[0].boxes)

# Simple filtering based on template name (demo logic)
# In real version → load different model or use class ID filtering
count = total_detections

if "copper" in template_name or "tube" in template_name:
    # pretend we are more accurate for copper tubes
    count = int(total_detections * 0.9)  # example adjustment
elif "steel" in template_name or "pipe" in template_name:
    count = int(total_detections * 1.1)  # example
elif "aluminium" in template_name:
    count = int(total_detections * 0.95)


# Output JSON – easy for Node to parse
print(json.dumps({
    "count": count,
    "template_used": template_name,
    "total_detections_raw": total_detections,
    "note": "Prototype – real logic needs custom training"
}))