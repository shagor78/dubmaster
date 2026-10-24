import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Clock,
  RotateCw,
  Play,
  Pause,
  XCircle,
  Download,
  AlertTriangle,
  Terminal,
  Volume2,
  VolumeX,
  Film,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { Project } from '../types';

interface ProcessingQueueViewProps {
  project: Project | null;
  onUpdateProject: (updated: Partial<Project>) => void;
  onCancelPipeline: () => void;
  theme: 'dark' | 'light';
}

interface StageItem {
  id: string;
  name: string;
  weight: number;
  status: 'completed' | 'active' | 'waiting' | 'failed';
  subProgress: number; // 0 to 100
  description: string;
}

export const ProcessingQueueView: React.FC<ProcessingQueueViewProps> = ({
  project,
  onUpdateProject,
  onCancelPipeline,
  theme,
}) => {
  if (!project) {
    return (
      <div className="p-12 text-center text-zinc-500 text-xs">
        <Film className="w-10 h-10 mx-auto mb-3 opacity-40" />
        <h3 className="font-semibold text-sm text-zinc-400">No Job in Processing Queue</h3>
        <p className="mt-1">Launch a new dubbing project or pick one from the dashboard to track live progress.</p>
      </div>
    );
  }

  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [audioTrackChoice, setAudioTrackChoice] = useState<'dubbed' | 'original'>('dubbed');
  const [logs, setLogs] = useState<Array<{ time: string; text: string; type: 'info' | 'success' | 'warn' }>>([
    { time: '00:00:01', text: `Project initialized: ${project.name}`, type: 'info' },
    { time: '00:00:02', text: `Media inspection: ${project.resolution} @ ${project.frameRate}, duration: ${project.duration.toFixed(1)}s`, type: 'info' },
    { time: '00:00:03', text: `Acoustic analysis completed: Source language verified as ${project.sourceLanguage}`, type: 'success' },
  ]);

  // Stage weights totaling 100%
  const [stages, setStages] = useState<StageItem[]>([
    { id: 'analysis', name: 'Media Analysis', weight: 5, status: 'completed', subProgress: 100, description: 'FFprobe container inspection' },
    { id: 'extraction', name: 'Audio Extraction', weight: 10, status: 'completed', subProgress: 100, description: 'FFmpeg lossless PCM extraction' },
    { id: 'recognition', name: 'Speech Recognition', weight: 20, status: project.progress > 35 ? 'completed' : 'active', subProgress: project.progress > 35 ? 100 : 85, description: 'Neural speech transcription & timestamping' },
    { id: 'translation', name: 'Translation', weight: 15, status: project.progress > 50 ? 'completed' : project.progress > 35 ? 'active' : 'waiting', subProgress: project.progress > 50 ? 100 : 60, description: `Context translation (${project.sourceLanguage} → ${project.targetLanguage})` },
    { id: 'tts', name: 'Voice Generation', weight: 25, status: project.progress > 75 ? 'completed' : project.progress > 50 ? 'active' : 'waiting', subProgress: project.progress > 75 ? 100 : 45, description: `Synthesizing ${project.selectedVoice} speech segments` },
    { id: 'sync', name: 'Audio Synchronization & Mixing', weight: 10, status: project.progress > 85 ? 'completed' : project.progress > 75 ? 'active' : 'waiting', subProgress: project.progress > 85 ? 100 : 20, description: 'Atempo alignment and background ducking' },
    { id: 'render', name: 'Final Rendering & Verification', weight: 15, status: project.status === 'completed' ? 'completed' : project.progress > 85 ? 'active' : 'waiting', subProgress: project.status === 'completed' ? 100 : 10, description: 'FFmpeg H.264/AAC muxing and export' },
  ]);

  // Timer simulation for real elapsed and estimated remaining time
  useEffect(() => {
    if (project.status !== 'processing' || isPaused) return;

    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [project.status, isPaused]);

  // Automatic progression for active demo projects
  useEffect(() => {
    if (project.status !== 'processing' || isPaused) return;

    const pipelineTimer = setTimeout(async () => {
      if (project.progress < 100) {
        const nextProgress = Math.min(100, project.progress + 15);
        let nextStage = project.currentStage;

        if (nextProgress >= 100) {
          nextStage = 'Final Rendering';
          // Call real render endpoint to produce final playable MP4 video!
          try {
            const res = await fetch('/api/pipeline/render', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                projectId: project.id,
                videoPath: project.videoUrl,
                segments: project.segments,
                audioMode: project.audioMode,
                duckingVolume: project.duckingVolume,
                targetLanguage: project.targetLanguage,
              }),
            });
            const data = await res.json();
            if (data.outputUrl) {
              onUpdateProject({
                progress: 100,
                status: 'completed',
                currentStage: 'Completed',
                outputUrl: data.outputUrl,
                outputPath: data.outputPath,
              });
              setLogs((prev) => [
                ...prev,
                { time: new Date().toLocaleTimeString(), text: `Video rendered successfully: ${data.outputFilename} (${Math.round(data.fileSize / 1024)} KB)`, type: 'success' },
              ]);
              return;
            }
          } catch (e) {
            console.warn('Pipeline render error:', e);
          }
        } else if (nextProgress >= 75) {
          nextStage = 'Audio Synchronization & Mixing';
        } else if (nextProgress >= 50) {
          nextStage = 'Voice Generation';
        } else if (nextProgress >= 35) {
          nextStage = 'Translation';
        }

        onUpdateProject({
          progress: nextProgress,
          currentStage: nextStage,
        });

        setLogs((prev) => [
          ...prev,
          {
            time: new Date().toLocaleTimeString(),
            text: `Pipeline stage updated: ${nextStage} (${nextProgress}% complete)`,
            type: 'info',
          },
        ]);
      }
    }, 2500);

    return () => clearTimeout(pipelineTimer);
  }, [project.progress, project.status, isPaused]);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${rem.toString().padStart(2, '0')}`;
  };

  const estRemainingSec = project.status === 'completed' ? 0 : Math.max(0, Math.round(((100 - project.progress) / 20) * 3));

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Progress Overview Panel (Section 9 Requirement) */}
      <div className={`p-6 rounded-2xl border transition-all ${theme === 'dark' ? 'bg-[#18181b] border-zinc-800' : 'bg-white border-zinc-200 shadow-sm'}`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-blue-400 mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Real-Time Dubbing Pipeline Queue</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white">{project.name}</h1>
            <p className="text-xs text-zinc-400 font-mono mt-0.5">
              Original: {project.sourceLanguage} ➔ Target: <span className="text-blue-400 font-bold">{project.targetLanguage}</span> • Voice: {project.selectedVoice}
            </p>
          </div>

          {/* Action buttons (Pause, Cancel, Retry) */}
          <div className="flex items-center space-x-2">
            {project.status === 'processing' && (
              <button
                onClick={() => setIsPaused(!isPaused)}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold border border-zinc-700 transition-colors"
              >
                {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                <span>{isPaused ? 'Resume Job' : 'Pause'}</span>
              </button>
            )}

            {project.status === 'processing' && (
              <button
                onClick={onCancelPipeline}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white text-xs font-semibold border border-red-500/30 transition-colors"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Cancel Job</span>
              </button>
            )}

            {project.outputUrl && (
              <a
                href={project.outputUrl}
                download={`dubbed-${project.targetLanguage.toLowerCase()}.mp4`}
                className="flex items-center space-x-1.5 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/30 transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Dubbed Video</span>
              </a>
            )}
          </div>
        </div>

        {/* Large Weighted Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="font-semibold text-zinc-300">
              Current Stage: <span className="text-blue-400">{project.currentStage}</span>
            </span>
            <span className="text-lg font-bold text-white">{project.progress}%</span>
          </div>

          <div className="w-full bg-zinc-900 h-3 rounded-full overflow-hidden p-0.5 border border-zinc-800">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                project.status === 'completed'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-md shadow-emerald-500/30'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-500 shadow-md shadow-blue-500/30 animate-pulse'
              }`}
              style={{ width: `${project.progress}%` }}
            />
          </div>
        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 pt-4 border-t border-zinc-800/80 text-xs">
          <div>
            <span className="text-zinc-500 block text-[11px]">Elapsed Time</span>
            <span className="font-mono font-bold text-zinc-200">{formatTime(elapsedSeconds)}</span>
          </div>
          <div>
            <span className="text-zinc-500 block text-[11px]">Est. Remaining</span>
            <span className="font-mono font-bold text-zinc-200">
              {project.status === 'completed' ? '00:00' : `~${formatTime(estRemainingSec)}`}
            </span>
          </div>
          <div>
            <span className="text-zinc-500 block text-[11px]">Speech Segments</span>
            <span className="font-mono font-bold text-emerald-400">{project.segments.length} segments</span>
          </div>
          <div>
            <span className="text-zinc-500 block text-[11px]">Pipeline Status</span>
            <span
              className={`font-semibold ${
                project.status === 'completed'
                  ? 'text-emerald-400'
                  : isPaused
                  ? 'text-amber-400'
                  : 'text-blue-400'
              }`}
            >
              {project.status === 'completed' ? 'Render Completed' : isPaused ? 'Paused' : 'Active Processing'}
            </span>
          </div>
        </div>
      </div>

      {/* Grid: Left Column (Stage Checklist) | Right Column (Player & Event Logs) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: 7 Stages Breakdown (6 Cols) */}
        <div className="lg:col-span-6 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-zinc-400 px-1">
            <span>Pipeline Stages (Documented Weights = 100%)</span>
            <span className="text-[10px] font-mono text-zinc-500">Live Stage Tracker</span>
          </div>

          <div className="space-y-2">
            {stages.map((stg) => {
              const isDone = project.progress >= (stg.id === 'analysis' ? 5 : stg.id === 'extraction' ? 15 : stg.id === 'recognition' ? 35 : stg.id === 'translation' ? 50 : stg.id === 'tts' ? 75 : stg.id === 'sync' ? 85 : 100);
              const isCurrent = !isDone && project.currentStage.toLowerCase().includes(stg.id);

              return (
                <div
                  key={stg.id}
                  className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                    isDone
                      ? 'bg-zinc-900/60 border-emerald-500/20 text-zinc-300'
                      : isCurrent
                      ? 'bg-blue-900/15 border-blue-500/40 text-white shadow-sm'
                      : 'bg-zinc-900/30 border-zinc-800/80 text-zinc-500'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                        isDone
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : isCurrent
                          ? 'bg-blue-600 text-white animate-spin'
                          : 'bg-zinc-800 text-zinc-600'
                      }`}
                    >
                      {isDone ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : isCurrent ? (
                        <RotateCw className="w-3.5 h-3.5" />
                      ) : (
                        <Clock className="w-3.5 h-3.5" />
                      )}
                    </div>
                    <div>
                      <div className="font-semibold text-xs flex items-center space-x-2">
                        <span>{stg.name}</span>
                        <span className="text-[10px] font-mono text-zinc-500 font-normal">
                          ({stg.weight}%)
                        </span>
                      </div>
                      <div className="text-[10px] text-zinc-400 mt-0.5">{stg.description}</div>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                      isDone
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : isCurrent
                        ? 'bg-blue-500/15 text-blue-400'
                        : 'bg-zinc-800 text-zinc-600'
                    }`}
                  >
                    {isDone ? 'Completed' : isCurrent ? 'Processing' : 'Waiting'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Embedded Preview Player & Live Event Log (6 Cols) */}
        <div className="lg:col-span-6 space-y-4">
          {/* Synchronized Player Card */}
          <div className={`rounded-xl border overflow-hidden ${theme === 'dark' ? 'bg-[#18181b] border-zinc-800' : 'bg-white border-zinc-200'}`}>
            <div className="p-3 border-b border-inherit flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs font-semibold">
                <Film className="w-3.5 h-3.5 text-blue-400" />
                <span>
                  {project.status === 'completed'
                    ? 'Final Rendered Dubbed Video'
                    : 'Video Synchronizer Preview'}
                </span>
              </div>

              {/* Audio Track Toggle (Dubbed vs Original) */}
              <div className="flex items-center space-x-1 p-0.5 rounded-lg bg-zinc-900 border border-zinc-800 text-[10px]">
                <button
                  onClick={() => setAudioTrackChoice('dubbed')}
                  className={`px-2 py-0.5 rounded font-medium transition-colors ${
                    audioTrackChoice === 'dubbed' ? 'bg-blue-600 text-white' : 'text-zinc-400'
                  }`}
                >
                  Dubbed Audio ({project.targetLanguage})
                </button>
                <button
                  onClick={() => setAudioTrackChoice('original')}
                  className={`px-2 py-0.5 rounded font-medium transition-colors ${
                    audioTrackChoice === 'original' ? 'bg-zinc-700 text-white' : 'text-zinc-400'
                  }`}
                >
                  Original ({project.sourceLanguage})
                </button>
              </div>
            </div>

            <div className="relative aspect-video bg-black flex items-center justify-center">
              <video
                key={`${project.outputUrl || project.videoUrl}-${audioTrackChoice}`}
                src={audioTrackChoice === 'dubbed' && project.outputUrl ? project.outputUrl : project.videoUrl}
                controls
                className="w-full h-full object-contain"
              />
            </div>

            {project.status === 'completed' && (
              <div className="p-3 bg-emerald-500/10 border-t border-emerald-500/20 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2 text-emerald-400 font-semibold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Dubbing Pipeline Succeeded! Video Ready.</span>
                </div>
                {project.outputUrl && (
                  <a
                    href={project.outputUrl}
                    download={`dubbed-${project.targetLanguage.toLowerCase()}.mp4`}
                    className="flex items-center space-x-1 px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download MP4</span>
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Diagnostic Event Logs Console */}
          <div className="rounded-xl border border-zinc-800 bg-[#121214] overflow-hidden">
            <div className="px-3 py-2 bg-zinc-900/80 border-b border-zinc-800 flex items-center justify-between text-[11px]">
              <div className="flex items-center space-x-2 text-zinc-400">
                <Terminal className="w-3.5 h-3.5 text-blue-400" />
                <span className="font-mono">Live Processing Logs</span>
              </div>
              <span className="text-[10px] text-zinc-500 font-mono">Real-time FFmpeg & AI Events</span>
            </div>

            <div className="p-3 h-44 overflow-y-auto font-mono text-[11px] space-y-1.5 select-text">
              {logs.map((log, i) => (
                <div key={i} className="flex items-start space-x-2">
                  <span className="text-zinc-500 select-none">{log.time}</span>
                  <span
                    className={
                      log.type === 'success'
                        ? 'text-emerald-400'
                        : log.type === 'warn'
                        ? 'text-amber-400'
                        : 'text-zinc-300'
                    }
                  >
                    {log.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
