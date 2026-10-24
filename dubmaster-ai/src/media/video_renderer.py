"""
FFmpeg Video Rendering & Audio Multiplexing
Combines synchronized dubbed audio with source video stream.
"""
import subprocess
from typing import Dict, Any

def render_dubbed_video(
    source_video: str,
    dubbed_audio: str,
    output_path: str,
    audio_mode: str = "replace",
    ducking_volume: float = 0.15,
    ffmpeg_bin: str = "ffmpeg"
) -> Dict[str, Any]:
    """
    Renders the final video:
    - replace: replaces the original audio track completely with dubbed_audio
    - background_mix: mixes dubbed speech with original audio
    - keep_quiet: keeps original audio ducked quietly (e.g. 0.15 volume) under dubbed speech
    - dubbed_only: exports clean voice
    """
    if audio_mode in ("replace", "dubbed_only"):
        cmd = [
            ffmpeg_bin, "-y",
            "-i", source_video,
            "-i", dubbed_audio,
            "-map", "0:v:0",
            "-map", "1:a:0",
            "-c:v", "libx264",
            "-pix_fmt", "yuv420p",
            "-c:a", "aac",
            "-b:a", "192k",
            "-shortest",
            output_path
        ]
    elif audio_mode == "keep_quiet":
        vol = str(ducking_volume)
        cmd = [
            ffmpeg_bin, "-y",
            "-i", source_video,
            "-i", dubbed_audio,
            "-filter_complex", f"[0:a]volume={vol}[orig];[1:a]volume=1.0[dub];[orig][dub]amix=inputs=2:duration=first[outa]",
            "-map", "0:v:0",
            "-map", "[outa]",
            "-c:v", "libx264",
            "-pix_fmt", "yuv420p",
            "-c:a", "aac",
            "-b:a", "192k",
            output_path
        ]
    else: # background_mix
        cmd = [
            ffmpeg_bin, "-y",
            "-i", source_video,
            "-i", dubbed_audio,
            "-filter_complex", "[0:a]volume=0.35[bg];[1:a]volume=1.0[dub];[bg][dub]amix=inputs=2:duration=first[outa]",
            "-map", "0:v:0",
            "-map", "[outa]",
            "-c:v", "libx264",
            "-pix_fmt", "yuv420p",
            "-c:a", "aac",
            "-b:a", "192k",
            output_path
        ]

    try:
        res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, check=True)
        return {"success": True, "output_path": output_path}
    except subprocess.CalledProcessError as e:
        return {"success": False, "error": e.stderr}
