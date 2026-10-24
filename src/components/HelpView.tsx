import React, { useState } from 'react';
import {
  HelpCircle,
  FileCode,
  Download,
  Terminal,
  Layers,
  CheckCircle2,
  ExternalLink,
  BookOpen,
  Cpu,
  Monitor,
} from 'lucide-react';

interface HelpViewProps {
  theme: 'dark' | 'light';
}

export const HelpView: React.FC<HelpViewProps> = ({ theme }) => {
  const [activeFile, setActiveFile] = useState<string>('app.py');

  const filesContent: Record<string, string> = {
    'app.py': `"""
DubMaster AI — Windows Desktop Application Entry Point
Built with PySide6 (Qt for Python)
"""

import sys
from pathlib import Path
from PySide6.QtWidgets import QApplication
from PySide6.QtCore import Qt
from src.ui.main_window import DubMasterMainWindow
from src.core.config import AppConfig

def main():
    # Windows 10/11 High-DPI Display Scaling
    QApplication.setAttribute(Qt.AA_EnableHighDpiScaling, True)
    QApplication.setAttribute(Qt.AA_UseHighDpiPixmaps, True)

    app = QApplication(sys.argv)
    app.setApplicationName("DubMaster AI")
    app.setOrganizationName("DubMaster")

    config = AppConfig.load()
    window = DubMasterMainWindow(config=config)
    window.show()

    sys.exit(app.exec())

if __name__ == "__main__":
    main()`,
    'requirements.txt': `PySide6>=6.6.0
pydantic>=2.5.0
google-genai>=2.4.0
requests>=2.31.0
python-dotenv>=1.0.0
numpy>=1.24.0
ffmpeg-python>=0.2.0
faster-whisper>=1.0.0
tqdm>=4.66.0`,
    'dubmaster.spec': `# PyInstaller Windows Spec File for DubMaster AI
# Builds standalone Windows 10/11 x64 executable

a = Analysis(
    ['../../app.py'],
    pathex=['../..'],
    hiddenimports=['PySide6', 'pydantic', 'google.genai'],
)
pyz = PYZ(a.pure, a.zipped_data)
exe = EXE(
    pyz,
    a.scripts,
    [],
    name='DubMasterAI',
    console=False, # GUI application window
)`,
    'progress_manager.py': `STAGE_WEIGHTS = {
    "media_analysis": 0.05,
    "audio_extraction": 0.10,
    "speech_recognition": 0.20,
    "translation": 0.15,
    "voice_generation": 0.25,
    "audio_sync": 0.10,
    "final_rendering": 0.15,
} # Total = 100%`,
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight">Help, Documentation & Windows Desktop Package</h1>
        <p className="text-xs text-zinc-500">
          User guide for DubMaster AI, pipeline specifications, and Windows desktop packaging instructions.
        </p>
      </div>

      {/* Windows Desktop Instructions */}
      <div className={`p-5 rounded-xl border space-y-4 ${theme === 'dark' ? 'bg-[#18181b] border-zinc-800' : 'bg-white border-zinc-200'}`}>
        <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-blue-400">
          <Monitor className="w-4 h-4" />
          <span>Windows 10 / 11 Native Desktop Execution</span>
        </div>

        <p className="text-xs text-zinc-300 leading-relaxed">
          The complete native Python PySide6 desktop application is bundled in the <code className="px-1.5 py-0.5 rounded bg-zinc-800 font-mono text-blue-400">dubmaster-ai/</code> directory of this repository. It features Qt Multimedia video playback, background QThread workers, SQLite project persistence, and FFmpeg media rendering.
        </p>

        <div className="p-4 rounded-lg bg-zinc-900 border border-zinc-800 font-mono text-xs space-y-2 text-zinc-300">
          <div className="text-zinc-500 select-none"># 1. Open PowerShell / Command Prompt on Windows 10/11</div>
          <div className="text-blue-400">cd dubmaster-ai</div>
          <div className="text-zinc-500 select-none"># 2. Create and activate a virtual environment</div>
          <div>python -m venv venv</div>
          <div>.\venv\Scripts\activate</div>
          <div className="text-zinc-500 select-none"># 3. Install desktop dependencies</div>
          <div>pip install -r requirements.txt</div>
          <div className="text-zinc-500 select-none"># 4. Launch DubMaster AI desktop window</div>
          <div className="text-emerald-400 font-bold">python app.py</div>
        </div>
      </div>

      {/* Standalone .exe Packaging with PyInstaller */}
      <div className={`p-5 rounded-xl border space-y-4 ${theme === 'dark' ? 'bg-[#18181b] border-zinc-800' : 'bg-white border-zinc-200'}`}>
        <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
          <Terminal className="w-4 h-4" />
          <span>Packaging into Standalone Windows Executable (.exe)</span>
        </div>

        <div className="p-4 rounded-lg bg-zinc-900 border border-zinc-800 font-mono text-xs space-y-2 text-zinc-300">
          <div className="text-zinc-500 select-none"># Build standalone .exe using the included PyInstaller spec</div>
          <div className="text-emerald-400 font-bold">pyinstaller packaging/windows/dubmaster.spec --noconfirm --clean</div>
          <div className="text-zinc-500 text-[11px] mt-2">
            Output binary is saved to: <span className="text-zinc-300">dist/DubMasterAI/DubMasterAI.exe</span>
          </div>
        </div>
      </div>

      {/* Python Code Viewer */}
      <div className={`p-5 rounded-xl border space-y-4 ${theme === 'dark' ? 'bg-[#18181b] border-zinc-800' : 'bg-white border-zinc-200'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-zinc-400">
            <FileCode className="w-4 h-4 text-indigo-400" />
            <span>Bundled Desktop Source Code Explorer</span>
          </div>

          <div className="flex items-center space-x-1.5 text-xs">
            {Object.keys(filesContent).map((file) => (
              <button
                key={file}
                onClick={() => setActiveFile(file)}
                className={`px-2.5 py-1 rounded text-xs font-mono transition-colors ${
                  activeFile === file
                    ? 'bg-blue-600 text-white font-bold'
                    : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {file}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 rounded-lg bg-[#121214] border border-zinc-800 font-mono text-xs text-zinc-300 overflow-x-auto max-h-72 select-text">
          <pre>{filesContent[activeFile]}</pre>
        </div>
      </div>
    </div>
  );
};
