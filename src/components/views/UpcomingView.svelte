<script>
  import { upcomingTasks, editingTask, showTaskModal, tags, projects } from '../../lib/stores.js';
  import { formatDate, priorityColors } from '../../lib/utils.js';

  function openTask(task) {
    editingTask.set(task);
    showTaskModal.set(true);
  }

  function navigate(path) {
    window.location.hash = path;
  }

  function getDayName(dateStr) {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';

    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  }

  $: groupedByDate = $upcomingTasks.reduce((acc, task) => {
    const dateKey = task.dueDate.split('T')[0];
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(task);
    return acc;
  }, {});

  $: sortedDates = Object.keys(groupedByDate).sort();
</script>

<div class="upcoming-view">
  <div class="view-header">
    <h1>Upcoming</h1>
    <span class="task-count">{$upcomingTasks.length} tasks</span>
  </div>

  {#if sortedDates.length > 0}
    {#each sortedDates as dateKey}
      <div class="date-section">
        <h2 class="date-header">{getDayName(dateKey)}</h2>
        <div class="task-list">
          {#each groupedByDate[dateKey] as task}
            <div class="task-item" on:click={() => openTask(task)} on:keydown={(e) => e.key === 'Enter' && openTask(task)} role="button" tabindex="0">
              <div class="task-content">
                <span class="task-title">{task.title}</span>
                <div class="task-meta">
                  <span class="project-badge">
                    {task.project?.name || 'No Project'}
                  </span>
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
  {:else}
    <div class="empty-state">
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <rect x="3" y="4" width="18" height="18" rx="2"/>
        <path d="M16 2v4M8 2v4M3 10h18"/>
      </svg>
      <h3>Nothing scheduled</h3>
      <p>No tasks due in the next 7 days</p>
    </div>
  {/if}
</div>

<style>
  .upcoming-view {
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

  .date-section {
    margin-bottom: 1.5rem;
  }

  .date-header {
    font-size: 1rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 0.75rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid var(--border);
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

  .project-badge {
    color: var(--accent);
    font-weight: 500;
  }

  .priority {
    font-weight: 600;
    text-transform: uppercase;
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
