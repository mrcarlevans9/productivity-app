<script>
  import { timeEntries, tasks, projects } from '../../lib/stores.js';
  import { remove } from '../../lib/db.js';
  import { formatDuration } from '../../lib/utils.js';

  $: sortedEntries = [...$timeEntries].sort((a, b) => b.startTime - a.startTime);

  $: groupedByDate = sortedEntries.reduce((acc, entry) => {
    const date = new Date(entry.startTime).toDateString();
    if (!acc[date]) acc[date] = [];
    acc[date].push(entry);
    return acc;
  }, {});

  $: dates = Object.keys(groupedByDate);

  function getTaskName(entry) {
    if (entry.customTitle) return entry.customTitle;
    const task = $tasks.find(t => t.id === entry.taskId);
    return task?.title || 'Unknown task';
  }

  function getProjectName(entry) {
    const project = $projects.find(p => p.id === entry.projectId);
    return project?.name || null;
  }

  function formatTimeRange(startTime, endTime) {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const format = (d) => d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    return `${format(start)} - ${format(end)}`;
  }

  function formatDateHeader(dateStr) {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';

    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  }

  function getDayTotal(entries) {
    return entries.reduce((sum, e) => sum + e.duration, 0);
  }

  async function deleteEntry(id) {
    if (!confirm('Delete this time entry?')) return;
    await remove('timeEntries', id);
    timeEntries.update(e => e.filter(entry => entry.id !== id));
  }
</script>

<div class="logs-view">
  <div class="view-header">
    <h1>Time Logs</h1>
    <span class="entry-count">{$timeEntries.length} entries</span>
  </div>

  {#if dates.length > 0}
    {#each dates as date}
      <div class="date-section">
        <div class="date-header">
          <h2>{formatDateHeader(date)}</h2>
          <span class="day-total">{formatDuration(getDayTotal(groupedByDate[date]))}</span>
        </div>

        <div class="entry-list">
          {#each groupedByDate[date] as entry}
            <div class="entry-item">
              <div class="entry-content">
                <span class="entry-title">{getTaskName(entry)}</span>
                <div class="entry-meta">
                  {#if getProjectName(entry)}
                    <span class="project-name">{getProjectName(entry)}</span>
                  {/if}
                  <span class="time-range">{formatTimeRange(entry.startTime, entry.endTime)}</span>
                </div>
              </div>
              <div class="entry-right">
                <span class="entry-duration">{formatDuration(entry.duration)}</span>
                <button class="btn-icon btn-sm" on:click={() => deleteEntry(entry.id)} title="Delete">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                  </svg>
                </button>
              </div>
            </div>
          {/each}
        </div>
      </div>
    {/each}
  {:else}
    <div class="empty-state">
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <circle cx="12" cy="12" r="10"/>
        <path d="M12 6v6l4 2"/>
      </svg>
      <h3>No time tracked yet</h3>
      <p>Start the timer to track your work</p>
      <a href="#/timer" class="btn-primary">Go to Timer</a>
    </div>
  {/if}
</div>

<style>
  .logs-view {
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

  .entry-count {
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
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.75rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid var(--border);
  }

  .date-header h2 {
    font-size: 1rem;
    font-weight: 600;
  }

  .day-total {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--accent);
  }

  .entry-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .entry-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem 1rem;
    background-color: var(--bg-primary);
    border: 1px solid var(--border);
    border-radius: 8px;
  }

  .entry-content {
    flex: 1;
    min-width: 0;
  }

  .entry-title {
    display: block;
    font-weight: 500;
    margin-bottom: 0.125rem;
  }

  .entry-meta {
    display: flex;
    gap: 0.75rem;
    font-size: 0.75rem;
    color: var(--text-secondary);
  }

  .project-name {
    color: var(--accent);
  }

  .entry-right {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .entry-duration {
    font-size: 0.875rem;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
  }

  .btn-sm {
    padding: 0.25rem;
    opacity: 0;
    transition: opacity 0.15s ease;
  }

  .entry-item:hover .btn-sm {
    opacity: 1;
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

  .empty-state p {
    margin-bottom: 1rem;
  }
</style>
