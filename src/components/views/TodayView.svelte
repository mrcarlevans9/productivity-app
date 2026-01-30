<script>
  import { todayTasks, overdueTasks, editingTask, showTaskModal, tags } from '../../lib/stores.js';
  import { formatDate, priorityColors } from '../../lib/utils.js';

  function openTask(task) {
    editingTask.set(task);
    showTaskModal.set(true);
  }

  function navigate(path) {
    window.location.hash = path;
  }

  $: groupedTasks = $todayTasks.reduce((acc, task) => {
    const projectName = task.project?.name || 'No Project';
    if (!acc[projectName]) acc[projectName] = [];
    acc[projectName].push(task);
    return acc;
  }, {});

  $: overdueGrouped = $overdueTasks.reduce((acc, task) => {
    const projectId = task.projectId;
    if (!acc[projectId]) acc[projectId] = { tasks: [], projectName: '' };
    acc[projectId].tasks.push(task);
    return acc;
  }, {});
</script>

<div class="today-view">
  <div class="view-header">
    <h1>Today</h1>
    <span class="task-count">{$todayTasks.length} tasks</span>
  </div>

  {#if $overdueTasks.length > 0}
    <div class="section overdue-section">
      <h2 class="section-title overdue">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 8v4M12 16h.01"/>
        </svg>
        Overdue ({$overdueTasks.length})
      </h2>
      <div class="task-list">
        {#each $overdueTasks as task}
          <div class="task-item overdue" on:click={() => openTask(task)} on:keydown={(e) => e.key === 'Enter' && openTask(task)} role="button" tabindex="0">
            <div class="task-content">
              <span class="task-title">{task.title}</span>
              <div class="task-meta">
                {#if task.priority}
                  <span class="priority" style="color: {priorityColors[task.priority]}">{task.priority}</span>
                {/if}
                <span class="due-date overdue">{formatDate(task.dueDate)}</span>
              </div>
            </div>
            <button class="go-to-project" on:click|stopPropagation={() => navigate(`#/project/${task.projectId}`)} title="Go to project">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
          </div>
        {/each}
      </div>
    </div>
  {/if}

  {#if Object.keys(groupedTasks).length > 0}
    {#each Object.entries(groupedTasks) as [projectName, tasks]}
      <div class="section">
        <h2 class="section-title">{projectName}</h2>
        <div class="task-list">
          {#each tasks as task}
            <div class="task-item" on:click={() => openTask(task)} on:keydown={(e) => e.key === 'Enter' && openTask(task)} role="button" tabindex="0">
              <div class="task-content">
                <span class="task-title">{task.title}</span>
                <div class="task-meta">
                  {#if task.priority}
                    <span class="priority" style="color: {priorityColors[task.priority]}">{task.priority}</span>
                  {/if}
                  {#each ($tags.filter(t => task.tags?.includes(t.id))) as tag}
                    <span class="tag" style="background-color: {tag.color}20; color: {tag.color}">{tag.name}</span>
                  {/each}
                </div>
              </div>
              <button class="go-to-project" on:click|stopPropagation={() => navigate(`#/project/${task.projectId}`)} title="Go to project">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </button>
            </div>
          {/each}
        </div>
      </div>
    {/each}
  {:else if $overdueTasks.length === 0}
    <div class="empty-state">
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <circle cx="12" cy="12" r="10"/>
        <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
        <line x1="9" y1="9" x2="9.01" y2="9"/>
        <line x1="15" y1="9" x2="15.01" y2="9"/>
      </svg>
      <h3>All caught up!</h3>
      <p>No tasks due today</p>
    </div>
  {/if}
</div>

<style>
  .today-view {
    padding: 1.5rem;
    max-width: 800px;
    margin: 0 auto;
  }

  .view-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  .view-header h1 {
    font-size: 1.5rem;
  }

  .task-count {
    font-size: 0.875rem;
    color: var(--text-secondary);
    background-color: var(--bg-tertiary);
    padding: 0.25rem 0.75rem;
    border-radius: 9999px;
  }

  .section {
    margin-bottom: 1.5rem;
  }

  .section-title {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--text-secondary);
    margin-bottom: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .section-title.overdue {
    color: var(--danger);
  }

  .overdue-section {
    background-color: var(--overdue-bg);
    padding: 1rem;
    border-radius: 8px;
    border: 1px solid var(--overdue-border);
  }

  .task-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .task-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem 1rem;
    background-color: var(--bg-primary);
    border: 1px solid var(--border);
    border-radius: 8px;
    cursor: pointer;
    text-align: left;
    transition: all 0.15s ease;
  }

  .task-item:hover {
    box-shadow: var(--card-shadow-hover);
    transform: translateY(-1px);
  }

  .task-item.overdue {
    border-left: 3px solid var(--danger);
  }

  .task-content {
    flex: 1;
    min-width: 0;
  }

  .task-title {
    display: block;
    font-weight: 500;
    margin-bottom: 0.25rem;
  }

  .task-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    font-size: 0.75rem;
  }

  .priority {
    font-weight: 600;
    text-transform: uppercase;
  }

  .due-date {
    color: var(--text-secondary);
  }

  .due-date.overdue {
    color: var(--danger);
  }

  .tag {
    padding: 0.125rem 0.375rem;
    border-radius: 4px;
    font-weight: 500;
  }

  .go-to-project {
    padding: 0.5rem;
    background: transparent;
    border: none;
    border-radius: 4px;
    color: var(--text-tertiary);
    cursor: pointer;
  }

  .go-to-project:hover {
    background-color: var(--bg-secondary);
    color: var(--accent);
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4rem 2rem;
    text-align: center;
    color: var(--text-tertiary);
  }

  .empty-state svg {
    margin-bottom: 1rem;
  }

  .empty-state h3 {
    font-size: 1.25rem;
    color: var(--text-secondary);
    margin-bottom: 0.25rem;
  }
</style>
