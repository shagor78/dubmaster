import React from 'react';
import {
  LayoutDashboard,
  PlusCircle,
  FolderKanban,
  Subtitles,
  Volume2,
  ListOrdered,
  Settings,
  HelpCircle,
  HardDrive,
  Cpu,
  Layers,
} from 'lucide-react';

export type NavTab =
  | 'dashboard'
  | 'new_project'
  | 'projects'
  | 'subtitle_editor'
  | 'audio_voices'
  | 'queue'
  | 'settings'
  | 'help';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  theme: 'dark' | 'light';
  activeProjectsCount: number;
  diskSpace: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  theme,
  activeProjectsCount,
  diskSpace,
}) => {
  const navItems: Array<{ id: NavTab; label: string; icon: React.ReactNode; badge?: string | number }> = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'new_project', label: 'New Dubbing Project', icon: <PlusCircle className="w-4 h-4 text-blue-500" /> },
    { id: 'projects', label: 'Projects', icon: <FolderKanban className="w-4 h-4" />, badge: activeProjectsCount },
    { id: 'subtitle_editor', label: 'Subtitle Editor', icon: <Subtitles className="w-4 h-4" /> },
    { id: 'audio_voices', label: 'Audio and Voices', icon: <Volume2 className="w-4 h-4" /> },
    { id: 'queue', label: 'Processing Queue', icon: <ListOrdered className="w-4 h-4" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
    { id: 'help', label: 'Help and About', icon: <HelpCircle className="w-4 h-4" /> },
  ];

  return (
    <aside
      className={`w-64 flex flex-col justify-between border-r select-none transition-colors ${
        theme === 'dark' ? 'bg-[#1e1e24] border-zinc-800' : 'bg-[#fafafa] border-zinc-200'
      }`}
    >
      <div>
        {/* Workspace Brand Header */}
        <div className="p-4 border-b border-inherit">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-sm leading-tight tracking-tight">DubMaster AI</h2>
              <p className="text-[11px] text-zinc-500">v1.0 Pro Studio Edition</p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-2 space-y-1">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm font-semibold'
                    : theme === 'dark'
                    ? 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60'
                    : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/70'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <span className={isActive ? 'text-white' : ''}>{item.icon}</span>
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={`px-1.5 py-0.5 text-[10px] rounded-full font-bold ${
                      isActive
                        ? 'bg-blue-700 text-white'
                        : theme === 'dark'
                        ? 'bg-zinc-800 text-zinc-400'
                        : 'bg-zinc-200 text-zinc-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Hardware & System Resource Strip */}
      <div className="p-3 m-2 rounded-xl bg-zinc-900/40 border border-zinc-800/80 text-[11px] space-y-2">
        <div className="flex items-center justify-between text-zinc-400">
          <div className="flex items-center space-x-1.5">
            <Cpu className="w-3.5 h-3.5 text-blue-400" />
            <span>Hardware Engine</span>
          </div>
          <span className="text-emerald-400 font-mono font-medium">CPU & AVX2</span>
        </div>
        <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
          <div className="bg-blue-500 h-full w-[28%]" />
        </div>

        <div className="flex items-center justify-between text-zinc-400 pt-1 border-t border-zinc-800/60">
          <div className="flex items-center space-x-1.5">
            <HardDrive className="w-3.5 h-3.5 text-indigo-400" />
            <span>Temp Storage</span>
          </div>
          <span className="font-mono text-zinc-300">{diskSpace || '24.5 GB free'}</span>
        </div>
      </div>
    </aside>
  );
};
