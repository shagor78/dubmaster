import React, { useState, useRef } from 'react';
import {
  Play,
  RotateCw,
  Plus,
  Trash2,
  Download,
  Save,
  Search,
  Volume2,
  FileText,
  Clock,
  Sparkles,
  Check,
  User,
  ArrowRight,
} from 'lucide-react';
import { Project, Segment } from '../types';

interface TranscriptEditorViewProps {
  project: Project | null;
  onUpdateProject: (updated: Partial<Project>) => void;
  theme: 'dark' | 'light';
}

export const TranscriptEditorView: React.FC<TranscriptEditorViewProps> = ({
  project,
  onUpdateProject,
  theme,
}) => {
  if (!project) {
    return (
      <div className="p-12 text-center text-zinc-500 text-xs">
        <FileText className="w-10 h-10 mx-auto mb-3 opacity-40" />
        <h3 className="font-semibold text-sm text-zinc-400">No Active Project Selected</h3>
        <p className="mt-1">Please select or create a dubbing project to open the transcript editor.</p>
      </div>
    );
  }

  const [segments, setSegments] = useState<Segment[]>(project.segments || []);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeSegmentId, setActiveSegmentId] = useState<number | null>(segments[0]?.id || null);
  const [isPlayingAudio, setIsPlayingAudio] = useState<number | null>(null);
  const [isTranslatingSeg, setIsTranslatingSeg] = useState<number | null>(null);
  const [isGeneratingTts, setIsGeneratingTts] = useState<number | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement>(null);

  const handleSeekVideo = (startSec: number, segId: number) => {
    setActiveSegmentId(segId);
    if (videoRef.current) {
      videoRef.current.currentTime = startSec;
      videoRef.current.play().catch(() => {});
    }
  };

  const handleUpdateSegment = (id: number, field: keyof Segment, val: any) => {
    const updated = segments.map((s) => (s.id === id ? { ...s, [field]: val } : s));
    setSegments(updated);
  };

  const handleAddSegment = () => {
    const lastSeg = segments[segments.length - 1];
    const newId = segments.length > 0 ? Math.max(...segments.map((s) => s.id)) + 1 : 1;
    const startSec = lastSeg ? lastSeg.endSec : 0;
    const endSec = startSec + 3.0;

    const formatSec = (sec: number) => {
      const m = Math.floor(sec / 60);
      const rem = (sec % 60).toFixed(3);
      return `${m.toString().padStart(2, '0')}:${rem.padStart(6, '0')}`;
    };

    const newSeg: Segment = {
      id: newId,
      start: formatSec(startSec),
      end: formatSec(endSec),
      startSec,
      endSec,
      originalText: 'New spoken speech segment.',
      translatedText: '',
      speaker: 'Speaker 1',
      audioStatus: 'pending',
    };

    const updated = [...segments, newSeg];
    setSegments(updated);
    setActiveSegmentId(newId);
  };

  const handleDeleteSegment = (id: number) => {
    const updated = segments.filter((s) => s.id !== id);
    setSegments(updated);
  };

  const handleSaveAll = async () => {
    onUpdateProject({ segments });
    try {
      await fetch(`/api/projects/${project.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ segments }),
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (e) {
      console.warn('Save failed:', e);
    }
  };

  const handlePlaySegmentAudio = async (seg: Segment) => {
    setIsPlayingAudio(seg.id);
    try {
      // If audioUrl already generated, play it
      if (seg.audioUrl) {
        const audio = new Audio(seg.audioUrl);
        audio.onended = () => setIsPlayingAudio(null);
        await audio.play();
        return;
      }

      // Generate on-demand TTS for preview
      const res = await fetch('/api/pipeline/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          segmentId: seg.id,
          text: seg.translatedText || seg.originalText,
          language: project.targetLanguage,
          voiceName: project.selectedVoice,
          speakingRate: project.speakingRate,
        }),
      });
      const data = await res.json();
      if (data.audioUrl) {
        handleUpdateSegment(seg.id, 'audioUrl', data.audioUrl);
        handleUpdateSegment(seg.id, 'audioStatus', 'generated');
        const audio = new Audio(data.audioUrl);
        audio.onended = () => setIsPlayingAudio(null);
        await audio.play();
      }
    } catch (e) {
      console.warn('Play audio failed:', e);
      setIsPlayingAudio(null);
    }
  };

  const handleRetranslateSegment = async (seg: Segment) => {
    setIsTranslatingSeg(seg.id);
    try {
      const res = await fetch('/api/pipeline/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          segments: [seg],
          sourceLanguage: project.sourceLanguage,
          targetLanguage: project.targetLanguage,
        }),
      });
      const data = await res.json();
      if (data.segments && data.segments[0]) {
        handleUpdateSegment(seg.id, 'translatedText', data.segments[0].translatedText);
      }
    } catch (e) {
      console.warn('Re-translation failed:', e);
    } finally {
      setIsTranslatingSeg(null);
    }
  };

  const handleExportSubtitles = async (format: 'srt' | 'vtt') => {
    try {
      const res = await fetch('/api/export/subtitles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          segments,
          format,
          languageType: 'translated',
        }),
      });
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${project.name.replace(/\s+/g, '_')}_subtitles.${format}`;
      a.click();
    } catch (e) {
      console.warn('Subtitle export error:', e);
    }
  };

  const filteredSegments = segments.filter(
    (s) =>
      s.originalText.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.translatedText.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.speaker.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-5">
      {/* Top Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl border bg-zinc-900/50 border-zinc-800">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-blue-400">
            <span>Synchronized Subtitle & Voice Editor</span>
            <span className="text-zinc-600">•</span>
            <span className="font-mono text-zinc-300">
              {project.sourceLanguage} ➔ {project.targetLanguage}
            </span>
          </div>
          <h2 className="text-lg font-bold tracking-tight text-white">{project.name}</h2>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          {/* Subtitle Downloads */}
          <button
            onClick={() => handleExportSubtitles('srt')}
            title="Download SRT Subtitle file"
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium border border-zinc-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export SRT</span>
          </button>
          <button
            onClick={() => handleExportSubtitles('vtt')}
            title="Download WebVTT Subtitle file"
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium border border-zinc-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export VTT</span>
          </button>

          {/* Add Segment */}
          <button
            onClick={handleAddSegment}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium border border-zinc-700 transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-blue-400" />
            <span>Add Segment</span>
          </button>

          {/* Save Button */}
          <button
            onClick={handleSaveAll}
            className={`flex items-center space-x-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition-all shadow-md ${
              saveSuccess
                ? 'bg-emerald-600 text-white'
                : 'bg-blue-600 hover:bg-blue-500 text-white'
            }`}
          >
            {saveSuccess ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
            <span>{saveSuccess ? 'Changes Saved!' : 'Save Transcript'}</span>
          </button>
        </div>
      </div>

      {/* Synchronized Mini Player + Search */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        <div className="md:col-span-4 rounded-xl border border-zinc-800 bg-black overflow-hidden aspect-video relative flex items-center justify-center">
          <video
            ref={videoRef}
            src={project.videoUrl}
            controls
            className="w-full h-full object-contain"
          />
        </div>

        <div className="md:col-span-8 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-zinc-500" />
            <input
              type="text"
              placeholder="Search original speech, translated text, or speaker tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-9 pr-4 py-2 rounded-lg text-xs border outline-none ${
                theme === 'dark'
                  ? 'bg-zinc-900 border-zinc-800 text-zinc-200 focus:border-blue-500'
                  : 'bg-white border-zinc-200 text-zinc-800 focus:border-blue-500'
              }`}
            />
          </div>

          <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-blue-400" />
              <span>
                Tip: Click the play timestamp button on any segment row to synchronize video playback to that exact second.
              </span>
            </div>
            <span className="font-mono text-[11px] font-bold">{segments.length} Segments Total</span>
          </div>
        </div>
      </div>

      {/* Dual Synchronized Columns Table (Left: Original Transcript | Right: Translated Transcript) */}
      <div className="rounded-xl border border-zinc-800 overflow-hidden bg-[#18181b]">
        {/* Table Column Headers */}
        <div className="grid grid-cols-12 bg-zinc-900 border-b border-zinc-800 text-[10px] font-bold uppercase tracking-wider text-zinc-400 py-2.5 px-4">
          <div className="col-span-1"># Time</div>
          <div className="col-span-5 border-r border-zinc-800 pr-3">
            Original Transcript ({project.sourceLanguage})
          </div>
          <div className="col-span-5 pl-3">
            Translated Transcript ({project.targetLanguage})
          </div>
          <div className="col-span-1 text-right">Actions</div>
        </div>

        {/* Segment Rows */}
        <div className="divide-y divide-zinc-800/80">
          {filteredSegments.map((seg) => {
            const isSelected = activeSegmentId === seg.id;
            return (
              <div
                key={seg.id}
                className={`grid grid-cols-12 p-3 gap-3 transition-colors ${
                  isSelected ? 'bg-blue-900/15' : 'hover:bg-zinc-800/30'
                }`}
                onClick={() => setActiveSegmentId(seg.id)}
              >
                {/* # Time & Play */}
                <div className="col-span-1 flex flex-col justify-between">
                  <div className="flex items-center space-x-1 text-[11px] font-mono text-zinc-400">
                    <span className="font-bold text-white">#{seg.id}</span>
                  </div>
                  <button
                    onClick={() => handleSeekVideo(seg.startSec, seg.id)}
                    title={`Jump video to ${seg.start}`}
                    className="p-1 rounded bg-zinc-800 hover:bg-blue-600 text-zinc-300 hover:text-white transition-colors w-fit flex items-center space-x-1 text-[10px] font-mono"
                  >
                    <Play className="w-2.5 h-2.5 fill-current" />
                    <span>{seg.start.slice(0, 5)}</span>
                  </button>
                  {/* Speaker Label */}
                  <select
                    value={seg.speaker}
                    onChange={(e) => handleUpdateSegment(seg.id, 'speaker', e.target.value)}
                    className="text-[9px] px-1 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700 outline-none mt-1"
                  >
                    <option value="Speaker 1">Speaker 1</option>
                    <option value="Speaker 2">Speaker 2</option>
                  </select>
                </div>

                {/* Left Column: Original Transcript */}
                <div className="col-span-5 border-r border-zinc-800 pr-3 space-y-1.5">
                  <textarea
                    rows={2}
                    value={seg.originalText}
                    onChange={(e) => handleUpdateSegment(seg.id, 'originalText', e.target.value)}
                    className="w-full p-2 rounded bg-zinc-900/80 border border-zinc-800 text-zinc-200 text-xs outline-none focus:border-zinc-600 resize-none font-sans"
                  />
                  <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono">
                    <span>
                      Start: {seg.start} → End: {seg.end}
                    </span>
                  </div>
                </div>

                {/* Right Column: Translated Transcript */}
                <div className="col-span-5 pl-3 space-y-1.5">
                  <textarea
                    rows={2}
                    value={seg.translatedText}
                    placeholder={`Enter ${project.targetLanguage} translation...`}
                    onChange={(e) => handleUpdateSegment(seg.id, 'translatedText', e.target.value)}
                    className="w-full p-2 rounded bg-zinc-900/80 border border-zinc-800 text-zinc-200 text-xs outline-none focus:border-blue-500 resize-none font-sans"
                  />
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                        seg.audioStatus === 'generated'
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                          : 'bg-zinc-800 text-zinc-400'
                      }`}
                    >
                      Voice: {seg.audioStatus === 'generated' ? 'Generated' : 'Pending Synthesis'}
                    </span>

                    <button
                      onClick={() => handleRetranslateSegment(seg)}
                      disabled={isTranslatingSeg === seg.id}
                      className="text-[10px] flex items-center space-x-1 text-blue-400 hover:text-blue-300 font-medium"
                    >
                      <RotateCw
                        className={`w-3 h-3 ${isTranslatingSeg === seg.id ? 'animate-spin' : ''}`}
                      />
                      <span>Re-translate</span>
                    </button>
                  </div>
                </div>

                {/* Actions per segment */}
                <div className="col-span-1 flex flex-col justify-between items-end">
                  <button
                    onClick={() => handlePlaySegmentAudio(seg)}
                    disabled={isPlayingAudio === seg.id}
                    title="Play Dubbed Audio for Segment"
                    className={`p-1.5 rounded transition-all ${
                      isPlayingAudio === seg.id
                        ? 'bg-blue-600 text-white animate-pulse'
                        : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                    }`}
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleDeleteSegment(seg.id)}
                    title="Delete Segment"
                    className="p-1.5 rounded hover:bg-red-500/20 text-zinc-500 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
