"""
FFprobe Media Inspector Wrapper
"""
import json
import subprocess
from typing import Dict, Any, Optional

def probe_video(file_path: str, ffprobe_bin: str = "ffprobe") -> Dict[str, Any]:
    cmd = [
        ffprobe_bin,
        "-v", "quiet",
        "-print_format", "json",
        "-show_format",
        "-show_streams",
        file_path
    ]
    try:
        result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, check=True)
        data = json.loads(result.stdout)
        
        video_stream = next((s for s in data.get("streams", []) if s.get("codec_type") == "video"), None)
        audio_stream = next((s for s in data.get("streams", []) if s.get("codec_type") == "audio"), None)
        
        duration = float(data.get("format", {}).get("duration", 0.0))
        size = int(data.get("format", {}).get("size", 0))
        
        return {
            "success": True,
            "duration": duration,
            "file_size": size,
            "has_video": video_stream is not None,
            "has_audio": audio_stream is not None,
            "width": video_stream.get("width") if video_stream else 0,
            "height": video_stream.get("height") if video_stream else 0,
            "video_codec": video_stream.get("codec_name") if video_stream else "none",
            "audio_codec": audio_stream.get("codec_name") if audio_stream else "none",
            "channels": audio_stream.get("channels", 0) if audio_stream else 0,
            "raw": data
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "duration": 0.0,
            "file_size": 0,
            "has_video": False,
            "has_audio": False
        }
