<script>
  import { currentProject, currentProjectTasks, projects, tasks, editingTask, showTaskModal } from '../../lib/stores.js';
  import { put, remove } from '../../lib/db.js';
  import { generateId } from '../../lib/utils.js';
  import Column from './Column.svelte';

  let editingName = false;
  let projectName = '';
  let showAddColumn = false;
  let newColumnName = '';
  let draggedColumn = null;

  $: if ($currentProject) {
    projectName = $currentProject.name;
  }

  $: columns = $currentProject?.columns?.sort((a, b) => a.order - b.order) || [];

  async function saveProjectName() {
    if (!projectName.trim() || !$currentProject) return;

    const updated = {
      ...$currentProject,
      name: projectName.trim(),
      updatedAt: new Date().toISOString()
    };

    await put('projects', updated);
    projects.update(p => p.map(proj => proj.id === updated.id ? updated : proj));
    editingName = false;
  }

  async function addColumn() {
    if (!newColumnName.trim() || !$currentProject) return;

    const newColumn = {
      id: generateId(),
      name: newColumnName.trim(),
      order: columns.length
    };

    const updated = {
      ...$currentProject,
      columns: [...$currentProject.columns, newColumn],
      updatedAt: new Date().toISOString()
    };

    await put('projects', updated);
    projects.update(p => p.map(proj => proj.id === updated.id ? updated : proj));

    newColumnName = '';
    showAddColumn = false;
  }

  async function deleteProject() {
    if (!$currentProject) return;
    if (!confirm(`Delete "${$currentProject.name}" and all its tasks?`)) return;

    // Delete all tasks in this project
    const projectTasks = $currentProjectTasks;
    for (const task of projectTasks) {
      await remove('tasks', task.id);
    }
    tasks.update(t => t.filter(task => task.projectId !== $currentProject.id));

    // Delete project
    await remove('projects', $currentProject.id);
    projects.update(p => p.filter(proj => proj.id !== $currentProject.id));

    window.location.hash = '#/';
  }

  function handleColumnDragStart(e, column) {
    draggedColumn = column;
    e.dataTransfer.effectAllowed = 'move';
  }

  function handleColumnDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }

  async function handleColumnDrop(e, targetColumn) {
    e.preventDefault();
    if (!draggedColumn || draggedColumn.id === targetColumn.id || !$currentProject) return;

    const cols = [...$currentProject.columns];
    const draggedIndex = cols.findIndex(c => c.id === draggedColumn.id);
    const targetIndex = cols.findIndex(c => c.id === targetColumn.id);

    cols.splice(draggedIndex, 1);
    cols.splice(targetIndex, 0, draggedColumn);

    // Update order
    const updated = {
      ...$currentProject,
      columns: cols.map((c, i) => ({ ...c, order: i })),
      updatedAt: new Date().toISOString()
    };

    await put('projects', updated);
    projects.update(p => p.map(proj => proj.id === updated.id ? updated : proj));
    draggedColumn = null;
  }
</script>

{#if $currentProject}
  <div class="board-container">
    <div class="board-header">
      <div class="board-title">
        {#if editingName}
          <input
            type="text"
            bind:value={projectName}
            on:blur={saveProjectName}
            on:keydown={(e) => e.key === 'Enter' && saveProjectName()}
            class="title-input"
            autofocus
          />
        {:else}
          <h1 on:click={() => editingName = true}>{$currentProject.name}</h1>
          <button class="btn-icon" on:click={() => editingName = true} title="Rename">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
        {/if}
      </div>
      <button class="btn-ghost btn-danger-text" on:click={deleteProject}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
        </svg>
        Delete
      </button>
    </div>

    <div class="board">
      {#each columns as column (column.id)}
        <div
          class="column-wrapper"
          draggable="true"
          on:dragstart={(e) => handleColumnDragStart(e, column)}
          on:dragover={handleColumnDragOver}
          on:drop={(e) => handleColumnDrop(e, column)}
        >
          <Column {column} projectId={$currentProject.id} />
        </div>
      {/each}

      <div class="add-column">
        {#if showAddColumn}
          <div class="add-column-form">
            <input
              type="text"
              bind:value={newColumnName}
              placeholder="Column name"
              on:keydown={(e) => e.key === 'Enter' && addColumn()}
              autofocus
            />
            <div class="add-column-actions">
              <button class="btn-primary btn-sm" on:click={addColumn}>Add</button>
              <button class="btn-ghost btn-sm" on:click={() => { showAddColumn = false; newColumnName = ''; }}>Cancel</button>
            </div>
          </div>
        {:else}
          <button class="add-column-btn" on:click={() => showAddColumn = true}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            Add Column
          </button>
        {/if}
      </div>
    </div>
  </div>
{:else}
  <div class="empty-state">
    <h3>Project not found</h3>
    <p>This project may have been deleted</p>
    <a href="#/">Go to Dashboard</a>
  </div>
{/if}

<style>
  .board-container {
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  .board-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 1.5rem;
    background-color: var(--bg-primary);
    border-bottom: 1px solid var(--border);
  }

  .board-title {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .board-title h1 {
    font-size: 1.25rem;
    cursor: pointer;
  }

  .board-title h1:hover {
    color: var(--accent);
  }

  .title-input {
    font-size: 1.25rem;
    font-weight: 600;
    padding: 0.25rem 0.5rem;
    width: 300px;
  }

  .btn-danger-text {
    color: var(--danger);
  }

  .btn-danger-text:hover {
    background-color: var(--overdue-bg);
  }

  .board {
    flex: 1;
    display: flex;
    gap: 1rem;
    padding: 1rem;
    overflow-x: auto;
    align-items: flex-start;
  }

  .column-wrapper {
    flex-shrink: 0;
    width: 300px;
  }

  .add-column {
    flex-shrink: 0;
    width: 280px;
  }

  .add-column-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    width: 100%;
    padding: 1rem;
    background-color: var(--bg-primary);
    border: 2px dashed var(--border);
    border-radius: 8px;
    color: var(--text-secondary);
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .add-column-btn:hover {
    border-color: var(--accent);
    color: var(--accent);
    background-color: var(--accent-light);
  }

  .add-column-form {
    background-color: var(--bg-primary);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 0.75rem;
  }

  .add-column-form input {
    margin-bottom: 0.5rem;
  }

  .add-column-actions {
    display: flex;
    gap: 0.5rem;
  }

  .btn-sm {
    padding: 0.375rem 0.75rem;
    font-size: 0.875rem;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    gap: 0.5rem;
    color: var(--text-secondary);
  }

  .empty-state a {
    margin-top: 0.5rem;
  }

  @media (max-width: 640px) {
    .board-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.5rem;
    }

    .column-wrapper {
      width: 280px;
    }
  }
</style>
