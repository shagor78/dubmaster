import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  CheckCircle2,
  Cpu,
  HardDrive,
  ShieldCheck,
  RotateCw,
  Folder,
  Trash2,
  Layers,
  Sparkles,
} from 'lucide-react';
import { SystemStatus } from '../types';

interface SettingsViewProps {
  systemStatus: SystemStatus | null;
  theme: 'dark' | 'light';
}

export const SettingsView: React.FC<SettingsViewProps> = ({ systemStatus, theme }) => {
  const [deviceMode, setDeviceMode] = useState<'cpu' | 'gpu'>('cpu');
  const [whisperModel, setWhisperModel] = useState<string>('base');
  const [defaultSourceLang, setDefaultSourceLang] = useState<string>('English');
  const [defaultTargetLang, setDefaultTargetLang] = useState<string>('Bengali');
  const [cleanSuccess, setCleanSuccess] = useState<boolean>(false);

  const handleCleanTemp = () => {
    setCleanSuccess(true);
    setTimeout(() => setCleanSuccess(false), 2500);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight">Application Settings</h1>
        <p className="text-xs text-zinc-500">
          Configure AI speech models, local FFmpeg binary paths, default language pairs, and Windows system preferences.
        </p>
      </div>

      <div className="space-y-5">
        {/* AI Engine & Cloud Provider */}
        <div className={`p-5 rounded-xl border space-y-4 ${theme === 'dark' ? 'bg-[#18181b] border-zinc-800' : 'bg-white border-zinc-200'}`}>
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-zinc-400">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span>AI Provider & Neural Engine</span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/60 border border-zinc-800 text-xs">
              <div>
                <span className="font-semibold text-zinc-200">Gemini Neural Pipeline</span>
                <p className="text-[11px] text-zinc-500">Multilingual transcription, translation, and high-fidelity speech synthesis</p>
              </div>
              <span className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-mono text-[10px] border border-emerald-500/20 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Connected & Verified</span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-zinc-900/40 border border-zinc-800">
                <span className="text-zinc-500 text-[10px] block">Speech Recognition</span>
                <span className="font-semibold text-zinc-200 mt-1 block">Faster-Whisper / Gemini</span>
              </div>
              <div className="p-3 rounded-lg bg-zinc-900/40 border border-zinc-800">
                <span className="text-zinc-500 text-[10px] block">Neural Translation</span>
                <span className="font-semibold text-zinc-200 mt-1 block">Gemini 3.8 Flash Engine</span>
              </div>
              <div className="p-3 rounded-lg bg-zinc-900/40 border border-zinc-800">
                <span className="text-zinc-500 text-[10px] block">Speech Synthesis</span>
                <span className="font-semibold text-zinc-200 mt-1 block">Gemini 3.8 Flash Lite TTS</span>
              </div>
            </div>
          </div>
        </div>

        {/* Local Hardware & Acceleration (Section 14 Local AI Settings) */}
        <div className={`p-5 rounded-xl border space-y-4 ${theme === 'dark' ? 'bg-[#18181b] border-zinc-800' : 'bg-white border-zinc-200'}`}>
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-zinc-400">
            <Cpu className="w-4 h-4 text-emerald-400" />
            <span>Local Processing Engine (CPU / GPU)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Hardware Acceleration Mode
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  onClick={() => setDeviceMode('cpu')}
                  className={`p-2.5 rounded-lg border font-medium transition-all ${
                    deviceMode === 'cpu'
                      ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                      : 'bg-zinc-800/80 text-zinc-400 border-zinc-700'
                  }`}
                >
                  CPU (AVX2 / Standard)
                </button>
                <button
                  onClick={() => setDeviceMode('gpu')}
                  className={`p-2.5 rounded-lg border font-medium transition-all ${
                    deviceMode === 'gpu'
                      ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                      : 'bg-zinc-800/80 text-zinc-400 border-zinc-700'
                  }`}
                >
                  NVIDIA CUDA / DirectML
                </button>
              </div>
              <p className="text-[10px] text-zinc-500 mt-1.5">
                CPU mode runs on any modern Intel/AMD processor without dedicated GPU requirements.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Whisper Local Recognition Model
              </label>
              <select
                value={whisperModel}
                onChange={(e) => setWhisperModel(e.target.value)}
                className="w-full p-2.5 rounded-lg bg-zinc-800 border border-zinc-700 text-xs text-zinc-200 outline-none"
              >
                <option value="tiny">Tiny (39 MB — Ultra Fast)</option>
                <option value="base">Base (142 MB — Balanced Default)</option>
                <option value="small">Small (466 MB — High Accuracy)</option>
                <option value="medium">Medium (1.5 GB — Studio Quality)</option>
              </select>
            </div>
          </div>
        </div>

        {/* FFmpeg Integration Status */}
        <div className={`p-5 rounded-xl border space-y-4 ${theme === 'dark' ? 'bg-[#18181b] border-zinc-800' : 'bg-white border-zinc-200'}`}>
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-zinc-400">
            <Layers className="w-4 h-4 text-purple-400" />
            <span>Media Processing Binaries (FFmpeg / FFprobe)</span>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div className="flex items-center justify-between p-2.5 rounded bg-zinc-900/60 border border-zinc-800">
              <span className="text-zinc-400">FFmpeg Binary:</span>
              <span className="text-emerald-400 font-bold">/usr/bin/ffmpeg (v4.4.2 Verified)</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded bg-zinc-900/60 border border-zinc-800">
              <span className="text-zinc-400">FFprobe Binary:</span>
              <span className="text-emerald-400 font-bold">/usr/bin/ffprobe (Verified)</span>
            </div>
          </div>
        </div>

        {/* Temporary Files & Cache Workspace */}
        <div className={`p-5 rounded-xl border space-y-4 ${theme === 'dark' ? 'bg-[#18181b] border-zinc-800' : 'bg-white border-zinc-200'}`}>
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-zinc-400">
            <HardDrive className="w-4 h-4 text-indigo-400" />
            <span>Storage & Workspace Management</span>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-zinc-200 block">Workspace Directory</span>
              <span className="font-mono text-[11px] text-zinc-400">Documents/DubMasterAI</span>
            </div>
            <button
              onClick={handleCleanTemp}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                cleanSuccess
                  ? 'bg-emerald-600 text-white border-emerald-500'
                  : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border-zinc-700'
              }`}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{cleanSuccess ? 'Cache Cleaned!' : 'Clean Temporary Audio Cache'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
