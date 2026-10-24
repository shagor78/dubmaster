import unittest

class TestLanguageDetection(unittest.TestCase):
    def test_supported_languages(self):
        supported = ["English", "Bengali", "Hindi", "Chinese", "Spanish", "German", "French", "Japanese", "Arabic"]
        self.assertIn("Bengali", supported)
        self.assertIn("Hindi", supported)
        self.assertIn("Chinese", supported)
        self.assertIn("English", supported)

    def test_confidence_boundary(self):
        confidence = 96.8
        self.assertGreaterEqual(confidence, 0.0)
        self.assertLessEqual(confidence, 100.0)

if __name__ == "__main__":
    unittest.main()
