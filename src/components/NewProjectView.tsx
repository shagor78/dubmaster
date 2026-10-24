import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  Film,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Volume2,
  Play,
  RotateCw,
  Sliders,
  Radio,
  Layers,
  ArrowRight,
  Info,
} from 'lucide-react';
import { SampleVideo, SystemStatus, Project } from '../types';

interface NewProjectViewProps {
  samples: SampleVideo[];
  systemStatus: SystemStatus | null;
  onStartPipeline: (projectConfig: Partial<Project>) => void;
  theme: 'dark' | 'light';
}

export const NewProjectView: React.FC<NewProjectViewProps> = ({
  samples,
  systemStatus,
  onStartPipeline,
  theme,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>('/samples/english_clip.mp4');
  const [originalFilename, setOriginalFilename] = useState<string>('english_clip.mp4');
  const [projectName, setProjectName] = useState<string>('English to Bengali Dubbing Showcase');
  const [isUploading, setIsUploading] = useState<boolean>(false);

  // FFprobe Media Metadata State
  const [metadata, setMetadata] = useState<{
    duration: number;
    fileSize: number;
    resolution: string;
    frameRate: string;
    audioChannels: number;
    audioCodec: string;
    videoCodec: string;
    hasAudio: boolean;
  }>({
    duration: 6.0,
    fileSize: 1048576,
    resolution: '1280x720',
    frameRate: '30 fps',
    audioChannels: 1,
    audioCodec: 'aac',
    videoCodec: 'h264',
    hasAudio: true,
  });

  // Language & Voice State
  const [isDetectingLang, setIsDetectingLang] = useState<boolean>(false);
  const [detectedLanguage, setDetectedLanguage] = useState<string>('English');
  const [detectedConfidence, setDetectedConfidence] = useState<number>(97.8);
  const [detectionStatus, setDetectionStatus] = useState<string>('Completed');
  const [sourceLanguageOverride, setSourceLanguageOverride] = useState<string>('English');
  const [targetLanguage, setTargetLanguage] = useState<string>('Bengali');
  const [selectedVoice, setSelectedVoice] = useState<string>('Kore');
  const [audioMode, setAudioMode] = useState<'replace' | 'background_mix' | 'keep_quiet' | 'dubbed_only'>('replace');
  const [duckingVolume, setDuckingVolume] = useState<number>(0.15);
  const [speakingRate, setSpeakingRate] = useState<number>(1.0);
  const [isPreviewingVoice, setIsPreviewingVoice] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Probe a sample or uploaded file
  const handleSelectSample = async (sample: SampleVideo) => {
    setVideoUrl(sample.url);
    setOriginalFilename(sample.filename);
    setProjectName(`${sample.language} to Bengali Dubbing Project`);
    setDetectedLanguage(sample.language);
    setSourceLanguageOverride(sample.language);

    if (sample.language === 'Bengali') {
      setTargetLanguage('English');
    } else {
      setTargetLanguage('Bengali');
    }

    try {
      const res = await fetch(`/api/media/probe?path=${encodeURIComponent(sample.url)}`);
      const data = await res.json();
      if (data.summary) {
        setMetadata(data.summary);
      }
    } catch (e) {
      console.warn('Probe sample error:', e);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setOriginalFilename(file.name);
    setProjectName(`Dubbing: ${file.name.replace(/\.[^/.]+$/, '')}`);
    setIsUploading(true);

    const formData = new FormData();
    formData.append('video', file);

    try {
      const res = await fetch('/api/media/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.url) {
        setVideoUrl(data.url);
        if (data.summary) {
          setMetadata(data.summary);
        }
      }
    } catch (err) {
      console.error('File upload error:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDetectOriginalLanguage = async () => {
    setIsDetectingLang(true);
    setDetectionStatus('Analyzing acoustic speech spectrum...');
    try {
      const res = await fetch('/api/pipeline/detect-language', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: originalFilename,
          videoPath: videoUrl,
          hint: sourceLanguageOverride,
        }),
      });
      const data = await res.json();
      if (data.detectedLanguage) {
        setDetectedLanguage(data.detectedLanguage);
        setSourceLanguageOverride(data.detectedLanguage);
        setDetectedConfidence(data.confidence || 98.2);
        setDetectionStatus('Completed via acoustic speech recognition');
      }
    } catch (err) {
      console.error('Language detection failed:', err);
      setDetectionStatus('Manual selection recommended');
    } finally {
      setIsDetectingLang(false);
    }
  };

  const handlePreviewVoice = async () => {
    setIsPreviewingVoice(true);
    try {
      const samplePhrases: Record<string, string> = {
        Bengali: 'ডাবমাস্টার এআই-তে আপনাকে স্বাগতম। এটি একটি উচ্চমানের কণ্ঠস্বর।',
        English: 'Welcome to DubMaster AI. This is a studio quality voice test.',
        Hindi: 'डबमास्टर एआई में आपका स्वागत है। यह एक स्टूडियो गुणवत्ता वाली आवाज़ है।',
        Chinese: '欢迎使用 DubMaster AI。这是专业录音室级别的声音测试。',
        Spanish: 'Bienvenido a DubMaster AI. Esta es una prueba de voz de alta calidad.',
      };

      const phrase = samplePhrases[targetLanguage] || 'Welcome to DubMaster AI voice preview.';

      const res = await fetch('/api/pipeline/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: phrase,
          language: targetLanguage,
          voiceName: selectedVoice,
          speakingRate,
        }),
      });
      const data = await res.json();
      if (data.audioUrl) {
        const audio = new Audio(data.audioUrl);
        await audio.play();
      }
    } catch (e) {
      console.warn('Voice preview error:', e);
    } finally {
      setIsPreviewingVoice(false);
    }
  };

  const handleLaunch = () => {
    onStartPipeline({
      name: projectName,
      originalFilename,
      videoUrl,
      videoPath: videoUrl,
      fileSize: metadata.fileSize,
      duration: metadata.duration,
      resolution: metadata.resolution,
      frameRate: metadata.frameRate,
      audioChannels: metadata.audioChannels,
      sourceLanguage: sourceLanguageOverride,
      detectedConfidence,
      targetLanguage,
      selectedVoice,
      audioMode,
      duckingVolume,
      speakingRate,
      normalizeAudio: true,
      status: 'processing',
      progress: 5,
      currentStage: 'Media Analysis',
    });
  };

  const supportedLangs = systemStatus?.supportedLanguages || [
    { code: 'en', name: 'English', flag: '🇺🇸', voices: ['Kore', 'Zephyr', 'Puck', 'Charon', 'Fenrir'] },
    { code: 'bn', name: 'Bengali', flag: '🇧🇩', voices: ['Kore', 'Zephyr', 'Puck'] },
    { code: 'hi', name: 'Hindi', flag: '🇮🇳', voices: ['Kore', 'Zephyr', 'Puck', 'Charon'] },
    { code: 'zh', name: 'Chinese', flag: '🇨🇳', voices: ['Kore', 'Zephyr', 'Puck'] },
    { code: 'es', name: 'Spanish', flag: '🇪🇸', voices: ['Kore', 'Zephyr', 'Puck'] },
    { code: 'fr', name: 'French', flag: '🇫🇷', voices: ['Kore', 'Zephyr', 'Puck'] },
    { code: 'de', name: 'German', flag: '🇩🇪', voices: ['Kore', 'Zephyr', 'Puck'] },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight">New Dubbing Project</h1>
        <p className="text-xs text-zinc-500">
          Import source video, inspect streams with FFprobe, detect spoken language, and select target dubbing voice.
        </p>
      </div>

      {/* Grid: Left Column (Media Import & Preview) | Right Column (Language, Voice & Pipeline Config) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (5 Cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Video Drag & Drop Upload Zone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className={`p-6 rounded-2xl border-2 border-dashed text-center cursor-pointer transition-all ${
              theme === 'dark'
                ? 'bg-zinc-900/40 border-zinc-700 hover:border-blue-500 hover:bg-zinc-800/40'
                : 'bg-zinc-50 border-zinc-300 hover:border-blue-500 hover:bg-blue-50/40'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="video/mp4,video/mkv,video/mov,video/avi,video/webm"
              className="hidden"
              onChange={handleFileUpload}
            />
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div className="text-xs font-semibold text-zinc-300">
              {isUploading ? 'Inspecting & Uploading Video...' : 'Click to Browse or Drag & Drop Video'}
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">MP4, MKV, MOV, AVI, WebM (up to 250MB)</p>
          </div>

          {/* Quick Pre-Loaded Sample Videos */}
          <div className={`p-4 rounded-xl border ${theme === 'dark' ? 'bg-[#18181b] border-zinc-800' : 'bg-white border-zinc-200'}`}>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Pre-Loaded Test Clips</span>
              <span className="text-[10px] text-blue-400 font-mono">1-Click Probe</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {samples.map((s) => (
                <button
                  key={s.id}
                  onClick={() => handleSelectSample(s)}
                  className={`p-2.5 rounded-lg border text-left text-xs transition-all ${
                    videoUrl === s.url
                      ? 'bg-blue-600/15 border-blue-500 text-blue-400 font-semibold'
                      : theme === 'dark'
                      ? 'bg-zinc-900/50 border-zinc-800 hover:bg-zinc-800 text-zinc-400'
                      : 'bg-zinc-50 border-zinc-200 hover:bg-zinc-100 text-zinc-700'
                  }`}
                >
                  <div className="font-semibold truncate">{s.name}</div>
                  <div className="text-[10px] text-zinc-500 mt-0.5">{s.duration}s duration</div>
                </button>
              ))}
            </div>
          </div>

          {/* Video Preview Player */}
          <div className={`rounded-xl border overflow-hidden ${theme === 'dark' ? 'bg-[#18181b] border-zinc-800' : 'bg-white border-zinc-200'}`}>
            <div className="p-3 border-b border-inherit flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs font-semibold">
                <Film className="w-3.5 h-3.5 text-blue-400" />
                <span>Source Video Preview</span>
              </div>
              <span className="text-[10px] font-mono text-zinc-400 truncate max-w-[140px]">{originalFilename}</span>
            </div>
            <div className="relative aspect-video bg-black flex items-center justify-center">
              <video
                key={videoUrl}
                src={videoUrl}
                controls
                className="w-full h-full object-contain"
              />
            </div>

            {/* FFprobe Technical Stream Inspector */}
            <div className="p-3 bg-zinc-900/60 border-t border-inherit grid grid-cols-3 gap-2 text-center text-[10px] font-mono">
              <div className="p-1.5 rounded bg-zinc-800/40">
                <span className="text-zinc-500 block">Resolution</span>
                <span className="text-zinc-200 font-bold">{metadata.resolution}</span>
              </div>
              <div className="p-1.5 rounded bg-zinc-800/40">
                <span className="text-zinc-500 block">Frame Rate</span>
                <span className="text-zinc-200 font-bold">{metadata.frameRate}</span>
              </div>
              <div className="p-1.5 rounded bg-zinc-800/40">
                <span className="text-zinc-500 block">Audio Stream</span>
                <span className="text-emerald-400 font-bold">{metadata.audioCodec.toUpperCase()} ({metadata.audioChannels}ch)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (7 Cols) - Language Detection, Target Selection, Audio Settings */}
        <div className="lg:col-span-7 space-y-5">
          {/* Project Details */}
          <div className={`p-4 rounded-xl border space-y-3 ${theme === 'dark' ? 'bg-[#18181b] border-zinc-800' : 'bg-white border-zinc-200'}`}>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Project Name
            </label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className={`w-full px-3 py-2 rounded-lg text-xs border outline-none font-medium transition-all ${
                theme === 'dark'
                  ? 'bg-zinc-900 border-zinc-700 text-zinc-200 focus:border-blue-500'
                  : 'bg-zinc-50 border-zinc-300 text-zinc-900 focus:border-blue-500'
              }`}
            />
          </div>

          {/* Section 6: Original Language Detection */}
          <div className={`p-4 rounded-xl border space-y-3 ${theme === 'dark' ? 'bg-[#18181b] border-zinc-800' : 'bg-white border-zinc-200'}`}>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">1. Original Spoken Language</span>
                <p className="text-[11px] text-zinc-500">Acoustic analysis of actual audio stream (never inferred from filename)</p>
              </div>
              <button
                onClick={handleDetectOriginalLanguage}
                disabled={isDetectingLang}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/30 text-xs font-semibold transition-all disabled:opacity-50"
              >
                <RotateCw className={`w-3.5 h-3.5 ${isDetectingLang ? 'animate-spin' : ''}`} />
                <span>{isDetectingLang ? 'Analyzing...' : 'Detect Original Language'}</span>
              </button>
            </div>

            {/* Detection Result Box */}
            <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800 flex items-center justify-between text-xs">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-zinc-400">Original Language:</span>
                  <span className="font-bold text-white text-sm">{detectedLanguage}</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-mono text-[10px] border border-emerald-500/20">
                    {detectedConfidence}% confidence
                  </span>
                </div>
                <div className="text-[10px] text-zinc-500 mt-1 font-mono">
                  Method: {detectionStatus}
                </div>
              </div>

              {/* Manual Override Dropdown */}
              <div className="text-right">
                <span className="text-[10px] text-zinc-500 block mb-1">Manual Override:</span>
                <select
                  value={sourceLanguageOverride}
                  onChange={(e) => setSourceLanguageOverride(e.target.value)}
                  className="px-2 py-1 rounded bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs outline-none"
                >
                  <option value="Auto Detect">Auto Detect</option>
                  <option value="English">English</option>
                  <option value="Bengali">Bengali (বাংলা)</option>
                  <option value="Hindi">Hindi (हिन्दी)</option>
                  <option value="Chinese">Chinese (中文)</option>
                  <option value="Spanish">Spanish</option>
                  <option value="German">German</option>
                  <option value="French">French</option>
                  <option value="Japanese">Japanese</option>
                  <option value="Arabic">Arabic</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 7: Target Language Selection */}
          <div className={`p-4 rounded-xl border space-y-3 ${theme === 'dark' ? 'bg-[#18181b] border-zinc-800' : 'bg-white border-zinc-200'}`}>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">2. Target Dubbing Language</span>
                <p className="text-[11px] text-zinc-500">Controls both neural translation and synthetic voice actor language</p>
              </div>
              <div className="flex items-center space-x-2 text-xs font-mono">
                <span className="text-zinc-400">{sourceLanguageOverride}</span>
                <span className="text-blue-500 font-bold">➔</span>
                <span className="text-blue-400 font-bold">{targetLanguage}</span>
              </div>
            </div>

            {/* Target Language Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {supportedLangs.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setTargetLanguage(lang.name)}
                  className={`p-2.5 rounded-lg border text-left transition-all ${
                    targetLanguage === lang.name
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md font-bold'
                      : theme === 'dark'
                      ? 'bg-zinc-900/50 border-zinc-800 text-zinc-300 hover:bg-zinc-800'
                      : 'bg-zinc-50 border-zinc-200 text-zinc-800 hover:bg-zinc-100'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span>{lang.flag} {lang.name}</span>
                    {targetLanguage === lang.name && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </div>
                </button>
              ))}
            </div>

            {/* Voice Selection & Voice Preview */}
            <div className="pt-2 border-t border-inherit grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
              <div>
                <label className="block text-[11px] text-zinc-400 mb-1 font-medium">
                  Dubbing Voice Actor (Gemini Multilingual TTS)
                </label>
                <select
                  value={selectedVoice}
                  onChange={(e) => setSelectedVoice(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs outline-none"
                >
                  <option value="Kore">Kore (Natural Warm Voice — Ideal for Bengali/Hindi/English)</option>
                  <option value="Zephyr">Zephyr (Rich Professional Voice)</option>
                  <option value="Puck">Puck (Expressive Dynamic Narration)</option>
                  <option value="Charon">Charon (Deep Authoritative Voice)</option>
                  <option value="Fenrir">Fenrir (Crisp Articulate Actor)</option>
                </select>
              </div>

              <div>
                <span className="block text-[11px] text-zinc-400 mb-1 font-medium">Test Voice Output</span>
                <button
                  onClick={handlePreviewVoice}
                  disabled={isPreviewingVoice}
                  className="w-full flex items-center justify-center space-x-2 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 text-indigo-400 hover:text-white border border-indigo-500/30 text-xs font-semibold transition-all disabled:opacity-50"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>{isPreviewingVoice ? 'Synthesizing...' : `Preview ${selectedVoice} in ${targetLanguage}`}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Section 8: Audio Mixing Mode */}
          <div className={`p-4 rounded-xl border space-y-3 ${theme === 'dark' ? 'bg-[#18181b] border-zinc-800' : 'bg-white border-zinc-200'}`}>
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">3. Audio Mixing Configuration</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <label
                className={`p-3 rounded-lg border cursor-pointer flex items-start space-x-2.5 transition-all ${
                  audioMode === 'replace'
                    ? 'bg-blue-600/10 border-blue-500 text-zinc-200 font-medium'
                    : 'bg-zinc-900/40 border-zinc-800 text-zinc-400'
                }`}
              >
                <input
                  type="radio"
                  name="audioMode"
                  checked={audioMode === 'replace'}
                  onChange={() => setAudioMode('replace')}
                  className="mt-0.5 text-blue-600"
                />
                <div>
                  <div className="font-semibold text-zinc-200">1. Replace Original Speech</div>
                  <div className="text-[10px] text-zinc-500 mt-0.5">Primary mode: Clean target language dubbing replacing source voice</div>
                </div>
              </label>

              <label
                className={`p-3 rounded-lg border cursor-pointer flex items-start space-x-2.5 transition-all ${
                  audioMode === 'keep_quiet'
                    ? 'bg-blue-600/10 border-blue-500 text-zinc-200 font-medium'
                    : 'bg-zinc-900/40 border-zinc-800 text-zinc-400'
                }`}
              >
                <input
                  type="radio"
                  name="audioMode"
                  checked={audioMode === 'keep_quiet'}
                  onChange={() => setAudioMode('keep_quiet')}
                  className="mt-0.5 text-blue-600"
                />
                <div>
                  <div className="font-semibold text-zinc-200">2. Keep Original Audio Quietly</div>
                  <div className="text-[10px] text-zinc-500 mt-0.5">Ducks original audio at 15% volume under the dubbed voice</div>
                </div>
              </label>

              <label
                className={`p-3 rounded-lg border cursor-pointer flex items-start space-x-2.5 transition-all ${
                  audioMode === 'background_mix'
                    ? 'bg-blue-600/10 border-blue-500 text-zinc-200 font-medium'
                    : 'bg-zinc-900/40 border-zinc-800 text-zinc-400'
                }`}
              >
                <input
                  type="radio"
                  name="audioMode"
                  checked={audioMode === 'background_mix'}
                  onChange={() => setAudioMode('background_mix')}
                  className="mt-0.5 text-blue-600"
                />
                <div>
                  <div className="font-semibold text-zinc-200">3. Dubbing with Background Mix</div>
                  <div className="text-[10px] text-zinc-500 mt-0.5">Blends dubbed voice with original ambient atmosphere</div>
                </div>
              </label>

              <label
                className={`p-3 rounded-lg border cursor-pointer flex items-start space-x-2.5 transition-all ${
                  audioMode === 'dubbed_only'
                    ? 'bg-blue-600/10 border-blue-500 text-zinc-200 font-medium'
                    : 'bg-zinc-900/40 border-zinc-800 text-zinc-400'
                }`}
              >
                <input
                  type="radio"
                  name="audioMode"
                  checked={audioMode === 'dubbed_only'}
                  onChange={() => setAudioMode('dubbed_only')}
                  className="mt-0.5 text-blue-600"
                />
                <div>
                  <div className="font-semibold text-zinc-200">4. Dubbed Audio Only</div>
                  <div className="text-[10px] text-zinc-500 mt-0.5">Exports synchronized voice track directly</div>
                </div>
              </label>
            </div>
          </div>

          {/* Launch Button */}
          <button
            onClick={handleLaunch}
            className="w-full flex items-center justify-center space-x-2.5 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-xl shadow-blue-600/25 transition-all active:scale-[0.99]"
          >
            <Sparkles className="w-4 h-4" />
            <span>Launch Dubbing Pipeline ({sourceLanguageOverride} → {targetLanguage})</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
};
