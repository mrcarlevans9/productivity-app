<script>
  import { editingTask, showTaskModal, tasks, tags, projects } from '../../lib/stores.js';
  import { put, remove } from '../../lib/db.js';
  import { generateId } from '../../lib/utils.js';
  import SubtaskList from './SubtaskList.svelte';
  import TagPicker from './TagPicker.svelte';

  let title = '';
  let description = '';
  let subtasks = [];
  let selectedTags = [];
  let dueDate = '';
  let priority = null;
  let recurringEnabled = false;
  let recurringInterval = 1;
  let recurringUnit = 'day';

  $: if ($editingTask) {
    title = $editingTask.title || '';
    description = $editingTask.description || '';
    subtasks = [...($editingTask.subtasks || [])];
    selectedTags = [...($editingTask.tags || [])];
    dueDate = $editingTask.dueDate || '';
    priority = $editingTask.priority;
    recurringEnabled = $editingTask.recurring?.enabled || false;
    recurringInterval = $editingTask.recurring?.interval || 1;
    recurringUnit = $editingTask.recurring?.unit || 'day';
  }

  $: project = $projects.find(p => p.id === $editingTask?.projectId);

  function close() {
    showTaskModal.set(false);
    editingTask.set(null);
  }

  async function save() {
    if (!title.trim() || !$editingTask) return;

    const updated = {
      ...$editingTask,
      title: title.trim(),
      description: description.trim(),
      subtasks,
      tags: selectedTags,
      dueDate: dueDate || null,
      priority,
      recurring: recurringEnabled ? { enabled: true, interval: recurringInterval, unit: recurringUnit } : null,
      updatedAt: new Date().toISOString()
    };

    await put('tasks', updated);
    tasks.update(t => t.map(task => task.id === updated.id ? updated : task));
    close();
  }

  async function deleteTask() {
    if (!$editingTask) return;
    if (!confirm('Delete this task?')) return;

    await remove('tasks', $editingTask.id);
    tasks.update(t => t.filter(task => task.id !== $editingTask.id));
    close();
  }

  function handleKeydown(e) {
    if (e.key === 'Escape') close();
    if (e.key === 'Enter' && e.ctrlKey) save();
  }

  function handleBackdropClick(e) {
    if (e.target === e.currentTarget) close();
  }
</script>

<svelte:window on:keydown={handleKeydown} />

{#if $showTaskModal && $editingTask}
  <div class="modal-backdrop" on:click={handleBackdropClick}>
    <div class="modal">
      <div class="modal-header">
        <div class="modal-title">
          <h2>Edit Task</h2>
          {#if project}
            <span class="project-name">{project.name}</span>
          {/if}
        </div>
        <button class="btn-icon" on:click={close}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <div class="modal-body">
        <div class="form-group">
          <label for="title">Title</label>
          <input
            id="title"
            type="text"
            bind:value={title}
            placeholder="Task title"
          />
        </div>

        <div class="form-group">
          <label for="description">Description</label>
          <textarea
            id="description"
            bind:value={description}
            placeholder="Add a description..."
            rows="3"
          ></textarea>
        </div>

        <div class="form-group">
          <label>Todo List</label>
          <SubtaskList bind:subtasks />
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="dueDate">Due Date</label>
            <input
              id="dueDate"
              type="date"
              bind:value={dueDate}
            />
          </div>

          <div class="form-group">
            <label for="priority">Priority</label>
            <select id="priority" bind:value={priority}>
              <option value={null}>None</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label>Tags</label>
          <TagPicker bind:selectedTags />
        </div>

        <div class="form-group">
          <label class="checkbox-label">
            <input type="checkbox" bind:checked={recurringEnabled} />
            <span>Recurring task</span>
          </label>

          {#if recurringEnabled}
            <div class="recurring-options">
              <span>Repeat every</span>
              <input
                type="number"
                min="1"
                max="365"
                bind:value={recurringInterval}
                class="recurring-input"
              />
              <select bind:value={recurringUnit}>
                <option value="day">day(s)</option>
                <option value="week">week(s)</option>
                <option value="month">month(s)</option>
              </select>
            </div>
          {/if}
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn-danger" on:click={deleteTask}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
          </svg>
          Delete
        </button>
        <div class="footer-right">
          <button class="btn-secondary" on:click={close}>Cancel</button>
          <button class="btn-primary" on:click={save} disabled={!title.trim()}>Save</button>
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  .modal {
    max-width: 560px;
  }

  .modal-title {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .modal-title h2 {
    font-size: 1.125rem;
  }

  .project-name {
    font-size: 0.75rem;
    color: var(--text-tertiary);
  }

  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }

  .checkbox-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    font-weight: normal;
    color: var(--text-primary);
  }

  .checkbox-label input {
    width: auto;
  }

  .recurring-options {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-top: 0.5rem;
    padding-left: 1.5rem;
    font-size: 0.875rem;
    color: var(--text-secondary);
  }

  .recurring-input {
    width: 60px;
    text-align: center;
  }

  .recurring-options select {
    width: auto;
  }

  .modal-footer {
    display: flex;
    justify-content: space-between;
  }

  .footer-right {
    display: flex;
    gap: 0.75rem;
  }

  @media (max-width: 640px) {
    .form-row {
      grid-template-columns: 1fr;
    }
  }
</style>
