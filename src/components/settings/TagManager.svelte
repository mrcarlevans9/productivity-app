<script>
  import { tags, tasks } from '../../lib/stores.js';
  import { put, remove } from '../../lib/db.js';
  import { createTag } from '../../lib/utils.js';

  let editingTagId = null;
  let editName = '';
  let editColor = '';
  let showNewTag = false;
  let newTagName = '';
  let newTagColor = '#4a90d9';

  const colors = [
    '#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#8b5cf6',
    '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16'
  ];

  function startEdit(tag) {
    editingTagId = tag.id;
    editName = tag.name;
    editColor = tag.color;
  }

  function cancelEdit() {
    editingTagId = null;
    editName = '';
    editColor = '';
  }

  async function saveEdit() {
    if (!editName.trim()) return;

    const tag = $tags.find(t => t.id === editingTagId);
    if (!tag) return;

    const updated = {
      ...tag,
      name: editName.trim(),
      color: editColor
    };

    await put('tags', updated);
    tags.update(t => t.map(tg => tg.id === updated.id ? updated : tg));
    cancelEdit();
  }

  async function deleteTag(id) {
    const usedCount = $tasks.filter(t => t.tags?.includes(id)).length;
    const message = usedCount > 0
      ? `This tag is used by ${usedCount} task(s). Delete anyway?`
      : 'Delete this tag?';

    if (!confirm(message)) return;

    await remove('tags', id);
    tags.update(t => t.filter(tg => tg.id !== id));

    // Remove tag from tasks
    const updatedTasks = $tasks
      .filter(t => t.tags?.includes(id))
      .map(t => ({
        ...t,
        tags: t.tags.filter(tagId => tagId !== id)
      }));

    for (const task of updatedTasks) {
      await put('tasks', task);
    }

    tasks.update(t => t.map(task => {
      if (task.tags?.includes(id)) {
        return { ...task, tags: task.tags.filter(tagId => tagId !== id) };
      }
      return task;
    }));
  }

  async function addTag() {
    if (!newTagName.trim()) return;

    const tag = createTag(newTagName.trim(), newTagColor);
    await put('tags', tag);
    tags.update(t => [...t, tag]);

    newTagName = '';
    newTagColor = '#4a90d9';
    showNewTag = false;
  }
</script>

<div class="tag-manager">
  {#if $tags.length > 0}
    <div class="tag-list">
      {#each $tags as tag}
        <div class="tag-item">
          {#if editingTagId === tag.id}
            <div class="tag-edit">
              <input
                type="text"
                bind:value={editName}
                placeholder="Tag name"
                class="tag-name-input"
              />
              <div class="color-picker-inline">
                {#each colors as color}
                  <button
                    class="color-dot"
                    class:selected={editColor === color}
                    style="background-color: {color}"
                    on:click={() => editColor = color}
                  ></button>
                {/each}
              </div>
              <div class="tag-edit-actions">
                <button class="btn-ghost btn-sm" on:click={cancelEdit}>Cancel</button>
                <button class="btn-primary btn-sm" on:click={saveEdit}>Save</button>
              </div>
            </div>
          {:else}
            <div class="tag-display">
              <span class="tag-color" style="background-color: {tag.color}"></span>
              <span class="tag-name">{tag.name}</span>
            </div>
            <div class="tag-actions">
              <button class="btn-icon btn-sm" on:click={() => startEdit(tag)} title="Edit">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </button>
              <button class="btn-icon btn-sm" on:click={() => deleteTag(tag.id)} title="Delete">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                </svg>
              </button>
            </div>
          {/if}
        </div>
      {/each}
    </div>
  {:else}
    <p class="no-tags">No tags created yet</p>
  {/if}

  {#if showNewTag}
    <div class="new-tag-form">
      <input
        type="text"
        bind:value={newTagName}
        placeholder="Tag name"
        on:keydown={(e) => e.key === 'Enter' && addTag()}
      />
      <div class="color-picker-inline">
        {#each colors as color}
          <button
            class="color-dot"
            class:selected={newTagColor === color}
            style="background-color: {color}"
            on:click={() => newTagColor = color}
          ></button>
        {/each}
      </div>
      <div class="new-tag-actions">
        <button class="btn-ghost btn-sm" on:click={() => { showNewTag = false; newTagName = ''; }}>Cancel</button>
        <button class="btn-primary btn-sm" on:click={addTag} disabled={!newTagName.trim()}>Add Tag</button>
      </div>
    </div>
  {:else}
    <button class="add-tag-btn" on:click={() => showNewTag = true}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 5v14M5 12h14"/>
      </svg>
      Add Tag
    </button>
  {/if}
</div>

<style>
  .tag-manager {
    margin-top: 0.5rem;
  }

  .tag-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  .tag-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.5rem 0.75rem;
    background-color: var(--bg-secondary);
    border-radius: 6px;
  }

  .tag-display {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .tag-color {
    width: 14px;
    height: 14px;
    border-radius: 4px;
  }

  .tag-name {
    font-size: 0.875rem;
  }

  .tag-actions {
    display: flex;
    gap: 0.25rem;
    opacity: 0;
    transition: opacity 0.15s ease;
  }

  .tag-item:hover .tag-actions {
    opacity: 1;
  }

  .tag-edit {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .tag-name-input {
    padding: 0.375rem 0.5rem;
    font-size: 0.875rem;
  }

  .color-picker-inline {
    display: flex;
    gap: 0.375rem;
    flex-wrap: wrap;
  }

  .color-dot {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    border: 2px solid transparent;
    cursor: pointer;
    padding: 0;
  }

  .color-dot:hover {
    transform: scale(1.1);
  }

  .color-dot.selected {
    border-color: var(--text-primary);
  }

  .tag-edit-actions, .new-tag-actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
  }

  .new-tag-form {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    padding: 1rem;
    background-color: var(--bg-secondary);
    border-radius: 6px;
  }

  .add-tag-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    width: 100%;
    padding: 0.75rem;
    background: transparent;
    border: 2px dashed var(--border);
    border-radius: 6px;
    color: var(--text-secondary);
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .add-tag-btn:hover {
    border-color: var(--accent);
    color: var(--accent);
    background-color: var(--accent-light);
  }

  .no-tags {
    font-size: 0.875rem;
    color: var(--text-tertiary);
    text-align: center;
    padding: 1rem;
  }

  .btn-sm {
    padding: 0.25rem 0.5rem;
    font-size: 0.8125rem;
  }
</style>
