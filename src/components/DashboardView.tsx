import React from 'react';
import {
  Plus,
  CheckCircle2,
  Clock,
  AlertTriangle,
  HardDrive,
  Film,
  Play,
  ArrowRight,
  MoreVertical,
  Download,
  Copy,
  Trash2,
  ExternalLink,
  Sparkles,
  Volume2,
} from 'lucide-react';
import { Project, SystemStatus } from '../types';

interface DashboardViewProps {
  projects: Project[];
  systemStatus: SystemStatus | null;
  onCreateNew: () => void;
  onOpenProject: (project: Project) => void;
  onDuplicateProject: (id: string) => void;
  onDeleteProject: (id: string) => void;
  onQuickStart: (sampleId: string) => void;
  theme: 'dark' | 'light';
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  projects,
  systemStatus,
  onCreateNew,
  onOpenProject,
  onDuplicateProject,
  onDeleteProject,
  onQuickStart,
  theme,
}) => {
  const completedCount = projects.filter((p) => p.status === 'completed').length;
  const processingCount = projects.filter((p) => p.status === 'processing').length;
  const failedCount = projects.filter((p) => p.status === 'failed').length;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Banner / Welcome Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-purple-900/20 border border-blue-500/20 backdrop-blur-sm shadow-lg">
        <div>
          <div className="flex items-center space-x-2 text-blue-400 font-semibold text-xs tracking-wider uppercase mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Windows Video Dubbing Suite</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">DubMaster AI Studio</h1>
          <p className="text-xs text-zinc-400 mt-1 max-w-xl">
            State-of-the-art automatic video dubbing between English, Bengali, Hindi, Chinese, and global languages with synchronized speech, multi-speaker recognition, and instant video rendering.
          </p>
        </div>
        <button
          onClick={onCreateNew}
          className="flex items-center justify-center space-x-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-lg shadow-blue-600/30 hover:shadow-blue-500/50 transition-all active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Project</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className={`p-4 rounded-xl border transition-all ${theme === 'dark' ? 'bg-[#18181b] border-zinc-800' : 'bg-white border-zinc-200 shadow-sm'}`}>
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-2">
            <span>Completed Projects</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">{completedCount}</div>
          <div className="text-[11px] text-zinc-500 mt-1">Rendered & Synchronized</div>
        </div>

        <div className={`p-4 rounded-xl border transition-all ${theme === 'dark' ? 'bg-[#18181b] border-zinc-800' : 'bg-white border-zinc-200 shadow-sm'}`}>
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-2">
            <span>Active Processing</span>
            <Clock className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-blue-400">{processingCount}</div>
          <div className="text-[11px] text-zinc-500 mt-1">Weighted queue active</div>
        </div>

        <div className={`p-4 rounded-xl border transition-all ${theme === 'dark' ? 'bg-[#18181b] border-zinc-800' : 'bg-white border-zinc-200 shadow-sm'}`}>
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-2">
            <span>Failed / Retrying</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-zinc-300">{failedCount}</div>
          <div className="text-[11px] text-zinc-500 mt-1">Safe segment recovery</div>
        </div>

        <div className={`p-4 rounded-xl border transition-all ${theme === 'dark' ? 'bg-[#18181b] border-zinc-800' : 'bg-white border-zinc-200 shadow-sm'}`}>
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-2">
            <span>Temp Storage</span>
            <HardDrive className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-indigo-400">{systemStatus?.diskSpace || '24.5 GB'}</div>
          <div className="text-[11px] text-zinc-500 mt-1">Documents/DubMasterAI</div>
        </div>
      </div>

      {/* Quick 1-Click Launchers for Primary Use Cases */}
      <div className={`p-4 rounded-xl border ${theme === 'dark' ? 'bg-[#18181b] border-zinc-800' : 'bg-white border-zinc-200'}`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Volume2 className="w-4 h-4 text-blue-400" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Quick Dubbing Launchers (Pre-loaded Samples)</h3>
          </div>
          <span className="text-[11px] text-zinc-500">Instant end-to-end test pipeline</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <button
            onClick={() => onQuickStart('sample-english')}
            className={`p-3 rounded-lg border text-left transition-all group flex flex-col justify-between ${
              theme === 'dark'
                ? 'bg-zinc-900/60 hover:bg-zinc-800/80 border-zinc-800 hover:border-blue-500/50'
                : 'bg-zinc-50 hover:bg-zinc-100 border-zinc-200 hover:border-blue-500'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-blue-400">English → Bengali (বাংলা)</span>
                <span className="text-xs">🇺🇸 ➔ 🇧🇩</span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-tight">Primary benchmark: High-accuracy detection, translation to Bengali & Kore TTS</p>
            </div>
            <div className="mt-3 flex items-center text-[11px] font-semibold text-blue-500 group-hover:translate-x-1 transition-transform">
              <span>Test Dubbing Now</span>
              <ArrowRight className="w-3 h-3 ml-1" />
            </div>
          </button>

          <button
            onClick={() => onQuickStart('sample-bengali')}
            className={`p-3 rounded-lg border text-left transition-all group flex flex-col justify-between ${
              theme === 'dark'
                ? 'bg-zinc-900/60 hover:bg-zinc-800/80 border-zinc-800 hover:border-indigo-500/50'
                : 'bg-zinc-50 hover:bg-zinc-100 border-zinc-200 hover:border-indigo-500'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-indigo-400">Bengali → English</span>
                <span className="text-xs">🇧🇩 ➔ 🇺🇸</span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-tight">Reverse dubbing: Bengali speech transcription to fluent English narration</p>
            </div>
            <div className="mt-3 flex items-center text-[11px] font-semibold text-indigo-500 group-hover:translate-x-1 transition-transform">
              <span>Test Dubbing Now</span>
              <ArrowRight className="w-3 h-3 ml-1" />
            </div>
          </button>

          <button
            onClick={() => onQuickStart('sample-hindi')}
            className={`p-3 rounded-lg border text-left transition-all group flex flex-col justify-between ${
              theme === 'dark'
                ? 'bg-zinc-900/60 hover:bg-zinc-800/80 border-zinc-800 hover:border-purple-500/50'
                : 'bg-zinc-50 hover:bg-zinc-100 border-zinc-200 hover:border-purple-500'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-purple-400">English → Hindi (हिन्दी)</span>
                <span className="text-xs">🇺🇸 ➔ 🇮🇳</span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-tight">Multilingual pair: Real-time translation to Hindi speech & Zephyr voice</p>
            </div>
            <div className="mt-3 flex items-center text-[11px] font-semibold text-purple-500 group-hover:translate-x-1 transition-transform">
              <span>Test Dubbing Now</span>
              <ArrowRight className="w-3 h-3 ml-1" />
            </div>
          </button>

          <button
            onClick={() => onQuickStart('sample-chinese')}
            className={`p-3 rounded-lg border text-left transition-all group flex flex-col justify-between ${
              theme === 'dark'
                ? 'bg-zinc-900/60 hover:bg-zinc-800/80 border-zinc-800 hover:border-emerald-500/50'
                : 'bg-zinc-50 hover:bg-zinc-100 border-zinc-200 hover:border-emerald-500'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-emerald-400">Chinese (中文) → Bengali</span>
                <span className="text-xs">🇨🇳 ➔ 🇧🇩</span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-tight">Cross-Asian speech recognition and Bengali vocal dubbing generation</p>
            </div>
            <div className="mt-3 flex items-center text-[11px] font-semibold text-emerald-500 group-hover:translate-x-1 transition-transform">
              <span>Test Dubbing Now</span>
              <ArrowRight className="w-3 h-3 ml-1" />
            </div>
          </button>
        </div>
      </div>

      {/* Recent Projects Table */}
      <div className={`rounded-xl border overflow-hidden ${theme === 'dark' ? 'bg-[#18181b] border-zinc-800' : 'bg-white border-zinc-200 shadow-sm'}`}>
        <div className="p-4 border-b border-inherit flex items-center justify-between">
          <div>
            <h2 className="font-bold text-sm tracking-tight">Recent Projects</h2>
            <p className="text-[11px] text-zinc-500">Persisted locally in SQLite repository & project assets folder</p>
          </div>
          <span className="text-xs font-mono text-zinc-400">{projects.length} Projects Total</span>
        </div>

        {projects.length === 0 ? (
          <div className="p-12 text-center text-zinc-500 text-xs">
            <Film className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="font-semibold">No dubbing projects found</p>
            <p className="mt-1">Click "Create New Project" or choose a quick launcher above to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className={`border-b text-zinc-400 font-semibold uppercase text-[10px] tracking-wider ${theme === 'dark' ? 'bg-zinc-900/50 border-zinc-800' : 'bg-zinc-50 border-zinc-200'}`}>
                <tr>
                  <th className="py-3 px-4">Project Name</th>
                  <th className="py-3 px-3">Languages</th>
                  <th className="py-3 px-3">Resolution</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Progress</th>
                  <th className="py-3 px-3">Last Modified</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-inherit">
                {projects.map((project) => (
                  <tr
                    key={project.id}
                    className={`transition-colors cursor-pointer ${
                      theme === 'dark' ? 'hover:bg-zinc-800/40' : 'hover:bg-zinc-50'
                    }`}
                    onClick={() => onOpenProject(project)}
                  >
                    <td className="py-3 px-4">
                      <div className="font-semibold text-zinc-200">{project.name}</div>
                      <div className="text-[11px] text-zinc-500 font-mono truncate max-w-xs">{project.originalFilename}</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded bg-zinc-800/80 border border-zinc-700/50 text-[11px] font-medium">
                        <span>{project.sourceLanguage}</span>
                        <span className="text-zinc-500">→</span>
                        <span className="text-blue-400 font-bold">{project.targetLanguage}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] text-zinc-400">
                      {project.resolution} ({project.duration.toFixed(1)}s)
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          project.status === 'completed'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : project.status === 'processing'
                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20 animate-pulse'
                            : 'bg-zinc-800 text-zinc-400'
                        }`}
                      >
                        {project.status === 'completed' ? 'Completed' : project.status === 'processing' ? 'Processing' : 'Draft'}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="w-24">
                        <div className="flex justify-between text-[10px] font-mono mb-1">
                          <span>{project.progress}%</span>
                        </div>
                        <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              project.status === 'completed' ? 'bg-emerald-500' : 'bg-blue-500'
                            }`}
                            style={{ width: `${project.progress}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-zinc-400 text-[11px]">
                      {new Date(project.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right space-x-1" onClick={(e) => e.stopPropagation()}>
                      {project.outputUrl && (
                        <a
                          href={project.outputUrl}
                          download={`dubbed-${project.targetLanguage.toLowerCase()}.mp4`}
                          title="Download Dubbed Video"
                          className="inline-flex p-1.5 rounded hover:bg-zinc-700/40 text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </a>
                      )}
                      <button
                        onClick={() => onDuplicateProject(project.id)}
                        title="Duplicate Project"
                        className="p-1.5 rounded hover:bg-zinc-700/40 text-zinc-400 hover:text-zinc-200 transition-colors"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteProject(project.id)}
                        title="Delete Project"
                        className="p-1.5 rounded hover:bg-red-500/20 text-zinc-400 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
