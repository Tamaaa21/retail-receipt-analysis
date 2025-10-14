from flask import Flask, request, jsonify
import cv2
import pytesseract
import numpy as np
from parser import preprocess_image  # pakai fungsi kamu yang sudah ada

app = Flask(__name__)

@app.route("/api/ocr", methods=["POST"])
def ocr():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]
    img_bytes = file.read()
    
    # ubah jadi numpy array
    np_img = np.frombuffer(img_bytes, np.uint8)
    img = cv2.imdecode(np_img, cv2.IMREAD_COLOR)

    # proses gambar
    processed = preprocess_image(img)
    text = pytesseract.image_to_string(processed)

    return jsonify({"status": "success", "text": text})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
