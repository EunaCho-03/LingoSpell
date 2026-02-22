import os
import time
from io import BytesIO
import requests
from dotenv import load_dotenv

load_dotenv()

XI_API_KEY = os.getenv("ELEVEN_API")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

if not XI_API_KEY:
    raise RuntimeError("Missing ELEVEN_API in .env")

if not OPENAI_API_KEY:
    raise RuntimeError("Missing OPENAI_API_KEY in .env")

ELEVEN_BASE_URL = "https://api.elevenlabs.io/v1"
ELEVEN_HEADERS = {"xi-api-key": XI_API_KEY}


def dub_video(video_bytes: bytes, filename: str, source_lang="en", target_lang="es"):
    """
    Sends video to ElevenLabs and returns dubbed MP4 bytes.
    """

    files = {
        "file": (filename, video_bytes, "video/mp4")
    }

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
        timeout=120
    )

    if not create_resp.ok:
        raise Exception(create_resp.text)

    dubbing_id = create_resp.json().get("dubbing_id")

    # 2) Poll until finished
    for _ in range(120):
        meta_resp = requests.get(
            f"{ELEVEN_BASE_URL}/dubbing/{dubbing_id}",
            headers=ELEVEN_HEADERS
        )

        if not meta_resp.ok:
            raise Exception(meta_resp.text)

        status = meta_resp.json().get("status")

        if status == "dubbed":
            break
        if status == "failed":
            raise Exception("Dubbing failed")

        time.sleep(5)

    # 3) Download dubbed MP4
    file_resp = requests.get(
        f"{ELEVEN_BASE_URL}/dubbing/{dubbing_id}/audio/{target_lang}",
        headers=ELEVEN_HEADERS,
        timeout=300
    )

    if not file_resp.ok:
        raise Exception(file_resp.text)

    return file_resp.content


def summarize_video(video_bytes: bytes):
    """
    Transcribes video using Whisper and summarizes transcript using GPT.
    Returns dict with transcript + summary.
    """

    # STEP 1 — Transcribe
    transcript_resp = requests.post(
        "https://api.openai.com/v1/audio/transcriptions",
        headers={
            "Authorization": f"Bearer {OPENAI_API_KEY}"
        },
        files={
            "file": ("audio.mp4", video_bytes, "video/mp4")
        },
        data={
            "model": "whisper-1"
        }
    )

    if not transcript_resp.ok:
        raise Exception(transcript_resp.text)

    transcript = transcript_resp.json().get("text")

    # STEP 2 — Summarize
    summary_resp = requests.post(
        "https://api.openai.com/v1/chat/completions",
        headers={
            "Authorization": f"Bearer {OPENAI_API_KEY}",
            "Content-Type": "application/json"
        },
        json={
            "model": "gpt-4o-mini",
            "messages": [
                {
                    "role": "system",
                    "content": "Summarize this video transcript clearly and concisely."
                },
                {
                    "role": "user",
                    "content": transcript
                }
            ]
        }
    )

    if not summary_resp.ok:
        raise Exception(summary_resp.text)

    summary = summary_resp.json()["choices"][0]["message"]["content"]

    return {
        "transcript": transcript,
        "summary": summary
    }