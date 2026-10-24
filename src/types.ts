export interface Segment {
  id: number;
  start: string;
  end: string;
  startSec: number;
  endSec: number;
  originalText: string;
  translatedText: string;
  speaker: string;
  audioStatus: 'pending' | 'generated' | 'failed';
  audioUrl?: string;
  audioDuration?: number;
}

export interface Project {
  id: string;
  name: string;
  originalFilename: string;
  videoUrl: string;
  videoPath: string;
  fileSize: number;
  duration: number;
  resolution: string;
  frameRate: string;
  audioChannels: number;
  sourceLanguage: string;
  detectedConfidence: number;
  targetLanguage: string;
  selectedVoice: string;
  audioMode: 'replace' | 'background_mix' | 'keep_quiet' | 'dubbed_only';
  duckingVolume: number;
  speakingRate: number;
  normalizeAudio: boolean;
  status: 'draft' | 'processing' | 'completed' | 'failed';
  progress: number;
  currentStage: string;
  segments: Segment[];
  outputUrl?: string;
  outputPath?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SystemStatus {
  status: string;
  os: string;
  ffmpeg: {
    installed: boolean;
    version: string;
    path: string;
  };
  ffprobe: {
    installed: boolean;
    path: string;
  };
  diskSpace: string;
  hasGeminiApiKey: boolean;
  models: {
    transcription: string;
    translation: string;
    tts: string;
  };
  supportedLanguages: Array<{
    code: string;
    name: string;
    flag: string;
    voices: string[];
  }>;
}

export interface SampleVideo {
  id: string;
  name: string;
  filename: string;
  url: string;
  language: string;
  duration: number;
  description: string;
}
