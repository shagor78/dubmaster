import React from 'react';
import { Film, Minus, Square, X, Sun, Moon, CheckCircle2, ShieldCheck } from 'lucide-react';

interface TitleBarProps {
  projectName?: string;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  ffmpegInstalled: boolean;
  apiKeyActive: boolean;
}

export const TitleBar: React.FC<TitleBarProps> = ({
  projectName,
  theme,
  onToggleTheme,
  ffmpegInstalled,
  apiKeyActive,
}) => {
  return (
    <div
      className={`h-9 flex items-center justify-between px-3 text-xs select-none border-b transition-colors ${
        theme === 'dark'
          ? 'bg-[#18181b] border-zinc-800 text-zinc-300'
          : 'bg-[#f4f4f5] border-zinc-200 text-zinc-700'
      }`}
    >
      {/* App Logo & Window Title */}
      <div className="flex items-center space-x-2.5">
        <div className="flex items-center justify-center w-5 h-5 rounded bg-blue-600 text-white shadow-sm">
          <Film className="w-3.5 h-3.5" />
        </div>
        <span className="font-semibold text-sm tracking-tight text-blue-500">DubMaster AI</span>
        <span className="text-zinc-500">—</span>
        <span className="font-medium truncate max-w-xs">
          {projectName ? `${projectName} - Windows Desktop v1.0` : 'AI Video Dubbing Software (Windows 10/11)'}
        </span>
      </div>

      {/* Engine Status Indicators */}
      <div className="hidden md:flex items-center space-x-4">
        <div className="flex items-center space-x-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-mono text-[10px]">
          <CheckCircle2 className="w-3 h-3" />
          <span>FFmpeg v4.4.2 Active</span>
        </div>
        <div className="flex items-center space-x-1.5 px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono text-[10px]">
          <ShieldCheck className="w-3 h-3" />
          <span>Neural AI Pipeline</span>
        </div>
        <span className="text-zinc-500 font-mono text-[11px]">Win11 x64</span>
      </div>

      {/* Window Controls & Theme Switcher */}
      <div className="flex items-center space-x-1">
        <button
          onClick={onToggleTheme}
          title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          className={`p-1.5 rounded hover:bg-zinc-700/20 text-zinc-400 hover:text-zinc-200 transition-colors mr-1`}
        >
          {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
        </button>

        {/* Windows Standard Minimize, Maximize, Close Buttons */}
        <button
          title="Minimize"
          className="w-7 h-6 flex items-center justify-center hover:bg-zinc-700/20 text-zinc-400 hover:text-zinc-200 rounded transition-colors"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
        <button
          title="Maximize"
          className="w-7 h-6 flex items-center justify-center hover:bg-zinc-700/20 text-zinc-400 hover:text-zinc-200 rounded transition-colors"
        >
          <Square className="w-3 h-3" />
        </button>
        <button
          title="Close"
          className="w-7 h-6 flex items-center justify-center hover:bg-red-600 hover:text-white text-zinc-400 rounded transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
