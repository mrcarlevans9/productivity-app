<script>
  import { generateId } from '../../lib/utils.js';

  export let subtasks = [];

  let newSubtask = '';

  function addSubtask() {
    if (!newSubtask.trim()) return;

    subtasks = [...subtasks, { id: generateId(), text: newSubtask.trim(), completed: false }];
    newSubtask = '';
  }

  function removeSubtask(id) {
    subtasks = subtasks.filter(s => s.id !== id);
  }

  function toggleSubtask(id) {
    subtasks = subtasks.map(s =>
      s.id === id ? { ...s, completed: !s.completed } : s
    );
  }

  function handleKeydown(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSubtask();
    }
  }
</script>

<div class="subtask-list">
  {#each subtasks as subtask (subtask.id)}
    <div class="subtask-item">
      <label class="subtask-checkbox">
        <input
          type="checkbox"
          checked={subtask.completed}
          on:change={() => toggleSubtask(subtask.id)}
        />
        <span class:completed={subtask.completed}>{subtask.text}</span>
      </label>
      <button class="btn-icon btn-sm" on:click={() => removeSubtask(subtask.id)}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 6L6 18M6 6l12 12"/>
        </svg>
      </button>
    </div>
  {/each}

  <div class="add-subtask">
    <input
      type="text"
      bind:value={newSubtask}
      placeholder="Add a todo item..."
      on:keydown={handleKeydown}
    />
    <button class="btn-ghost btn-sm" on:click={addSubtask} disabled={!newSubtask.trim()}>
      Add
    </button>
  </div>
</div>

<style>
  .subtask-list {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
  }

  .subtask-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.375rem 0.5rem;
    background-color: var(--bg-secondary);
    border-radius: 4px;
  }

  .subtask-checkbox {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    flex: 1;
  }

  .subtask-checkbox input {
    width: auto;
  }

  .subtask-checkbox span {
    font-size: 0.875rem;
  }

  .subtask-checkbox span.completed {
    text-decoration: line-through;
    color: var(--text-tertiary);
  }

  .add-subtask {
    display: flex;
    gap: 0.5rem;
    margin-top: 0.25rem;
  }

  .add-subtask input {
    flex: 1;
    padding: 0.375rem 0.5rem;
    font-size: 0.875rem;
  }

  .btn-sm {
    padding: 0.25rem 0.5rem;
    font-size: 0.8125rem;
  }
</style>
