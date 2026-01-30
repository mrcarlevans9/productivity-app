<script>
  import { tasks, tags, editingTask, showTaskModal, projects, currentProject } from '../../lib/stores.js';
  import { put } from '../../lib/db.js';
  import { isToday, isOverdue, formatDate, priorityColors, getNextDueDate, createTask } from '../../lib/utils.js';

  export let task;

  $: taskTags = $tags.filter(t => task.tags?.includes(t.id));
  $: dueToday = isToday(task.dueDate);
  $: overdue = isOverdue(task.dueDate) && !task.completed;
  $: completedSubtasks = task.subtasks?.filter(s => s.completed).length || 0;
  $: totalSubtasks = task.subtasks?.length || 0;

  function handleClick() {
    editingTask.set(task);
    showTaskModal.set(true);
  }

  function handleDragStart(e) {
    e.dataTransfer.setData('text/plain', task.id);
    e.dataTransfer.effectAllowed = 'move';
    e.currentTarget.classList.add('dragging');
  }

  function handleDragEnd(e) {
    e.currentTarget.classList.remove('dragging');
  }

  async function toggleComplete(e) {
    e.stopPropagation();

    if (!task.completed) {
      // Completing the task
      const updated = {
        ...task,
        completed: true,
        completedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await put('tasks', updated);
      tasks.update(t => t.map(tsk => tsk.id === updated.id ? updated : tsk));

      // Handle recurring task
      if (task.recurring?.enabled && task.dueDate) {
        const nextDueDate = getNextDueDate(task.dueDate, task.recurring);
        if (nextDueDate) {
          const newTask = createTask(task.projectId, task.columnId, task.title);
          Object.assign(newTask, {
            description: task.description,
            subtasks: task.subtasks?.map(s => ({ ...s, completed: false })) || [],
            tags: task.tags,
            dueDate: nextDueDate,
            priority: task.priority,
            recurring: task.recurring
          });

          await put('tasks', newTask);
          tasks.update(t => [...t, newTask]);
        }
      }
    } else {
      // Uncompleting the task - return to previous column
      const updated = {
        ...task,
        completed: false,
        completedAt: null,
        columnId: task.previousColumnId || task.columnId,
        updatedAt: new Date().toISOString()
      };

      await put('tasks', updated);
      tasks.update(t => t.map(tsk => tsk.id === updated.id ? updated : tsk));
    }
  }
</script>

<div
  class="task-card"
  class:completed={task.completed}
  class:overdue
  class:due-today={dueToday && !task.completed}
  draggable="true"
  on:click={handleClick}
  on:dragstart={handleDragStart}
  on:dragend={handleDragEnd}
  role="button"
  tabindex="0"
>
  <div class="task-header">
    <button class="checkbox" class:checked={task.completed} on:click={toggleComplete}>
      {#if task.completed}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
          <path d="M20 6L9 17l-5-5"/>
        </svg>
      {/if}
    </button>
    <span class="task-title">{task.title}</span>
  </div>

  {#if task.description}
    <p class="task-description">{task.description.slice(0, 100)}{task.description.length > 100 ? '...' : ''}</p>
  {/if}

  <div class="task-meta">
    {#if task.priority}
      <span class="priority-badge" style="background-color: {priorityColors[task.priority]}20; color: {priorityColors[task.priority]}">
        {task.priority}
      </span>
    {/if}

    {#if task.dueDate}
      <span class="due-date" class:overdue class:today={dueToday}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="4" width="18" height="18" rx="2"/>
          <path d="M16 2v4M8 2v4M3 10h18"/>
        </svg>
        {formatDate(task.dueDate)}
      </span>
    {/if}

    {#if totalSubtasks > 0}
      <span class="subtask-count">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 11l3 3L22 4"/>
          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
        </svg>
        {completedSubtasks}/{totalSubtasks}
      </span>
    {/if}

    {#if task.recurring?.enabled}
      <span class="recurring-badge" title="Recurring task">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M23 4v6h-6M1 20v-6h6"/>
          <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
        </svg>
      </span>
    {/if}
  </div>

  {#if taskTags.length > 0}
    <div class="task-tags">
      {#each taskTags as tag}
        <span class="tag" style="background-color: {tag.color}20; color: {tag.color}">
          {tag.name}
        </span>
      {/each}
    </div>
  {/if}
</div>

<style>
  .task-card {
    background-color: var(--bg-primary);
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 0.75rem;
    cursor: pointer;
    transition: all 0.15s ease;
    box-shadow: var(--card-shadow);
  }

  .task-card:hover {
    box-shadow: var(--card-shadow-hover);
    transform: translateY(-1px);
  }

  .task-card.completed {
    opacity: 0.6;
  }

  .task-card.overdue {
    border-left: 3px solid var(--danger);
    background-color: var(--overdue-bg);
  }

  .task-card.due-today {
    border-left: 3px solid var(--warning);
    background-color: var(--today-bg);
  }

  .task-card.dragging {
    opacity: 0.5;
  }

  .task-header {
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .checkbox {
    flex-shrink: 0;
    width: 18px;
    height: 18px;
    border: 2px solid var(--border);
    border-radius: 4px;
    background: transparent;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 2px;
    transition: all 0.15s ease;
  }

  .checkbox:hover {
    border-color: var(--accent);
  }

  .checkbox.checked {
    background-color: var(--accent);
    border-color: var(--accent);
    color: white;
  }

  .task-title {
    font-size: 0.875rem;
    font-weight: 500;
    line-height: 1.4;
    word-break: break-word;
  }

  .completed .task-title {
    text-decoration: line-through;
    color: var(--text-tertiary);
  }

  .task-description {
    font-size: 0.75rem;
    color: var(--text-secondary);
    margin-top: 0.375rem;
    margin-left: 1.625rem;
    line-height: 1.4;
  }

  .task-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-top: 0.5rem;
    margin-left: 1.625rem;
  }

  .priority-badge {
    font-size: 0.6875rem;
    font-weight: 600;
    text-transform: uppercase;
    padding: 0.125rem 0.375rem;
    border-radius: 4px;
  }

  .due-date {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.6875rem;
    color: var(--text-secondary);
  }

  .due-date.overdue {
    color: var(--danger);
  }

  .due-date.today {
    color: var(--warning);
  }

  .subtask-count, .recurring-badge {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.6875rem;
    color: var(--text-tertiary);
  }

  .task-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem;
    margin-top: 0.5rem;
    margin-left: 1.625rem;
  }

  .tag {
    font-size: 0.625rem;
    font-weight: 500;
    padding: 0.125rem 0.375rem;
    border-radius: 4px;
  }
</style>
