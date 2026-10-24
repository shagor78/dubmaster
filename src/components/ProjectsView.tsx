import React, { useState } from 'react';
import {
  FolderKanban,
  Search,
  Plus,
  Play,
  Copy,
  Trash2,
  Download,
  Calendar,
  Clock,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { Project } from '../types';

interface ProjectsViewProps {
  projects: Project[];
  onOpenProject: (project: Project) => void;
  onCreateNew: () => void;
  onDuplicateProject: (id: string) => void;
  onDeleteProject: (id: string) => void;
  theme: 'dark' | 'light';
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({
  projects,
  onOpenProject,
  onCreateNew,
  onDuplicateProject,
  onDeleteProject,
  theme,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filtered = projects.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.originalFilename.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sourceLanguage.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.targetLanguage.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' || p.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Dubbing Projects Library</h1>
          <p className="text-xs text-zinc-500">
            Stored locally in SQLite database metadata & dedicated project assets folder.
          </p>
        </div>

        <button
          onClick={onCreateNew}
          className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-md shadow-blue-600/30 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Project</span>
        </button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-zinc-500" />
          <input
            type="text"
            placeholder="Search projects by name, language, or file..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-9 pr-4 py-2 rounded-lg text-xs border outline-none ${
              theme === 'dark'
                ? 'bg-[#18181b] border-zinc-800 text-zinc-200 focus:border-blue-500'
                : 'bg-white border-zinc-200 text-zinc-900 focus:border-blue-500'
            }`}
          />
        </div>

        <div className="flex items-center space-x-2 text-xs">
          {['all', 'completed', 'processing', 'draft'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg capitalize font-medium transition-colors ${
                filterStatus === st
                  ? 'bg-blue-600 text-white'
                  : theme === 'dark'
                  ? 'bg-zinc-800/80 text-zinc-400 hover:text-zinc-200'
                  : 'bg-zinc-100 text-zinc-600 hover:text-zinc-900'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((proj) => (
          <div
            key={proj.id}
            onClick={() => onOpenProject(proj)}
            className={`p-4 rounded-xl border flex flex-col justify-between transition-all cursor-pointer group ${
              theme === 'dark'
                ? 'bg-[#18181b] border-zinc-800 hover:border-blue-500/60 hover:bg-zinc-850'
                : 'bg-white border-zinc-200 hover:border-blue-500 shadow-sm'
            }`}
          >
            <div>
              {/* Header tags */}
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-mono text-[10px] text-zinc-500 truncate max-w-[150px]">
                  {proj.originalFilename}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    proj.status === 'completed'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : proj.status === 'processing'
                      ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      : 'bg-zinc-800 text-zinc-400'
                  }`}
                >
                  {proj.status}
                </span>
              </div>

              <h3 className="font-bold text-sm text-zinc-200 group-hover:text-blue-400 transition-colors">
                {proj.name}
              </h3>

              {/* Language Tag */}
              <div className="mt-3 flex items-center space-x-2 text-xs">
                <div className="px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700/80 font-medium">
                  {proj.sourceLanguage} ➔ <span className="text-blue-400 font-bold">{proj.targetLanguage}</span>
                </div>
                <span className="text-zinc-500 text-[11px] font-mono">{proj.resolution}</span>
              </div>

              {/* Progress Bar */}
              <div className="mt-4 space-y-1">
                <div className="flex justify-between text-[10px] font-mono text-zinc-400">
                  <span>Progress</span>
                  <span>{proj.progress}%</span>
                </div>
                <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      proj.status === 'completed' ? 'bg-emerald-500' : 'bg-blue-500'
                    }`}
                    style={{ width: `${proj.progress}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Footer Metadata & Actions */}
            <div className="mt-4 pt-3 border-t border-inherit flex items-center justify-between text-xs text-zinc-500" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center space-x-1.5 text-[11px]">
                <Calendar className="w-3.5 h-3.5" />
                <span>{new Date(proj.updatedAt).toLocaleDateString()}</span>
              </div>

              <div className="flex items-center space-x-1">
                {proj.outputUrl && (
                  <a
                    href={proj.outputUrl}
                    download={`dubbed-${proj.targetLanguage.toLowerCase()}.mp4`}
                    title="Download Rendered Video"
                    className="p-1.5 rounded hover:bg-zinc-700/50 text-blue-400 hover:text-blue-300"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </a>
                )}
                <button
                  onClick={() => onDuplicateProject(proj.id)}
                  title="Duplicate Project"
                  className="p-1.5 rounded hover:bg-zinc-700/50 text-zinc-400 hover:text-zinc-200"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onDeleteProject(proj.id)}
                  title="Delete Project"
                  className="p-1.5 rounded hover:bg-red-500/20 text-zinc-400 hover:text-red-400"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
