import React, { useState } from 'react';
import {
  Volume2,
  Sliders,
  Users,
  Play,
  RotateCw,
  Sparkles,
  CheckCircle2,
  Mic2,
  Waves,
} from 'lucide-react';
import { Project } from '../types';

interface AudioVoicesViewProps {
  project: Project | null;
  onUpdateProject: (updated: Partial<Project>) => void;
  theme: 'dark' | 'light';
}

export const AudioVoicesView: React.FC<AudioVoicesViewProps> = ({
  project,
  onUpdateProject,
  theme,
}) => {
  const [selectedVoice, setSelectedVoice] = useState<string>(project?.selectedVoice || 'Kore');
  const [speakingRate, setSpeakingRate] = useState<number>(project?.speakingRate || 1.0);
  const [duckingVolume, setDuckingVolume] = useState<number>(project?.duckingVolume || 0.15);
  const [audioMode, setAudioMode] = useState<string>(project?.audioMode || 'replace');
  const [normalizeAudio, setNormalizeAudio] = useState<boolean>(project?.normalizeAudio ?? true);
  const [speaker1Voice, setSpeaker1Voice] = useState<string>('Kore');
  const [speaker2Voice, setSpeaker2Voice] = useState<string>('Zephyr');
  const [silenceMs, setSilenceMs] = useState<number>(180);
  const [crossfadeMs, setCrossfadeMs] = useState<number>(60);
  const [isPreviewing, setIsPreviewing] = useState<boolean>(false);

  const handlePreviewVoice = async (voice: string) => {
    setIsPreviewing(true);
    try {
      const targetLang = project?.targetLanguage || 'Bengali';
      const sampleText =
        targetLang === 'Bengali'
          ? 'ডাবমাস্টার এআই-তে এই কণ্ঠস্বরটি পরিষ্কার এবং সাবলীল।'
          : targetLang === 'Hindi'
          ? 'डबमास्टर एआई में यह आवाज़ बहुत स्पष्ट और स्वाभाविक है।'
          : targetLang === 'Chinese'
          ? 'DubMaster AI 语音合成测试，音质纯净自然。'
          : 'This is a studio test of the DubMaster AI dubbing voice engine.';

      const res = await fetch('/api/pipeline/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: sampleText,
          language: targetLang,
          voiceName: voice,
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
      setIsPreviewing(false);
    }
  };

  const handleSaveSettings = () => {
    onUpdateProject({
      selectedVoice,
      speakingRate,
      duckingVolume,
      audioMode: audioMode as any,
      normalizeAudio,
    });
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Audio and Voice Settings</h1>
          <p className="text-xs text-zinc-500">
            Configure target language voice actors, speaking cadence, multi-speaker diarization, and timeline synchronization.
          </p>
        </div>
        <button
          onClick={handleSaveSettings}
          className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors"
        >
          Apply Audio Settings
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Voice Selection & Profiles */}
        <div className={`p-5 rounded-xl border space-y-4 ${theme === 'dark' ? 'bg-[#18181b] border-zinc-800' : 'bg-white border-zinc-200'}`}>
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-zinc-400">
            <Mic2 className="w-4 h-4 text-blue-400" />
            <span>Target Language Voice Actors</span>
          </div>

          <div className="space-y-2.5">
            {[
              { id: 'Kore', name: 'Kore', style: 'Natural, Warm Studio Actor', tag: 'Ideal for Bengali, Hindi & English' },
              { id: 'Zephyr', name: 'Zephyr', style: 'Crisp Professional Broadcast', tag: 'High clarity & precision' },
              { id: 'Puck', name: 'Puck', style: 'Expressive Dynamic Narration', tag: 'Engaging & energetic' },
              { id: 'Charon', name: 'Charon', style: 'Deep Authoritative Resonance', tag: 'Documentary & cinematic' },
              { id: 'Fenrir', name: 'Fenrir', style: 'Articulate Conversational Pace', tag: 'Modern podcast & tutorial' },
            ].map((v) => (
              <div
                key={v.id}
                onClick={() => setSelectedVoice(v.id)}
                className={`p-3 rounded-lg border cursor-pointer flex items-center justify-between transition-all ${
                  selectedVoice === v.id
                    ? 'bg-blue-600/10 border-blue-500 text-white'
                    : 'bg-zinc-900/40 border-zinc-800 text-zinc-300 hover:bg-zinc-800/40'
                }`}
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-xs">{v.name}</span>
                    <span className="text-[10px] text-zinc-500">{v.style}</span>
                  </div>
                  <div className="text-[10px] text-blue-400 font-mono mt-0.5">{v.tag}</div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePreviewVoice(v.id);
                  }}
                  disabled={isPreviewing}
                  className="p-1.5 rounded-lg bg-zinc-800 hover:bg-blue-600 text-zinc-300 hover:text-white transition-colors"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Multi-Speaker Diarization Assignment */}
        <div className={`p-5 rounded-xl border space-y-4 ${theme === 'dark' ? 'bg-[#18181b] border-zinc-800' : 'bg-white border-zinc-200'}`}>
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-zinc-400">
            <Users className="w-4 h-4 text-indigo-400" />
            <span>Multiple Speaker Voice Assignment</span>
          </div>

          <p className="text-xs text-zinc-400">
            Assign unique target voices to detected speaker identities to maintain distinct dialogue channels.
          </p>

          <div className="space-y-3 pt-2">
            <div className="p-3 rounded-lg bg-zinc-900/50 border border-zinc-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-zinc-200">Speaker 1 Voice Actor</span>
                <span className="text-[10px] text-blue-400 font-mono">Lead Dialogue</span>
              </div>
              <select
                value={speaker1Voice}
                onChange={(e) => setSpeaker1Voice(e.target.value)}
                className="w-full p-2 rounded bg-zinc-800 border border-zinc-700 text-xs text-zinc-200 outline-none"
              >
                <option value="Kore">Kore (Warm Female Timbre)</option>
                <option value="Zephyr">Zephyr (Deep Male Timbre)</option>
                <option value="Puck">Puck (Expressive Male Timbre)</option>
              </select>
            </div>

            <div className="p-3 rounded-lg bg-zinc-900/50 border border-zinc-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-zinc-200">Speaker 2 Voice Actor</span>
                <span className="text-[10px] text-indigo-400 font-mono">Secondary Dialogue</span>
              </div>
              <select
                value={speaker2Voice}
                onChange={(e) => setSpeaker2Voice(e.target.value)}
                className="w-full p-2 rounded bg-zinc-800 border border-zinc-700 text-xs text-zinc-200 outline-none"
              >
                <option value="Zephyr">Zephyr (Deep Male Timbre)</option>
                <option value="Kore">Kore (Warm Female Timbre)</option>
                <option value="Fenrir">Fenrir (Crisp Actor)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Speed, Normalization & Padding */}
        <div className={`p-5 rounded-xl border space-y-4 ${theme === 'dark' ? 'bg-[#18181b] border-zinc-800' : 'bg-white border-zinc-200'}`}>
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-zinc-400">
            <Sliders className="w-4 h-4 text-emerald-400" />
            <span>Cadence & Normalization</span>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-zinc-400">Speaking Rate Adjustment</span>
                <span className="font-mono text-emerald-400 font-bold">{speakingRate}x</span>
              </div>
              <input
                type="range"
                min="0.75"
                max="1.35"
                step="0.05"
                value={speakingRate}
                onChange={(e) => setSpeakingRate(parseFloat(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-zinc-500 font-mono mt-0.5">
                <span>0.75x (Relaxed)</span>
                <span>1.0x (Natural)</span>
                <span>1.35x (Brisk)</span>
              </div>
            </div>

            <div className="pt-2 border-t border-inherit flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-zinc-200 block">Audio Loudness Normalization</span>
                <span className="text-[10px] text-zinc-500">Conforms to broadcast EBU R128 (-16 LUFS)</span>
              </div>
              <input
                type="checkbox"
                checked={normalizeAudio}
                onChange={(e) => setNormalizeAudio(e.target.checked)}
                className="w-4 h-4 accent-blue-600 rounded"
              />
            </div>
          </div>
        </div>

        {/* Mixing & Ducking Parameters */}
        <div className={`p-5 rounded-xl border space-y-4 ${theme === 'dark' ? 'bg-[#18181b] border-zinc-800' : 'bg-white border-zinc-200'}`}>
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-zinc-400">
            <Waves className="w-4 h-4 text-purple-400" />
            <span>Audio Ducking & Timeline Alignment</span>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-zinc-400">Original Audio Ducking Volume</span>
                <span className="font-mono text-purple-400 font-bold">{Math.round(duckingVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.40"
                step="0.01"
                value={duckingVolume}
                onChange={(e) => setDuckingVolume(parseFloat(e.target.value))}
                className="w-full accent-purple-600 cursor-pointer"
              />
              <p className="text-[10px] text-zinc-500 mt-1">
                Maintains original audio quietly underneath the newly synthesized voice track.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-inherit">
              <div>
                <label className="block text-[10px] text-zinc-400 mb-1">Silence Padding</label>
                <input
                  type="number"
                  value={silenceMs}
                  onChange={(e) => setSilenceMs(parseInt(e.target.value) || 0)}
                  className="w-full p-1.5 rounded bg-zinc-800 border border-zinc-700 text-xs font-mono text-zinc-200"
                />
              </div>
              <div>
                <label className="block text-[10px] text-zinc-400 mb-1">Audio Crossfade</label>
                <input
                  type="number"
                  value={crossfadeMs}
                  onChange={(e) => setCrossfadeMs(parseInt(e.target.value) || 0)}
                  className="w-full p-1.5 rounded bg-zinc-800 border border-zinc-700 text-xs font-mono text-zinc-200"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
