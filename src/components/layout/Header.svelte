<script>
  import { projects, currentProjectId, settings } from '../../lib/stores.js';
  import { put } from '../../lib/db.js';
  import { createProject } from '../../lib/utils.js';

  let showDropdown = false;
  let showNewProject = false;
  let newProjectName = '';

  $: currentProject = $projects.find(p => p.id === $currentProjectId);
  $: navMode = $settings.navMode;

  async function handleCreateProject() {
    if (!newProjectName.trim()) return;

    const project = createProject(newProjectName.trim());
    await put('projects', project);
    projects.update(p => [...p, project]);

    newProjectName = '';
    showNewProject = false;
    showDropdown = false;

    window.location.hash = `#/project/${project.id}`;
  }

  function navigate(path) {
    showDropdown = false;
    window.location.hash = path;
  }

  function handleClickOutside(e) {
    if (showDropdown && !e.target.closest('.dropdown')) {
      showDropdown = false;
    }
  }

  $: currentHash = typeof window !== 'undefined' ? window.location.hash : '';
</script>

<svelte:window on:click={handleClickOutside} />

<header class="header">
  <div class="header-left">
    <a href="#/" class="logo">Productivity</a>

    {#if navMode === 'topnav'}
      <nav class="header-nav">
        <button class="nav-btn" class:active={currentHash === '#/' || currentHash === '#/dashboard' || currentHash === ''} on:click={() => navigate('#/')}>
          Dashboard
        </button>
        <button class="nav-btn" class:active={currentHash === '#/today'} on:click={() => navigate('#/today')}>
          Today
        </button>
        <button class="nav-btn" class:active={currentHash === '#/upcoming'} on:click={() => navigate('#/upcoming')}>
          Upcoming
        </button>

        <div class="dropdown">
          <button class="nav-btn dropdown-trigger" class:active={currentHash.startsWith('#/project')} on:click|stopPropagation={() => showDropdown = !showDropdown}>
            {currentProject ? currentProject.name : 'Projects'}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M6 9l6 6 6-6"/>
            </svg>
          </button>

          {#if showDropdown}
            <div class="dropdown-menu">
              {#each $projects as project}
                <button class="dropdown-item" class:active={$currentProjectId === project.id} on:click={() => navigate(`#/project/${project.id}`)}>
                  {project.name}
                </button>
              {/each}

              {#if $projects.length > 0}
                <div class="dropdown-divider"></div>
              {/if}

              {#if showNewProject}
                <div class="new-project-inline">
                  <input
                    type="text"
                    bind:value={newProjectName}
                    placeholder="Project name"
                    on:keydown={(e) => e.key === 'Enter' && handleCreateProject()}
                    on:click|stopPropagation
                  />
                  <button class="btn-primary btn-sm" on:click|stopPropagation={handleCreateProject}>Add</button>
                </div>
              {:else}
                <button class="dropdown-item new-project-btn" on:click|stopPropagation={() => showNewProject = true}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 5v14M5 12h14"/>
                  </svg>
                  New Project
                </button>
              {/if}
            </div>
          {/if}
        </div>
      </nav>
    {/if}
  </div>

  <div class="header-right">
    <button class="nav-btn icon-btn" class:active={currentHash === '#/timer'} on:click={() => navigate('#/timer')} title="Timer">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/>
        <path d="M12 6v6l4 2"/>
      </svg>
    </button>
    <button class="nav-btn icon-btn" class:active={currentHash === '#/settings'} on:click={() => navigate('#/settings')} title="Settings">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="3"/>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
      </svg>
    </button>
  </div>
</header>

<style>
  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 1rem;
    height: 56px;
    background-color: var(--bg-primary);
    border-bottom: 1px solid var(--border);
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: 2rem;
  }

  .logo {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--accent);
    text-decoration: none;
  }

  .header-nav {
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  .nav-btn {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.5rem 0.75rem;
    border-radius: 6px;
    background: transparent;
    color: var(--text-secondary);
    border: none;
    cursor: pointer;
    font-size: 0.875rem;
    font-weight: 500;
    transition: all 0.15s ease;
  }

  .nav-btn:hover {
    background-color: var(--bg-secondary);
    color: var(--text-primary);
  }

  .nav-btn.active {
    background-color: var(--accent-light);
    color: var(--accent);
  }

  .icon-btn {
    padding: 0.5rem;
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  .dropdown {
    position: relative;
  }

  .dropdown-menu {
    position: absolute;
    top: 100%;
    left: 0;
    margin-top: 0.25rem;
    min-width: 200px;
    background-color: var(--bg-primary);
    border: 1px solid var(--border);
    border-radius: 8px;
    box-shadow: var(--card-shadow);
    z-index: 50;
    padding: 0.25rem;
  }

  .dropdown-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    width: 100%;
    padding: 0.5rem 0.75rem;
    border-radius: 4px;
    background: transparent;
    color: var(--text-primary);
    border: none;
    cursor: pointer;
    font-size: 0.875rem;
    text-align: left;
  }

  .dropdown-item:hover {
    background-color: var(--bg-secondary);
  }

  .dropdown-item.active {
    background-color: var(--accent-light);
    color: var(--accent);
  }

  .dropdown-divider {
    height: 1px;
    background-color: var(--border);
    margin: 0.25rem 0;
  }

  .new-project-btn {
    color: var(--accent);
  }

  .new-project-inline {
    display: flex;
    gap: 0.5rem;
    padding: 0.5rem;
  }

  .new-project-inline input {
    flex: 1;
    padding: 0.375rem 0.5rem;
    font-size: 0.875rem;
  }

  .btn-sm {
    padding: 0.375rem 0.75rem;
    font-size: 0.875rem;
  }

  @media (max-width: 768px) {
    .header-nav {
      display: none;
    }
  }
</style>
