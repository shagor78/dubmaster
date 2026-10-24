# DubMaster AI — Complete Windows-Based AI Video Dubbing Software

**DubMaster AI** is an advanced, production-grade desktop application for Windows 10 and Windows 11 that automates the end-to-end video dubbing pipeline:
1. **Video Inspection & Ingestion**: FFprobe analysis of video, audio streams, codecs, and frame rates.
2. **Original Language Detection**: Automatic speech recognition acoustic analysis (English, Bengali, Hindi, Chinese, Spanish, etc.) with confidence scoring.
3. **Speech-to-Text Transcription**: Timestamped segment breakdown with speaker identification (Speaker 1, Speaker 2).
4. **Context-Aware Translation**: High-fidelity translation preserving idioms, names, punctuation, and timing constraints.
5. **Target-Language Voice Generation**: Natural, studio-quality speech synthesis (Gemini 3.8 Flash Lite TTS and local offline engines).
6. **Acoustic Audio Synchronization**: Automatic speaking-rate time stretching (`atempo`), padding, and overlap prevention.
7. **Audio Mixing**: 4 selectable modes (Replace Original Speech, Dubbing with Original Background Audio, Keep Original Audio Quietly with ducking, or Dubbed Audio Only).
8. **Final Video Rendering**: High-speed FFmpeg muxing into MP4 (H.264 / AAC) with playable output verification.

---

## Windows Quick Start Guide

### 1. Prerequisites
- **Operating System**: Windows 10 (Build 19041+) or Windows 11 (64-bit)
- **Python**: Python 3.10 or 3.11 installed from [python.org](https://www.python.org/downloads/) (ensure "Add Python to PATH" is checked)
- **FFmpeg**: Download the FFmpeg release essentials build from [gyan.dev](https://www.gyan.dev/ffmpeg/builds/) and place `ffmpeg.exe` and `ffprobe.exe` in your system `PATH` (or inside the application root directory).

### 2. Installation
Open PowerShell or Command Prompt in the `dubmaster-ai` directory:

```powershell
# Create a virtual environment
python -m venv venv

# Activate the virtual environment
.\venv\Scripts\activate

# Install required dependencies
pip install -r requirements.txt
```

### 3. Configuration
Copy `.env.example` to `.env` and set your optional Gemini API key:

```powershell
copy .env.example .env
```

### 4. Running the Desktop Application
Launch DubMaster AI with:

```powershell
python app.py
```

---

## Packaging as Standalone Windows Executable (.exe)

To bundle DubMaster AI into a standalone portable `.exe` or installer for Windows users:

```powershell
pip install pyinstaller

# Build using the included spec file
pyinstaller packaging/windows/dubmaster.spec --noconfirm --clean
```

The compiled binary will be placed in `dist/DubMasterAI/DubMasterAI.exe`.

---

## Supported Language Pairs
- English ↔ Bengali (বাংলা)
- English ↔ Hindi (हिन्दी)
- English ↔ Chinese (中文 - Mandarin)
- Bengali ↔ Hindi
- Bengali ↔ Chinese
- Hindi ↔ Chinese
- Additional supported languages: Spanish, French, German, Japanese, Arabic.
