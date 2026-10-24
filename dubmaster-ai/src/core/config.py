"""
Configuration & Application Settings
"""
import os
from pathlib import Path
from pydantic import BaseModel, Field

class AppConfig(BaseModel):
    app_name: str = "DubMaster AI"
    version: str = "1.0.0"
    workspace_dir: str = Field(default_factory=lambda: str(Path.home() / "Documents" / "DubMasterAI"))
    ffmpeg_path: str = "ffmpeg"
    ffprobe_path: str = "ffprobe"
    default_source_lang: str = "English"
    default_target_lang: str = "Bengali"
    default_voice: str = "Kore"
    default_audio_mode: str = "replace"
    ducking_volume: float = 0.15
    speaking_rate: float = 1.0
    theme: str = "dark"

    @classmethod
    def load(cls) -> "AppConfig":
        workspace = os.getenv("DUBMASTER_WORKSPACE") or str(Path.home() / "Documents" / "DubMasterAI")
        return cls(workspace_dir=workspace)
