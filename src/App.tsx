import React, { useState, useEffect } from 'react';
import { TitleBar } from './components/TitleBar';
import { Sidebar, NavTab } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { NewProjectView } from './components/NewProjectView';
import { ProjectsView } from './components/ProjectsView';
import { TranscriptEditorView } from './components/TranscriptEditorView';
import { AudioVoicesView } from './components/AudioVoicesView';
import { ProcessingQueueView } from './components/ProcessingQueueView';
import { SettingsView } from './components/SettingsView';
import { HelpView } from './components/HelpView';
import { Project, SystemStatus, SampleVideo } from './types';

export default function App() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [samples, setSamples] = useState<SampleVideo[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fetch initial data from server API
  const refreshProjects = async () => {
    try {
      const res = await fetch('/api/projects');
      const data = await res.json();
      if (Array.isArray(data)) {
        setProjects(data);
        if (!activeProject && data.length > 0) {
          setActiveProject(data[0]);
        }
      }
    } catch (e) {
      console.warn('Failed to load projects:', e);
    }
  };

  const refreshSystemStatus = async () => {
    try {
      const res = await fetch('/api/system/status');
      const data = await res.json();
      setSystemStatus(data);
    } catch (e) {
      console.warn('Failed to load system status:', e);
    }
  };

  const refreshSamples = async () => {
    try {
      const res = await fetch('/api/samples');
      const data = await res.json();
      if (Array.isArray(data)) {
        setSamples(data);
      }
    } catch (e) {
      console.warn('Failed to load samples:', e);
    }
  };

  useEffect(() => {
    Promise.all([refreshProjects(), refreshSystemStatus(), refreshSamples()]).finally(() => {
      setIsLoading(false);
    });
  }, []);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleOpenProject = (project: Project) => {
    setActiveProject(project);
    if (project.status === 'processing') {
      setCurrentTab('queue');
    } else {
      setCurrentTab('subtitle_editor');
    }
  };

  const handleDuplicateProject = async (id: string) => {
    try {
      const res = await fetch(`/api/projects/duplicate/${id}`, { method: 'POST' });
      const duplicated = await res.json();
      if (duplicated && duplicated.id) {
        setProjects((prev) => [duplicated, ...prev]);
      }
    } catch (e) {
      console.warn('Duplicate error:', e);
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this dubbing project?')) return;
    try {
      await fetch(`/api/projects/${id}`, { method: 'DELETE' });
      setProjects((prev) => prev.filter((p) => p.id !== id));
      if (activeProject?.id === id) {
        setActiveProject(projects.find((p) => p.id !== id) || null);
      }
    } catch (e) {
      console.warn('Delete error:', e);
    }
  };

  const handleQuickStart = (sampleId: string) => {
    const sample = samples.find((s) => s.id === sampleId);
    if (sample) {
      setCurrentTab('new_project');
    }
  };

  // Launch Dubbing Pipeline from NewProjectView
  const handleStartPipeline = async (projectConfig: Partial<Project>) => {
    try {
      // 1. First trigger transcription to get initial segments
      const transcribeRes = await fetch('/api/pipeline/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoPath: projectConfig.videoUrl,
          filename: projectConfig.originalFilename,
          sourceLanguage: projectConfig.sourceLanguage,
          duration: projectConfig.duration,
        }),
      });
      const transcribeData = await transcribeRes.json();
      const rawSegments = transcribeData.segments || [];

      // 2. Trigger translation to target language
      const translateRes = await fetch('/api/pipeline/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          segments: rawSegments,
          sourceLanguage: projectConfig.sourceLanguage,
          targetLanguage: projectConfig.targetLanguage,
        }),
      });
      const translateData = await translateRes.json();
      const translatedSegments = translateData.segments || rawSegments;

      // 3. Save project
      const createRes = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...projectConfig,
          segments: translatedSegments,
          progress: 35,
          currentStage: 'Speech Recognition Completed',
          status: 'processing',
        }),
      });
      const newProj = await createRes.json();

      setProjects((prev) => [newProj, ...prev]);
      setActiveProject(newProj);
      setCurrentTab('queue');
    } catch (e) {
      console.error('Failed to launch pipeline:', e);
    }
  };

  const handleUpdateProject = (updated: Partial<Project>) => {
    if (!activeProject) return;
    const merged = { ...activeProject, ...updated };
    setActiveProject(merged);
    setProjects((prev) => prev.map((p) => (p.id === merged.id ? merged : p)));
  };

  const handleCancelPipeline = () => {
    if (activeProject) {
      handleUpdateProject({
        status: 'draft',
        progress: 0,
        currentStage: 'Cancelled by user',
      });
    }
  };

  return (
    <div
      className={`h-screen w-screen flex flex-col overflow-hidden transition-colors ${
        theme === 'dark' ? 'bg-[#121214] text-zinc-100' : 'bg-[#f4f4f5] text-zinc-900'
      }`}
    >
      {/* Windows 11 Title Bar */}
      <TitleBar
        projectName={activeProject?.name}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        ffmpegInstalled={systemStatus?.ffmpeg.installed ?? true}
        apiKeyActive={systemStatus?.hasGeminiApiKey ?? true}
      />

      {/* Main Workspace Frame */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar Navigation */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          theme={theme}
          activeProjectsCount={projects.length}
          diskSpace={systemStatus?.diskSpace || '24.5 GB free'}
        />

        {/* View Switcher Container */}
        <main
          className={`flex-1 overflow-y-auto relative transition-colors ${
            theme === 'dark' ? 'bg-[#121214]' : 'bg-[#f4f4f5]'
          }`}
        >
          {currentTab === 'dashboard' && (
            <DashboardView
              projects={projects}
              systemStatus={systemStatus}
              onCreateNew={() => setCurrentTab('new_project')}
              onOpenProject={handleOpenProject}
              onDuplicateProject={handleDuplicateProject}
              onDeleteProject={handleDeleteProject}
              onQuickStart={handleQuickStart}
              theme={theme}
            />
          )}

          {currentTab === 'new_project' && (
            <NewProjectView
              samples={samples}
              systemStatus={systemStatus}
              onStartPipeline={handleStartPipeline}
              theme={theme}
            />
          )}

          {currentTab === 'projects' && (
            <ProjectsView
              projects={projects}
              onOpenProject={handleOpenProject}
              onCreateNew={() => setCurrentTab('new_project')}
              onDuplicateProject={handleDuplicateProject}
              onDeleteProject={handleDeleteProject}
              theme={theme}
            />
          )}

          {currentTab === 'subtitle_editor' && (
            <TranscriptEditorView
              project={activeProject}
              onUpdateProject={handleUpdateProject}
              theme={theme}
            />
          )}

          {currentTab === 'audio_voices' && (
            <AudioVoicesView
              project={activeProject}
              onUpdateProject={handleUpdateProject}
              theme={theme}
            />
          )}

          {currentTab === 'queue' && (
            <ProcessingQueueView
              project={activeProject}
              onUpdateProject={handleUpdateProject}
              onCancelPipeline={handleCancelPipeline}
              theme={theme}
            />
          )}

          {currentTab === 'settings' && (
            <SettingsView systemStatus={systemStatus} theme={theme} />
          )}

          {currentTab === 'help' && <HelpView theme={theme} />}
        </main>
      </div>
    </div>
  );
}
