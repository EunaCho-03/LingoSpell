import os
from io import BytesIO
from flask import Flask, request, jsonify, send_file
from dotenv import load_dotenv

from utility import dub_video, summarize_video

load_dotenv()

app = Flask(__name__)

@app.post("/api/dub")
def dub_route():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded."}), 400

    f = request.files["file"]
    video_bytes = f.read()

    try:
        dubbed_bytes = dub_video(video_bytes, f.filename)

        target_lang = request.form.get("target_lang")

        return send_file(
            BytesIO(dubbed_bytes),
            mimetype="video/mp4",
            as_attachment=False,
            download_name="dubbed.mp4"
        )

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    

@app.post("/api/summarize")
def summarize_route():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded."}), 400

    f = request.files["file"]
    video_bytes = f.read()

    try:
        result = summarize_video(video_bytes)
        return jsonify(result)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5050, debug=True)