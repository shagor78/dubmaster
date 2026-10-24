"""
Weighted Pipeline Progress Manager
Calculates overall project progress across pipeline stages.
Stage weights:
- Media Analysis: 5%
- Audio Extraction: 10%
- Speech Recognition: 20%
- Translation: 15%
- Voice Generation: 25%
- Audio Synchronization & Mixing: 10%
- Final Rendering & Verification: 15%
Total: 100%
"""

from typing import Dict, Callable, Optional

STAGE_WEIGHTS: Dict[str, float] = {
    "media_analysis": 0.05,
    "audio_extraction": 0.10,
    "speech_recognition": 0.20,
    "translation": 0.15,
    "voice_generation": 0.25,
    "audio_sync": 0.10,
    "final_rendering": 0.15,
}

STAGE_NAMES: Dict[str, str] = {
    "media_analysis": "Media Analysis",
    "audio_extraction": "Audio Extraction",
    "speech_recognition": "Speech Recognition",
    "translation": "Translation",
    "voice_generation": "Voice Generation",
    "audio_sync": "Audio Synchronization & Mixing",
    "final_rendering": "Final Rendering & Verification",
}

class ProgressManager:
    def __init__(self, on_update: Optional[Callable[[float, str, str], None]] = None):
        self.stage_progress: Dict[str, float] = {k: 0.0 for k in STAGE_WEIGHTS}
        self.current_stage: str = "media_analysis"
        self.current_operation: str = "Initializing"
        self.on_update = on_update

    def update_stage_progress(self, stage: str, sub_progress: float, operation: str = ""):
        """
        sub_progress is 0.0 to 1.0 within the specified stage.
        """
        if stage in self.stage_progress:
            self.stage_progress[stage] = max(0.0, min(1.0, sub_progress))
            self.current_stage = stage
            if operation:
                self.current_operation = operation
            
            overall = self.calculate_overall()
            if self.on_update:
                self.on_update(overall, STAGE_NAMES.get(stage, stage), self.current_operation)

    def mark_stage_completed(self, stage: str):
        self.update_stage_progress(stage, 1.0, f"{STAGE_NAMES.get(stage, stage)} Completed")

    def calculate_overall(self) -> float:
        total = 0.0
        for stage, weight in STAGE_WEIGHTS.items():
            total += self.stage_progress.get(stage, 0.0) * weight
        return round(total * 100.0, 1)
