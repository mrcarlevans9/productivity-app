<script>
  import { projects, tasks, todayTasks, overdueTasks } from '../../lib/stores.js';
  import { put } from '../../lib/db.js';
  import { createProject } from '../../lib/utils.js';

  let showNewProject = false;
  let newProjectName = '';
  let projectType = 'quick';
  let customColumns = [''];

  $: taskCounts = $projects.map(p => {
    const projectTasks = $tasks.filter(t => t.projectId === p.id);
    return {
      total: projectTasks.length,
      completed: projectTasks.filter(t => t.completed).length
    };
  });

  async function handleCreateProject() {
    if (!newProjectName.trim()) return;

    let columns = null;
    if (projectType === 'custom') {
      columns = customColumns
        .filter(c => c.trim())
        .map((name, i) => ({ id: crypto.randomUUID(), name: name.trim(), order: i }));
      if (columns.length === 0) {
        columns = null;
      }
    }

    const project = createProject(newProjectName.trim(), columns);
    await put('projects', project);
    projects.update(p => [...p, project]);

    newProjectName = '';
    customColumns = [''];
    projectType = 'quick';
    showNewProject = false;

    window.location.hash = `#/project/${project.id}`;
  }

  function addColumn() {
    customColumns = [...customColumns, ''];
  }

  function removeColumn(index) {
    customColumns = customColumns.filter((_, i) => i !== index);
  }

  function navigate(path) {
    window.location.hash = path;
  }
</script>

<div class="dashboard">
  <div class="dashboard-header">
    <h1>Dashboard</h1>
  </div>

  <div class="stats-row">
    <div class="stat-card">
      <div class="stat-icon today">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 6v6l4 2"/>
        </svg>
      </div>
      <div class="stat-content">
        <span class="stat-value">{$todayTasks.length}</span>
        <span class="stat-label">Due Today</span>
      </div>
    </div>

    <div class="stat-card" class:has-overdue={$overdueTasks.length > 0}>
      <div class="stat-icon overdue">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 8v4M12 16h.01"/>
        </svg>
      </div>
      <div class="stat-content">
        <span class="stat-value">{$overdueTasks.length}</span>
        <span class="stat-label">Overdue</span>
      </div>
    </div>

    <div class="stat-card">
      <div class="stat-icon projects">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M4 4h16v16H4z"/>
          <path d="M4 9h16M9 4v16"/>
        </svg>
      </div>
      <div class="stat-content">
        <span class="stat-value">{$projects.length}</span>
        <span class="stat-label">Projects</span>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-header">
      <h2>Projects</h2>
      <button class="btn-primary" on:click={() => showNewProject = true}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 5v14M5 12h14"/>
        </svg>
        New Project
      </button>
    </div>

    {#if showNewProject}
      <div class="new-project-card card">
        <h3>Create New Project</h3>

        <div class="form-group">
          <label for="projectName">Project Name</label>
          <input
            id="projectName"
            type="text"
            bind:value={newProjectName}
            placeholder="Enter project name"
          />
        </div>

        <div class="form-group">
          <label>Setup Type</label>
          <div class="setup-options">
            <button
              type="button"
              class="setup-option"
              class:selected={projectType === 'quick'}
              on:click={() => projectType = 'quick'}
            >
              <div class="option-radio" class:checked={projectType === 'quick'}>
                {#if projectType === 'quick'}
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                    <path d="M20 6L9 17l-5-5"/>
                  </svg>
                {/if}
              </div>
              <div class="option-content">
                <span class="option-title">Quick Start</span>
                <span class="option-desc">To Do, In Progress, Done</span>
              </div>
            </button>
            <button
              type="button"
              class="setup-option"
              class:selected={projectType === 'custom'}
              on:click={() => projectType = 'custom'}
            >
              <div class="option-radio" class:checked={projectType === 'custom'}>
                {#if projectType === 'custom'}
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                    <path d="M20 6L9 17l-5-5"/>
                  </svg>
                {/if}
              </div>
              <div class="option-content">
                <span class="option-title">Custom Columns</span>
                <span class="option-desc">Define your own workflow</span>
              </div>
            </button>
          </div>
        </div>

        {#if projectType === 'custom'}
          <div class="form-group">
            <label>Columns</label>
            {#each customColumns as column, i}
              <div class="column-input">
                <input
                  type="text"
                  bind:value={customColumns[i]}
                  placeholder="Column name"
                />
                {#if customColumns.length > 1}
                  <button class="btn-icon" on:click={() => removeColumn(i)}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M18 6L6 18M6 6l12 12"/>
                    </svg>
                  </button>
                {/if}
              </div>
            {/each}
            <button class="btn-ghost add-column-btn" on:click={addColumn}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 5v14M5 12h14"/>
              </svg>
              Add Column
            </button>
          </div>
        {/if}

        <div class="form-actions">
          <button class="btn-secondary" on:click={() => { showNewProject = false; newProjectName = ''; customColumns = ['']; projectType = 'quick'; }}>
            Cancel
          </button>
          <button class="btn-primary" on:click={handleCreateProject} disabled={!newProjectName.trim()}>
            Create Project
          </button>
        </div>
      </div>
    {/if}

    <div class="projects-grid">
      {#each $projects as project, i}
        <button class="project-card card" on:click={() => navigate(`#/project/${project.id}`)}>
          <h3>{project.name}</h3>
          <div class="project-meta">
            <span>{project.columns.length} columns</span>
            <span class="dot"></span>
            <span>{taskCounts[i]?.completed || 0}/{taskCounts[i]?.total || 0} tasks</span>
          </div>
          <div class="project-columns">
            {#each project.columns.slice(0, 4) as column}
              <span class="column-badge">{column.name}</span>
            {/each}
            {#if project.columns.length > 4}
              <span class="column-badge more">+{project.columns.length - 4}</span>
            {/if}
          </div>
        </button>
      {:else}
        <div class="empty-state">
          <h3>No projects yet</h3>
          <p>Create your first project to get started</p>
        </div>
      {/each}
    </div>
  </div>
</div>

<style>
  .dashboard {
    padding: 1.5rem;
    max-width: 1200px;
    margin: 0 auto;
  }

  .dashboard-header {
    margin-bottom: 1.5rem;
  }

  .dashboard-header h1 {
    font-size: 1.5rem;
  }

  .stats-row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    margin-bottom: 2rem;
  }

  .stat-card {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem 1.25rem;
    background-color: var(--bg-primary);
    border: 1px solid var(--border);
    border-radius: 8px;
  }

  .stat-card.has-overdue {
    border-color: var(--danger);
    background-color: var(--overdue-bg);
  }

  .stat-icon {
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
  }

  .stat-icon.today {
    background-color: var(--today-bg);
    color: var(--warning);
  }

  .stat-icon.overdue {
    background-color: var(--overdue-bg);
    color: var(--danger);
  }

  .stat-icon.projects {
    background-color: var(--accent-light);
    color: var(--accent);
  }

  .stat-content {
    display: flex;
    flex-direction: column;
  }

  .stat-value {
    font-size: 1.5rem;
    font-weight: 700;
    line-height: 1.2;
  }

  .stat-label {
    font-size: 0.875rem;
    color: var(--text-secondary);
  }

  .section {
    margin-bottom: 2rem;
  }

  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1rem;
  }

  .section-header h2 {
    font-size: 1.125rem;
  }

  .projects-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1rem;
  }

  .project-card {
    text-align: left;
    cursor: pointer;
    transition: box-shadow 0.15s ease, transform 0.15s ease;
  }

  .project-card:hover {
    box-shadow: var(--card-shadow-hover);
    transform: translateY(-2px);
  }

  .project-card h3 {
    font-size: 1rem;
    margin-bottom: 0.5rem;
  }

  .project-meta {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.75rem;
    color: var(--text-secondary);
    margin-bottom: 0.75rem;
  }

  .dot {
    width: 3px;
    height: 3px;
    border-radius: 50%;
    background-color: var(--text-tertiary);
  }

  .project-columns {
    display: flex;
    flex-wrap: wrap;
    gap: 0.375rem;
  }

  .column-badge {
    font-size: 0.6875rem;
    padding: 0.125rem 0.5rem;
    background-color: var(--bg-secondary);
    border-radius: 4px;
    color: var(--text-secondary);
  }

  .column-badge.more {
    background-color: var(--accent-light);
    color: var(--accent);
  }

  .new-project-card {
    margin-bottom: 1rem;
    max-width: 500px;
  }

  .new-project-card h3 {
    margin-bottom: 1rem;
  }

  .setup-options {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .setup-option {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    width: 100%;
    padding: 0.875rem 1rem;
    background-color: var(--bg-secondary);
    border: 2px solid var(--border);
    border-radius: 8px;
    cursor: pointer;
    text-align: left;
    transition: all 0.15s ease;
  }

  .setup-option:hover {
    border-color: var(--accent);
    background-color: var(--accent-light);
  }

  .setup-option.selected {
    border-color: var(--accent);
    background-color: var(--accent-light);
  }

  .option-radio {
    width: 22px;
    height: 22px;
    border: 2px solid var(--border);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: all 0.15s ease;
  }

  .option-radio.checked {
    background-color: var(--accent);
    border-color: var(--accent);
    color: white;
  }

  .option-content {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
  }

  .option-title {
    font-weight: 500;
    color: var(--text-primary);
  }

  .option-desc {
    font-size: 0.75rem;
    color: var(--text-secondary);
  }

  .column-input {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
  }

  .add-column-btn {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    font-size: 0.875rem;
    padding: 0.5rem;
  }

  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
    margin-top: 1rem;
  }

  .empty-state {
    grid-column: 1 / -1;
    text-align: center;
    padding: 3rem;
    color: var(--text-secondary);
  }

  @media (max-width: 640px) {
    .dashboard {
      padding: 1rem;
    }

    .stats-row {
      grid-template-columns: 1fr;
    }
  }
</style>
