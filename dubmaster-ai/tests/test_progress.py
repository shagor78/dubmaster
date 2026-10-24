import unittest
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from src.core.progress_manager import ProgressManager, STAGE_WEIGHTS

class TestProgressManager(unittest.TestCase):
    def test_stage_weights_sum_to_one(self):
        total = sum(STAGE_WEIGHTS.values())
        self.assertAlmostEqual(total, 1.0, places=4)

    def test_initial_progress_is_zero(self):
        pm = ProgressManager()
        self.assertEqual(pm.calculate_overall(), 0.0)

    def test_incremental_progress(self):
        pm = ProgressManager()
        # Complete media analysis (5%)
        pm.update_stage_progress("media_analysis", 1.0)
        self.assertAlmostEqual(pm.calculate_overall(), 5.0, places=1)
        
        # Complete audio extraction (10%)
        pm.update_stage_progress("audio_extraction", 1.0)
        self.assertAlmostEqual(pm.calculate_overall(), 15.0, places=1)

if __name__ == "__main__":
    unittest.main()
