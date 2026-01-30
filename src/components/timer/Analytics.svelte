<script>
  import { timeEntries, tasks, projects } from '../../lib/stores.js';
  import { formatDuration } from '../../lib/utils.js';

  let period = 'week';

  $: totalTime = $timeEntries.reduce((sum, e) => sum + e.duration, 0);

  // Group by project
  $: projectTotals = $timeEntries.reduce((acc, entry) => {
    const projectId = entry.projectId || 'no-project';
    if (!acc[projectId]) acc[projectId] = 0;
    acc[projectId] += entry.duration;
    return acc;
  }, {});

  $: projectStats = Object.entries(projectTotals)
    .map(([id, duration]) => ({
      id,
      name: $projects.find(p => p.id === id)?.name || 'No Project',
      duration,
      percentage: totalTime > 0 ? (duration / totalTime) * 100 : 0
    }))
    .sort((a, b) => b.duration - a.duration);

  // Group by task
  $: taskTotals = $timeEntries.reduce((acc, entry) => {
    const key = entry.taskId || entry.customTitle || 'untitled';
    if (!acc[key]) acc[key] = { duration: 0, title: '' };
    acc[key].duration += entry.duration;
    acc[key].title = entry.customTitle || $tasks.find(t => t.id === entry.taskId)?.title || 'Unknown';
    return acc;
  }, {});

  $: taskStats = Object.entries(taskTotals)
    .map(([id, data]) => ({
      id,
      title: data.title,
      duration: data.duration
    }))
    .sort((a, b) => b.duration - a.duration)
    .slice(0, 10);

  // Daily data for charts
  $: dailyData = (() => {
    const days = {};
    const today = new Date();
    const daysToShow = period === 'week' ? 7 : period === 'month' ? 30 : 365;

    // Initialize days
    for (let i = daysToShow - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const key = date.toISOString().split('T')[0];
      days[key] = 0;
    }

    // Fill in data
    $timeEntries.forEach(entry => {
      const key = new Date(entry.startTime).toISOString().split('T')[0];
      if (days[key] !== undefined) {
        days[key] += entry.duration;
      }
    });

    return Object.entries(days).map(([date, duration]) => ({
      date,
      duration,
      label: new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    }));
  })();

  $: maxDuration = Math.max(...dailyData.map(d => d.duration), 1);
  $: periodTotal = dailyData.reduce((sum, d) => sum + d.duration, 0);
  $: avgDaily = periodTotal / dailyData.length;

  function getBarHeight(duration) {
    return (duration / maxDuration) * 100;
  }
</script>

<div class="analytics-view">
  <div class="view-header">
    <h1>Analytics</h1>
    <div class="period-selector">
      <button class:active={period === 'week'} on:click={() => period = 'week'}>Week</button>
      <button class:active={period === 'month'} on:click={() => period = 'month'}>Month</button>
    </div>
  </div>

  <div class="stats-row">
    <div class="stat-card">
      <span class="stat-label">Total Time</span>
      <span class="stat-value">{formatDuration(totalTime)}</span>
    </div>
    <div class="stat-card">
      <span class="stat-label">This {period === 'week' ? 'Week' : 'Month'}</span>
      <span class="stat-value">{formatDuration(periodTotal)}</span>
    </div>
    <div class="stat-card">
      <span class="stat-label">Daily Average</span>
      <span class="stat-value">{formatDuration(avgDaily)}</span>
    </div>
  </div>

  <div class="chart-section">
    <h2>Daily Activity</h2>
    <div class="bar-chart">
      {#each dailyData as day}
        <div class="bar-container" title="{day.label}: {formatDuration(day.duration)}">
          <div class="bar" style="height: {getBarHeight(day.duration)}%"></div>
          <span class="bar-label">{new Date(day.date).getDate()}</span>
        </div>
      {/each}
    </div>
  </div>

  <div class="stats-grid">
    <div class="stats-section">
      <h2>By Project</h2>
      {#if projectStats.length > 0}
        <div class="stat-list">
          {#each projectStats as project}
            <div class="stat-row">
              <div class="stat-info">
                <span class="stat-name">{project.name}</span>
                <div class="progress-bar">
                  <div class="progress-fill" style="width: {project.percentage}%"></div>
                </div>
              </div>
              <span class="stat-duration">{formatDuration(project.duration)}</span>
            </div>
          {/each}
        </div>
      {:else}
        <p class="no-data">No data yet</p>
      {/if}
    </div>

    <div class="stats-section">
      <h2>Top Tasks</h2>
      {#if taskStats.length > 0}
        <div class="stat-list">
          {#each taskStats as task}
            <div class="stat-row">
              <span class="stat-name task-name">{task.title}</span>
              <span class="stat-duration">{formatDuration(task.duration)}</span>
            </div>
          {/each}
        </div>
      {:else}
        <p class="no-data">No data yet</p>
      {/if}
    </div>
  </div>
</div>

<style>
  .analytics-view {
    padding: 1.5rem;
    max-width: 1000px;
    margin: 0 auto;
  }

  .view-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1.5rem;
  }

  .view-header h1 {
    font-size: 1.5rem;
  }

  .period-selector {
    display: flex;
    gap: 0.25rem;
    background-color: var(--bg-secondary);
    padding: 0.25rem;
    border-radius: 8px;
  }

  .period-selector button {
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
    background: transparent;
    color: var(--text-secondary);
    border-radius: 6px;
  }

  .period-selector button.active {
    background-color: var(--bg-primary);
    color: var(--text-primary);
    box-shadow: var(--card-shadow);
  }

  .stats-row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1rem;
    margin-bottom: 2rem;
  }

  .stat-card {
    background-color: var(--bg-primary);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 1rem;
    text-align: center;
  }

  .stat-label {
    display: block;
    font-size: 0.75rem;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 0.25rem;
  }

  .stat-value {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--accent);
  }

  .chart-section {
    background-color: var(--bg-primary);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 1.5rem;
    margin-bottom: 2rem;
  }

  .chart-section h2 {
    font-size: 1rem;
    margin-bottom: 1rem;
  }

  .bar-chart {
    display: flex;
    align-items: flex-end;
    gap: 4px;
    height: 150px;
    padding-bottom: 1.5rem;
  }

  .bar-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    height: 100%;
    position: relative;
  }

  .bar {
    width: 100%;
    max-width: 30px;
    background-color: var(--accent);
    border-radius: 4px 4px 0 0;
    min-height: 2px;
    transition: height 0.3s ease;
  }

  .bar-container:hover .bar {
    background-color: var(--accent-hover);
  }

  .bar-label {
    position: absolute;
    bottom: -1.25rem;
    font-size: 0.625rem;
    color: var(--text-tertiary);
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1rem;
  }

  .stats-section {
    background-color: var(--bg-primary);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 1.5rem;
  }

  .stats-section h2 {
    font-size: 1rem;
    margin-bottom: 1rem;
  }

  .stat-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .stat-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
  }

  .stat-info {
    flex: 1;
    min-width: 0;
  }

  .stat-name {
    display: block;
    font-size: 0.875rem;
    margin-bottom: 0.25rem;
  }

  .task-name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .progress-bar {
    height: 6px;
    background-color: var(--bg-secondary);
    border-radius: 3px;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    background-color: var(--accent);
    border-radius: 3px;
    transition: width 0.3s ease;
  }

  .stat-duration {
    font-size: 0.875rem;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
    color: var(--text-secondary);
    white-space: nowrap;
  }

  .no-data {
    color: var(--text-tertiary);
    font-size: 0.875rem;
    text-align: center;
    padding: 1rem;
  }

  @media (max-width: 640px) {
    .analytics-view {
      padding: 1rem;
    }

    .bar-chart {
      overflow-x: auto;
    }
  }
</style>
