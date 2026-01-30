<script>
  import { onMount } from 'svelte';
  import { initDB, getAll } from './lib/db.js';
  import { projects, tasks, tags, settings, currentRoute, currentProjectId } from './lib/stores.js';
  import Sidebar from './components/layout/Sidebar.svelte';
  import Header from './components/layout/Header.svelte';
  import Dashboard from './components/layout/Dashboard.svelte';
  import Board from './components/board/Board.svelte';
  import TodayView from './components/views/TodayView.svelte';
  import UpcomingView from './components/views/UpcomingView.svelte';
  import Timer from './components/timer/Timer.svelte';
  import TimeLogs from './components/timer/TimeLogs.svelte';
  import Analytics from './components/timer/Analytics.svelte';
  import Settings from './components/settings/Settings.svelte';
  import TaskModal from './components/task/TaskModal.svelte';

  let loading = true;
  let settingsData = { theme: 'light', accentColor: '#4a90d9', navMode: 'sidebar' };

  function parseRoute() {
    const hash = window.location.hash || '#/';
    const [path, ...rest] = hash.slice(1).split('/').filter(Boolean);

    if (path === 'project' && rest[0]) {
      return { path: 'project', params: { id: rest[0] } };
    }
    return { path: path || 'dashboard', params: {} };
  }

  function handleRouteChange() {
    const route = parseRoute();
    currentRoute.set(route);

    if (route.path === 'project' && route.params.id) {
      currentProjectId.set(route.params.id);
    } else {
      currentProjectId.set(null);
    }
  }

  onMount(async () => {
    try {
      await initDB();

      const [projectsData, tasksData, tagsData, settingsArr] = await Promise.all([
        getAll('projects'),
        getAll('tasks'),
        getAll('tags'),
        getAll('settings')
      ]);

      projects.set(projectsData || []);
      tasks.set(tasksData || []);
      tags.set(tagsData || []);

      const settingsMap = {};
      (settingsArr || []).forEach(s => settingsMap[s.key] = s.value);
      settingsData = {
        theme: settingsMap.theme || 'light',
        accentColor: settingsMap.accentColor || '#4a90d9',
        navMode: settingsMap.navMode || 'sidebar'
      };
      settings.set(settingsData);

      document.documentElement.setAttribute('data-theme', settingsData.theme);
      if (settingsData.accentColor !== '#4a90d9') {
        document.documentElement.style.setProperty('--custom-accent', settingsData.accentColor);
      }

      handleRouteChange();
      window.addEventListener('hashchange', handleRouteChange);

      loading = false;
    } catch (err) {
      console.error('Failed to initialize app:', err);
      loading = false;
    }
  });

  settings.subscribe(s => {
    if (s) {
      settingsData = s;
      document.documentElement.setAttribute('data-theme', s.theme);
      if (s.accentColor && s.accentColor !== '#4a90d9') {
        document.documentElement.style.setProperty('--custom-accent', s.accentColor);
      } else {
        document.documentElement.style.removeProperty('--custom-accent');
      }
    }
  });

  $: routePath = $currentRoute.path;
  $: navMode = settingsData.navMode;
</script>

{#if loading}
  <div class="loading">
    <div class="loading-spinner"></div>
    <p>Loading...</p>
  </div>
{:else}
  <div class="app-container" class:sidebar-mode={navMode === 'sidebar'}>
    {#if navMode === 'sidebar'}
      <Sidebar />
    {:else}
      <Header />
    {/if}

    <main class="main-content">
      {#if routePath === 'dashboard' || routePath === ''}
        <Dashboard />
      {:else if routePath === 'project'}
        <Board />
      {:else if routePath === 'today'}
        <TodayView />
      {:else if routePath === 'upcoming'}
        <UpcomingView />
      {:else if routePath === 'timer'}
        <Timer />
      {:else if routePath === 'logs'}
        <TimeLogs />
      {:else if routePath === 'analytics'}
        <Analytics />
      {:else if routePath === 'settings'}
        <Settings />
      {:else}
        <Dashboard />
      {/if}
    </main>
  </div>

  <TaskModal />
{/if}

<style>
  .loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
    gap: 1rem;
    color: var(--text-secondary);
  }

  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 3px solid var(--border);
    border-top-color: var(--accent);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .app-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
  }

  .app-container.sidebar-mode {
    flex-direction: row;
  }

  .main-content {
    flex: 1;
    overflow: auto;
    background-color: var(--bg-secondary);
  }

  .sidebar-mode .main-content {
    height: 100%;
  }
</style>
