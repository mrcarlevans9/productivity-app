<script>
  import { onDestroy } from 'svelte';
  import { timerState, tasks, projects, timeEntries } from '../../lib/stores.js';
  import { put } from '../../lib/db.js';
  import { formatTime, createTimeEntry } from '../../lib/utils.js';

  let customTitle = '';
  let selectedTaskId = '';
  let elapsedTime = 0;
  let timerInterval = null;

  $: allTasks = $tasks.filter(t => !t.completed);
  $: selectedTask = allTasks.find(t => t.id === selectedTaskId);
  $: selectedProject = selectedTask ? $projects.find(p => p.id === selectedTask.projectId) : null;

  $: if ($timerState.isRunning && !$timerState.isPaused) {
    if (!timerInterval) {
      timerInterval = setInterval(() => {
        elapsedTime = Date.now() - $timerState.startTime + $timerState.pausedTime;
      }, 100);
    }
  } else {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
    if ($timerState.isPaused) {
      elapsedTime = $timerState.pausedTime;
    } else if (!$timerState.isRunning) {
      elapsedTime = 0;
    }
  }

  function startTimer() {
    const taskId = selectedTaskId || null;
    const projectId = selectedTask?.projectId || null;
    const title = selectedTask?.title || customTitle.trim() || 'Untitled session';

    timerState.set({
      isRunning: true,
      isPaused: false,
      startTime: Date.now(),
      pausedTime: 0,
      taskId,
      projectId,
      customTitle: title
    });
  }

  function pauseTimer() {
    timerState.update(s => ({
      ...s,
      isPaused: true,
      pausedTime: elapsedTime
    }));
  }

  function resumeTimer() {
    timerState.update(s => ({
      ...s,
      isPaused: false,
      startTime: Date.now()
    }));
  }

  async function stopTimer() {
    const entry = createTimeEntry(
      $timerState.taskId,
      $timerState.projectId,
      $timerState.customTitle,
      $timerState.startTime - $timerState.pausedTime,
      Date.now()
    );

    entry.duration = elapsedTime;

    await put('timeEntries', entry);
    timeEntries.update(e => [...e, entry]);

    timerState.set({
      isRunning: false,
      isPaused: false,
      startTime: null,
      pausedTime: 0,
      taskId: null,
      projectId: null,
      customTitle: ''
    });

    selectedTaskId = '';
    customTitle = '';
  }

  function discardTimer() {
    if (!confirm('Discard this timer session?')) return;

    timerState.set({
      isRunning: false,
      isPaused: false,
      startTime: null,
      pausedTime: 0,
      taskId: null,
      projectId: null,
      customTitle: ''
    });

    selectedTaskId = '';
    customTitle = '';
  }

  onDestroy(() => {
    if (timerInterval) clearInterval(timerInterval);
  });
</script>

<div class="timer-view">
  <div class="timer-card">
    <div class="timer-display">
      <span class="timer-time">{formatTime(elapsedTime)}</span>
      {#if $timerState.isRunning}
        <span class="timer-label">{$timerState.customTitle}</span>
      {/if}
    </div>

    {#if !$timerState.isRunning}
      <div class="timer-setup">
        <div class="form-group">
          <label for="taskSelect">Link to task (optional)</label>
          <select id="taskSelect" bind:value={selectedTaskId}>
            <option value="">No task</option>
            {#each $projects as project}
              <optgroup label={project.name}>
                {#each allTasks.filter(t => t.projectId === project.id) as task}
                  <option value={task.id}>{task.title}</option>
                {/each}
              </optgroup>
            {/each}
          </select>
        </div>

        {#if !selectedTaskId}
          <div class="form-group">
            <label for="customTitle">Session title</label>
            <input
              id="customTitle"
              type="text"
              bind:value={customTitle}
              placeholder="What are you working on?"
            />
          </div>
        {:else}
          <div class="selected-task">
            <span class="task-name">{selectedTask?.title}</span>
            <span class="project-name">{selectedProject?.name}</span>
          </div>
        {/if}

        <button class="btn-primary btn-lg start-btn" on:click={startTimer}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="5,3 19,12 5,21"/>
          </svg>
          Start Timer
        </button>
      </div>
    {:else}
      <div class="timer-controls">
        {#if $timerState.isPaused}
          <button class="btn-primary btn-lg" on:click={resumeTimer}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5,3 19,12 5,21"/>
            </svg>
            Resume
          </button>
        {:else}
          <button class="btn-secondary btn-lg" on:click={pauseTimer}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="4" width="4" height="16"/>
              <rect x="14" y="4" width="4" height="16"/>
            </svg>
            Pause
          </button>
        {/if}

        <button class="btn-primary btn-lg stop-btn" on:click={stopTimer}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <rect x="4" y="4" width="16" height="16" rx="2"/>
          </svg>
          Stop & Save
        </button>

        <button class="btn-ghost" on:click={discardTimer}>Discard</button>
      </div>
    {/if}
  </div>

  <div class="timer-tips">
    <h3>Tips</h3>
    <ul>
      <li>Link a task to track time against it</li>
      <li>Or just enter a title for general tracking</li>
      <li>Your timer persists even if you navigate away</li>
      <li>View your time logs and analytics below</li>
    </ul>
    <div class="timer-links">
      <a href="#/logs">View Time Logs</a>
      <a href="#/analytics">View Analytics</a>
    </div>
  </div>
</div>

<style>
  .timer-view {
    padding: 2rem;
    max-width: 600px;
    margin: 0 auto;
  }

  .timer-card {
    background-color: var(--bg-primary);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 2rem;
    text-align: center;
  }

  .timer-display {
    margin-bottom: 2rem;
  }

  .timer-time {
    font-size: 4rem;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    color: var(--text-primary);
    letter-spacing: -0.02em;
  }

  .timer-label {
    display: block;
    font-size: 1rem;
    color: var(--text-secondary);
    margin-top: 0.5rem;
  }

  .timer-setup {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    max-width: 400px;
    margin: 0 auto;
  }

  .form-group {
    text-align: left;
  }

  .form-group label {
    display: block;
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--text-secondary);
    margin-bottom: 0.25rem;
  }

  .selected-task {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    padding: 0.75rem;
    background-color: var(--accent-light);
    border-radius: 8px;
    text-align: left;
  }

  .task-name {
    font-weight: 500;
    color: var(--accent);
  }

  .project-name {
    font-size: 0.75rem;
    color: var(--text-secondary);
  }

  .start-btn {
    margin-top: 1rem;
  }

  .timer-controls {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    max-width: 300px;
    margin: 0 auto;
  }

  .btn-lg {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 1rem 2rem;
    font-size: 1.125rem;
  }

  .stop-btn {
    background-color: var(--success);
  }

  .stop-btn:hover {
    filter: brightness(1.1);
  }

  .timer-tips {
    margin-top: 2rem;
    padding: 1.5rem;
    background-color: var(--bg-primary);
    border: 1px solid var(--border);
    border-radius: 12px;
  }

  .timer-tips h3 {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--text-secondary);
    margin-bottom: 0.75rem;
  }

  .timer-tips ul {
    list-style: none;
    font-size: 0.875rem;
    color: var(--text-secondary);
  }

  .timer-tips li {
    padding: 0.25rem 0;
    padding-left: 1.25rem;
    position: relative;
  }

  .timer-tips li::before {
    content: "•";
    position: absolute;
    left: 0;
    color: var(--accent);
  }

  .timer-links {
    display: flex;
    gap: 1rem;
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid var(--border);
  }

  @media (max-width: 640px) {
    .timer-view {
      padding: 1rem;
    }

    .timer-time {
      font-size: 3rem;
    }
  }
</style>
