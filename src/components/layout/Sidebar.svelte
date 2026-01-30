<script>
  import { projects } from '../../lib/stores.js';
  import { put } from '../../lib/db.js';
  import { createProject } from '../../lib/utils.js';

  let collapsed = false;
  let showNewProject = false;
  let newProjectName = '';

  async function handleCreateProject() {
    if (!newProjectName.trim()) return;

    const project = createProject(newProjectName.trim());
    await put('projects', project);
    projects.update(p => [...p, project]);

    newProjectName = '';
    showNewProject = false;

    window.location.hash = `#/project/${project.id}`;
  }

  function navigate(path) {
    window.location.hash = path;
  }

  $: currentHash = typeof window !== 'undefined' ? window.location.hash : '';
</script>

<aside class="sidebar" class:collapsed>
  <div class="sidebar-header">
    {#if !collapsed}
      <h1 class="logo">Productivity</h1>
    {/if}
    <button class="btn-icon toggle-btn" on:click={() => collapsed = !collapsed} title={collapsed ? 'Expand' : 'Collapse'}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        {#if collapsed}
          <path d="M13 5l7 7-7 7M5 5l7 7-7 7"/>
        {:else}
          <path d="M11 19l-7-7 7-7M19 19l-7-7 7-7"/>
        {/if}
      </svg>
    </button>
  </div>

  <nav class="sidebar-nav">
    <div class="nav-section">
      <button class="nav-item" class:active={currentHash === '#/' || currentHash === '#/dashboard' || currentHash === ''} on:click={() => navigate('#/')}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="3" width="7" height="7" rx="1"/>
          <rect x="14" y="3" width="7" height="7" rx="1"/>
          <rect x="3" y="14" width="7" height="7" rx="1"/>
          <rect x="14" y="14" width="7" height="7" rx="1"/>
        </svg>
        {#if !collapsed}<span>Dashboard</span>{/if}
      </button>

      <button class="nav-item" class:active={currentHash === '#/today'} on:click={() => navigate('#/today')}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 6v6l4 2"/>
        </svg>
        {#if !collapsed}<span>Today</span>{/if}
      </button>

      <button class="nav-item" class:active={currentHash === '#/upcoming'} on:click={() => navigate('#/upcoming')}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="4" width="18" height="18" rx="2"/>
          <path d="M16 2v4M8 2v4M3 10h18"/>
        </svg>
        {#if !collapsed}<span>Upcoming</span>{/if}
      </button>
    </div>

    <div class="nav-section">
      <div class="section-header">
        {#if !collapsed}
          <span class="section-title">Projects</span>
          <button class="btn-icon" on:click={() => showNewProject = !showNewProject} title="New project">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 5v14M5 12h14"/>
            </svg>
          </button>
        {:else}
          <button class="btn-icon" on:click={() => { collapsed = false; showNewProject = true; }} title="New project">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 5v14M5 12h14"/>
            </svg>
          </button>
        {/if}
      </div>

      {#if showNewProject && !collapsed}
        <div class="new-project-form">
          <input
            type="text"
            bind:value={newProjectName}
            placeholder="Project name"
            on:keydown={(e) => e.key === 'Enter' && handleCreateProject()}
          />
          <div class="new-project-actions">
            <button class="btn-primary btn-sm" on:click={handleCreateProject}>Create</button>
            <button class="btn-ghost btn-sm" on:click={() => { showNewProject = false; newProjectName = ''; }}>Cancel</button>
          </div>
        </div>
      {/if}

      <div class="projects-list">
        {#each $projects as project}
          <button
            class="nav-item project-item"
            class:active={currentHash === `#/project/${project.id}`}
            on:click={() => navigate(`#/project/${project.id}`)}
            title={collapsed ? project.name : undefined}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 4h16v16H4z"/>
              <path d="M4 9h16M9 4v16"/>
            </svg>
            {#if !collapsed}<span class="project-name">{project.name}</span>{/if}
          </button>
        {/each}
      </div>
    </div>

    <div class="nav-section nav-bottom">
      <button class="nav-item" class:active={currentHash === '#/timer'} on:click={() => navigate('#/timer')}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 6v6"/>
          <path d="M16.24 16.24l-4.24-4.24"/>
        </svg>
        {#if !collapsed}<span>Timer</span>{/if}
      </button>

      <button class="nav-item" class:active={currentHash === '#/logs'} on:click={() => navigate('#/logs')}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>
        </svg>
        {#if !collapsed}<span>Time Logs</span>{/if}
      </button>

      <button class="nav-item" class:active={currentHash === '#/analytics'} on:click={() => navigate('#/analytics')}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 20V10M12 20V4M6 20v-6"/>
        </svg>
        {#if !collapsed}<span>Analytics</span>{/if}
      </button>

      <button class="nav-item" class:active={currentHash === '#/settings'} on:click={() => navigate('#/settings')}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="3"/>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
        </svg>
        {#if !collapsed}<span>Settings</span>{/if}
      </button>
    </div>
  </nav>
</aside>

<style>
  .sidebar {
    width: 260px;
    height: 100%;
    background-color: var(--sidebar-bg);
    border-right: 1px solid var(--sidebar-border);
    display: flex;
    flex-direction: column;
    transition: width 0.2s ease;
  }

  .sidebar.collapsed {
    width: 60px;
  }

  .sidebar-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem;
    border-bottom: 1px solid var(--border);
  }

  .logo {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--accent);
  }

  .toggle-btn {
    flex-shrink: 0;
  }

  .sidebar-nav {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    padding: 0.5rem;
  }

  .nav-section {
    margin-bottom: 1rem;
  }

  .nav-bottom {
    margin-top: auto;
    border-top: 1px solid var(--border);
    padding-top: 0.5rem;
  }

  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.5rem;
  }

  .section-title {
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    color: var(--text-tertiary);
    letter-spacing: 0.05em;
  }

  .nav-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    width: 100%;
    padding: 0.625rem 0.75rem;
    border-radius: 6px;
    background: transparent;
    color: var(--text-secondary);
    text-align: left;
    border: none;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .nav-item:hover {
    background-color: var(--bg-secondary);
    color: var(--text-primary);
  }

  .nav-item.active {
    background-color: var(--accent-light);
    color: var(--accent);
  }

  .nav-item svg {
    flex-shrink: 0;
  }

  .project-name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .projects-list {
    max-height: 200px;
    overflow-y: auto;
  }

  .new-project-form {
    padding: 0.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .new-project-form input {
    padding: 0.5rem;
    font-size: 0.875rem;
  }

  .new-project-actions {
    display: flex;
    gap: 0.5rem;
  }

  .btn-sm {
    padding: 0.375rem 0.75rem;
    font-size: 0.875rem;
  }

  .collapsed .section-header {
    justify-content: center;
  }

  .collapsed .nav-item {
    justify-content: center;
    padding: 0.625rem;
  }

  @media (max-width: 768px) {
    .sidebar {
      position: fixed;
      z-index: 50;
      left: 0;
      top: 0;
      transform: translateX(-100%);
    }

    .sidebar:not(.collapsed) {
      transform: translateX(0);
    }
  }
</style>
