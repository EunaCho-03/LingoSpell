# utility.py
import os
import time
import json
import tempfile
from typing import Dict, Any

import requests
from dotenv import load_dotenv
from google import genai


from PyPDF2 import PdfReader

load_dotenv()

# =========================
# ENV VARS / API KEYS
# =========================
XI_API_KEY = os.getenv("ELEVEN_API_KEY")          # ElevenLabs key
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")  # Gemini key

if not XI_API_KEY:
    raise RuntimeError("Missing ELEVEN_API in .env")

if not GEMINI_API_KEY:
    raise RuntimeError("Missing GEMINI_API_KEY in .env")

# =========================
# ELEVENLABS SETUP
# =========================
ELEVEN_BASE_URL = "https://api.elevenlabs.io/v1"
ELEVEN_HEADERS = {"xi-api-key": XI_API_KEY}

# =========================
# GEMINI SETUP
# =========================
gemini_client = genai.Client(api_key=GEMINI_API_KEY)


def dub_video(video_bytes: bytes, filename: str, source_lang: str = "en", target_lang: str = "es") -> bytes:
    """
    Sends video to ElevenLabs and returns dubbed MP4 bytes.
    Frontend should upload MP4 under field 'file'.
    """

    files = {"file": (filename, video_bytes, "video/mp4")}
    data = {
        "source_lang": source_lang,
        "target_lang": target_lang,
        "mode": "automatic",
        "watermark": "true",
    }

    # 1) Create dubbing job
    create_resp = requests.post(
        f"{ELEVEN_BASE_URL}/dubbing",
        headers=ELEVEN_HEADERS,
        files=files,
        data=data,
        timeout=120,
    )
    if not create_resp.ok:
        raise Exception(create_resp.text)

    dubbing_id = create_resp.json().get("dubbing_id")
    if not dubbing_id:
        raise Exception(f"ElevenLabs response missing dubbing_id: {create_resp.text}")

    # 2) Poll status until finished
    for _ in range(120):  # up to ~10 minutes (120 * 5s)
        meta_resp = requests.get(
            f"{ELEVEN_BASE_URL}/dubbing/{dubbing_id}",
            headers=ELEVEN_HEADERS,
            timeout=60,
        )
        if not meta_resp.ok:
            raise Exception(meta_resp.text)

        status = meta_resp.json().get("status")
        if status == "dubbed":
            break
        if status == "failed":
            raise Exception("Dubbing failed")

        time.sleep(5)

    # 3) Download dubbed result
    # (ElevenLabs endpoint name includes /audio/, but it returns the dubbed output bytes)
    file_resp = requests.get(
        f"{ELEVEN_BASE_URL}/dubbing/{dubbing_id}/audio/{target_lang}",
        headers=ELEVEN_HEADERS,
        timeout=300,
    )
    if not file_resp.ok:
        raise Exception(file_resp.text)

    return file_resp.content


def summarize_video(video_bytes: bytes, output_lang: str = "en") -> Dict[str, Any]:
    """
    Uses Gemini to transcribe the video and summarize it.
    output_lang: language code like "en", "ko", "es", "ja", ...
    Returns:
      {
        "transcript": "...",            # transcript (best-effort)
        "summary": "...",               # bullets in output_lang
        "explanation": "..."            # short explanation in output_lang
      }
    """

    with tempfile.NamedTemporaryFile(suffix=".mp4", delete=False) as tmp:
        tmp.write(video_bytes)
        tmp_path = tmp.name

    try:
        uploaded = gemini_client.files.upload(file=tmp_path)

        max_wait_sec = 120
        poll_every_sec = 2
        waited = 0
        while True:
            fobj = gemini_client.files.get(name=uploaded.name)
            state = getattr(fobj, "state", None) or getattr(fobj, "status", None)
            state_str = str(state).upper() if state is not None else ""

            if "ACTIVE" in state_str:
                break
            if any(x in state_str for x in ["FAILED", "ERROR", "DELETED"]):
                raise Exception(f"Gemini file not usable. state={state_str}, file={uploaded.name}")

            time.sleep(poll_every_sec)
            waited += poll_every_sec
            if waited >= max_wait_sec:
                raise Exception(f"Timed out waiting for Gemini file to become ACTIVE. state={state_str}, file={uploaded.name}")

        prompt = f"""
You are given a video file.

Return JSON ONLY (no markdown, no extra text) with exactly these keys:
- transcript: a clean transcript of spoken content (no timestamps). Keep it in the original spoken language.
- summary: a concise summary in {output_lang} (5-8 bullets)
- explanation: a friendly 3-6 sentence explanation in {output_lang} for a learner.

If there's no speech:
- transcript should be ""
- summary should say there's no speech (in {output_lang})
- explanation should briefly say there's no speech (in {output_lang})
"""

        response = gemini_client.models.generate_content(
            model="gemini-3-flash-preview",
            contents=[uploaded, prompt],
            config={
                "response_mime_type": "application/json",
                "response_json_schema": {
                    "type": "object",
                    "properties": {
                        "transcript": {"type": "string"},
                        "summary": {"type": "string"},
                        "explanation": {"type": "string"},
                    },
                    "required": ["transcript", "summary", "explanation"],
                },
            },
        )

        try:
            return json.loads(response.text)
        except json.JSONDecodeError:
            # fallback if Gemini returns non-JSON
            return {"transcript": "", "summary": response.text, "explanation": ""}

    finally:
        try:
            os.remove(tmp_path)
        except OSError:
            pass

# =========================
# PDF Extraction
# =========================

def read_pdf_text(pdf: str) -> str:
    """Extracts text from a PDF file."""
    reader = PdfReader(pdf.stream)
    text = ""
    for page in reader.pages:
        page_text = page.extract_text()
        if page_text:
            text += page_text + "\n"
    return text.strip()

def summarize_pdf(uploaded_file, output_lang: str = "en") -> dict:
    """Summarize a PDF using Gemini API."""
    text = read_pdf_text(uploaded_file)
    if not text:
        return {
            "summary": f"No text found in PDF ({output_lang})",
            "explanation": f"No text found in PDF ({output_lang})"
        }




    prompt = f"""
You are given the text content of a PDF file.

Return JSON ONLY (no markdown, no extra text) with exactly these keys:
- summary: a concise summary in {output_lang} (5-8 bullets)
- explanation: a friendly 3-6 sentence explanation in {output_lang} for a learner.

If the PDF has no meaningful text:
- summary should say there's no text (in {output_lang})
- explanation should briefly say there's no text (in {output_lang})
"""

    response = gemini_client.models.generate_content(
    model="gemini-1.5-flash",
    contents=prompt,
    config={
        "response_mime_type": "application/json",
        "response_json_schema": {
            "type": "object",
            "properties": {
                "summary": {"type": "string"},
                "explanation": {"type": "string"},
            },
            "required": ["summary", "explanation"],
        },
    },
    )

    try:
        return json.loads(response.text)
    except json.JSONDecodeError:
        return {"summary": response.text, "explanation": ""}