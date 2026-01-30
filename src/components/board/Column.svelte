<script>
  import { tasks, projects, currentProject, editingTask, showTaskModal } from '../../lib/stores.js';
  import { put, remove } from '../../lib/db.js';
  import { createTask } from '../../lib/utils.js';
  import TaskCard from './TaskCard.svelte';

  export let column;
  export let projectId;

  let editingName = false;
  let columnName = column.name;
  let showAddTask = false;
  let newTaskTitle = '';
  let dragOverColumn = false;

  $: columnTasks = $tasks
    .filter(t => t.projectId === projectId && t.columnId === column.id)
    .sort((a, b) => a.order - b.order);

  async function saveColumnName() {
    if (!columnName.trim() || !$currentProject) return;

    const updatedColumns = $currentProject.columns.map(c =>
      c.id === column.id ? { ...c, name: columnName.trim() } : c
    );

    const updated = {
      ...$currentProject,
      columns: updatedColumns,
      updatedAt: new Date().toISOString()
    };

    await put('projects', updated);
    projects.update(p => p.map(proj => proj.id === updated.id ? updated : proj));
    editingName = false;
  }

  async function deleteColumn() {
    if (!$currentProject) return;
    if (columnTasks.length > 0 && !confirm(`Delete column "${column.name}" and all its tasks?`)) return;

    // Delete all tasks in this column
    for (const task of columnTasks) {
      await remove('tasks', task.id);
    }
    tasks.update(t => t.filter(task => task.columnId !== column.id));

    // Remove column from project
    const updatedColumns = $currentProject.columns
      .filter(c => c.id !== column.id)
      .map((c, i) => ({ ...c, order: i }));

    const updated = {
      ...$currentProject,
      columns: updatedColumns,
      updatedAt: new Date().toISOString()
    };

    await put('projects', updated);
    projects.update(p => p.map(proj => proj.id === updated.id ? updated : proj));
  }

  async function addTask() {
    if (!newTaskTitle.trim()) return;

    const task = createTask(projectId, column.id, newTaskTitle.trim());
    await put('tasks', task);
    tasks.update(t => [...t, task]);

    newTaskTitle = '';
    showAddTask = false;
  }

  function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    dragOverColumn = true;
  }

  function handleDragLeave(e) {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      dragOverColumn = false;
    }
  }

  async function handleDrop(e) {
    e.preventDefault();
    dragOverColumn = false;

    const taskId = e.dataTransfer.getData('text/plain');
    if (!taskId) return;

    const task = $tasks.find(t => t.id === taskId);
    if (!task || task.columnId === column.id) return;

    const updated = {
      ...task,
      previousColumnId: task.columnId,
      columnId: column.id,
      order: Date.now(),
      updatedAt: new Date().toISOString()
    };

    await put('tasks', updated);
    tasks.update(t => t.map(tsk => tsk.id === updated.id ? updated : tsk));
  }
</script>

<div
  class="column"
  class:drag-over={dragOverColumn}
  on:dragover={handleDragOver}
  on:dragleave={handleDragLeave}
  on:drop={handleDrop}
>
  <div class="column-header">
    {#if editingName}
      <input
        type="text"
        bind:value={columnName}
        on:blur={saveColumnName}
        on:keydown={(e) => e.key === 'Enter' && saveColumnName()}
        class="column-name-input"
        autofocus
      />
    {:else}
      <div class="column-title" on:click={() => { editingName = true; columnName = column.name; }}>
        <h3>{column.name}</h3>
        <span class="task-count">{columnTasks.length}</span>
      </div>
    {/if}

    <div class="column-actions">
      <button class="btn-icon" on:click={deleteColumn} title="Delete column">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
        </svg>
      </button>
    </div>
  </div>

  <div class="column-tasks">
    {#each columnTasks as task (task.id)}
      <TaskCard {task} />
    {/each}

    {#if showAddTask}
      <div class="add-task-form">
        <input
          type="text"
          bind:value={newTaskTitle}
          placeholder="Task title"
          on:keydown={(e) => e.key === 'Enter' && addTask()}
          autofocus
        />
        <div class="add-task-actions">
          <button class="btn-primary btn-sm" on:click={addTask}>Add</button>
          <button class="btn-ghost btn-sm" on:click={() => { showAddTask = false; newTaskTitle = ''; }}>Cancel</button>
        </div>
      </div>
    {:else}
      <button class="add-task-btn" on:click={() => showAddTask = true}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 5v14M5 12h14"/>
        </svg>
        Add task
      </button>
    {/if}
  </div>
</div>

<style>
  .column {
    background-color: var(--bg-secondary);
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    max-height: calc(100vh - 180px);
    transition: background-color 0.15s ease;
  }

  .column.drag-over {
    background-color: var(--accent-light);
  }

  .column-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem 1rem;
    border-bottom: 1px solid var(--border);
  }

  .column-title {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
  }

  .column-title h3 {
    font-size: 0.875rem;
    font-weight: 600;
  }

  .column-title:hover h3 {
    color: var(--accent);
  }

  .task-count {
    font-size: 0.75rem;
    color: var(--text-tertiary);
    background-color: var(--bg-tertiary);
    padding: 0.125rem 0.5rem;
    border-radius: 9999px;
  }

  .column-name-input {
    font-size: 0.875rem;
    font-weight: 600;
    padding: 0.25rem 0.5rem;
    width: 100%;
  }

  .column-actions {
    display: flex;
    gap: 0.25rem;
    opacity: 0;
    transition: opacity 0.15s ease;
  }

  .column:hover .column-actions {
    opacity: 1;
  }

  .column-tasks {
    flex: 1;
    overflow-y: auto;
    padding: 0.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .add-task-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    width: 100%;
    padding: 0.5rem;
    background: transparent;
    border: none;
    border-radius: 4px;
    color: var(--text-secondary);
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .add-task-btn:hover {
    background-color: var(--bg-tertiary);
    color: var(--text-primary);
  }

  .add-task-form {
    background-color: var(--bg-primary);
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 0.5rem;
  }

  .add-task-form input {
    margin-bottom: 0.5rem;
    font-size: 0.875rem;
  }

  .add-task-actions {
    display: flex;
    gap: 0.5rem;
  }

  .btn-sm {
    padding: 0.25rem 0.5rem;
    font-size: 0.8125rem;
  }
</style>
