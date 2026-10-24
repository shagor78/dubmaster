"""
DubMaster AI — Windows Desktop Application Entry Point
Built with PySide6 (Qt for Python)
"""

import sys
import os
from pathlib import Path

# Add project root to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent))

def main():
    try:
        from PySide6.QtWidgets import QApplication
        from PySide6.QtCore import Qt
        from src.ui.main_window import DubMasterMainWindow
        from src.core.config import AppConfig

        # High-DPI scaling configuration for Windows 10/11
        if hasattr(Qt, 'AA_EnableHighDpiScaling'):
            QApplication.setAttribute(Qt.AA_EnableHighDpiScaling, True)
        if hasattr(Qt, 'AA_UseHighDpiPixmaps'):
            QApplication.setAttribute(Qt.AA_UseHighDpiPixmaps, True)

        app = QApplication(sys.argv)
        app.setApplicationName("DubMaster AI")
        app.setOrganizationName("DubMaster")

        config = AppConfig.load()
        window = DubMasterMainWindow(config=config)
        window.show()

        sys.exit(app.exec())
    except ImportError as e:
        print(f"[DubMaster AI Desktop] Running in headless environment: {e}")
        print("For Windows desktop execution, ensure PySide6 is installed via: pip install PySide6")
        return 0

if __name__ == "__main__":
    main()
