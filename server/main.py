import base64
from flask import Flask, request, jsonify
from dotenv import load_dotenv

from utility import dub_video, summarize_video

load_dotenv()

app = Flask(__name__)
app.config["JSON_AS_ASCII"] = False


@app.post("/api/process")
def process_route():
    # 1) upload
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded."}), 400

    f = request.files["file"]
    video_bytes = f.read()
    filename = f.filename or "input.mp4"

    # 2) languages from frontend
    source_lang = (request.form.get("source_lang") or "en").strip().lower()
    target_lang = (request.form.get("target_lang") or "").strip().lower()
    if not target_lang:
        return jsonify({"error": "Missing target_lang. Send target_lang like 'ko', 'en', 'es'."}), 400

    try:
        # 3) dub
        dubbed_bytes = dub_video(video_bytes, filename, source_lang=source_lang, target_lang=target_lang)

        # 4) summarize (choose what you want summarized)
        # option A: summarize original audio but output in target language
        summary = summarize_video(video_bytes, output_lang=target_lang)

        # option B: summarize dubbed audio instead (uncomment)
        # summary = summarize_video(dubbed_bytes, output_lang=target_lang)

        # 5) return JSON (includes dubbed video as base64)
        return jsonify({
            "source_lang": source_lang,
            "target_lang": target_lang,
            "summary": summary,
            "dubbed_mp4_base64": base64.b64encode(dubbed_bytes).decode("utf-8")
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5050, debug=True)