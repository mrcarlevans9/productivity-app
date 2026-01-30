<script>
  import { tags } from '../../lib/stores.js';
  import { put } from '../../lib/db.js';
  import { createTag } from '../../lib/utils.js';

  export let selectedTags = [];

  let showDropdown = false;
  let showNewTag = false;
  let newTagName = '';
  let newTagColor = '#4a90d9';

  const colors = [
    '#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#8b5cf6',
    '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16'
  ];

  function toggleTag(tagId) {
    if (selectedTags.includes(tagId)) {
      selectedTags = selectedTags.filter(id => id !== tagId);
    } else {
      selectedTags = [...selectedTags, tagId];
    }
  }

  async function addTag() {
    if (!newTagName.trim()) return;

    const tag = createTag(newTagName.trim(), newTagColor);
    await put('tags', tag);
    tags.update(t => [...t, tag]);

    selectedTags = [...selectedTags, tag.id];
    newTagName = '';
    newTagColor = '#4a90d9';
    showNewTag = false;
  }

  function handleClickOutside(e) {
    if (showDropdown && !e.target.closest('.tag-picker')) {
      showDropdown = false;
      showNewTag = false;
    }
  }

  $: selectedTagObjects = $tags.filter(t => selectedTags.includes(t.id));
</script>

<svelte:window on:click={handleClickOutside} />

<div class="tag-picker">
  <div class="selected-tags" on:click|stopPropagation={() => showDropdown = !showDropdown}>
    {#if selectedTagObjects.length === 0}
      <span class="placeholder">Select tags...</span>
    {:else}
      {#each selectedTagObjects as tag}
        <span class="tag" style="background-color: {tag.color}20; color: {tag.color}">
          {tag.name}
          <button class="tag-remove" on:click|stopPropagation={() => toggleTag(tag.id)}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </span>
      {/each}
    {/if}
    <svg class="dropdown-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M6 9l6 6 6-6"/>
    </svg>
  </div>

  {#if showDropdown}
    <div class="dropdown" on:click|stopPropagation>
      {#if $tags.length > 0}
        <div class="tag-list">
          {#each $tags as tag}
            <label class="tag-option">
              <input
                type="checkbox"
                checked={selectedTags.includes(tag.id)}
                on:change={() => toggleTag(tag.id)}
              />
              <span class="tag-color" style="background-color: {tag.color}"></span>
              <span class="tag-name">{tag.name}</span>
            </label>
          {/each}
        </div>
        <div class="dropdown-divider"></div>
      {/if}

      {#if showNewTag}
        <div class="new-tag-form">
          <input
            type="text"
            bind:value={newTagName}
            placeholder="Tag name"
            on:keydown={(e) => e.key === 'Enter' && addTag()}
          />
          <div class="color-picker">
            {#each colors as color}
              <button
                class="color-option"
                class:selected={newTagColor === color}
                style="background-color: {color}"
                on:click={() => newTagColor = color}
              ></button>
            {/each}
          </div>
          <div class="new-tag-actions">
            <button class="btn-ghost btn-sm" on:click={() => { showNewTag = false; newTagName = ''; }}>Cancel</button>
            <button class="btn-primary btn-sm" on:click={addTag} disabled={!newTagName.trim()}>Add</button>
          </div>
        </div>
      {:else}
        <button class="new-tag-btn" on:click={() => showNewTag = true}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 5v14M5 12h14"/>
          </svg>
          Create new tag
        </button>
      {/if}
    </div>
  {/if}
</div>

<style>
  .tag-picker {
    position: relative;
  }

  .selected-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.375rem;
    padding: 0.5rem;
    border: 1px solid var(--border);
    border-radius: 6px;
    background-color: var(--bg-primary);
    cursor: pointer;
    min-height: 42px;
    align-items: center;
  }

  .selected-tags:hover {
    border-color: var(--accent);
  }

  .placeholder {
    color: var(--text-tertiary);
    font-size: 0.875rem;
  }

  .dropdown-arrow {
    margin-left: auto;
    color: var(--text-tertiary);
  }

  .tag {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.75rem;
    font-weight: 500;
    padding: 0.125rem 0.375rem;
    border-radius: 4px;
  }

  .tag-remove {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    background: transparent;
    border: none;
    cursor: pointer;
    opacity: 0.7;
  }

  .tag-remove:hover {
    opacity: 1;
  }

  .dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    margin-top: 0.25rem;
    background-color: var(--bg-primary);
    border: 1px solid var(--border);
    border-radius: 8px;
    box-shadow: var(--card-shadow);
    z-index: 50;
    max-height: 300px;
    overflow-y: auto;
  }

  .tag-list {
    padding: 0.25rem;
  }

  .tag-option {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem;
    border-radius: 4px;
    cursor: pointer;
  }

  .tag-option:hover {
    background-color: var(--bg-secondary);
  }

  .tag-option input {
    width: auto;
  }

  .tag-color {
    width: 12px;
    height: 12px;
    border-radius: 3px;
  }

  .tag-name {
    font-size: 0.875rem;
  }

  .dropdown-divider {
    height: 1px;
    background-color: var(--border);
  }

  .new-tag-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    width: 100%;
    padding: 0.75rem;
    background: transparent;
    border: none;
    color: var(--accent);
    font-size: 0.875rem;
    cursor: pointer;
  }

  .new-tag-btn:hover {
    background-color: var(--accent-light);
  }

  .new-tag-form {
    padding: 0.75rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .new-tag-form input {
    font-size: 0.875rem;
  }

  .color-picker {
    display: flex;
    gap: 0.375rem;
    flex-wrap: wrap;
  }

  .color-option {
    width: 24px;
    height: 24px;
    border-radius: 4px;
    border: 2px solid transparent;
    cursor: pointer;
    transition: transform 0.1s ease;
  }

  .color-option:hover {
    transform: scale(1.1);
  }

  .color-option.selected {
    border-color: var(--text-primary);
  }

  .new-tag-actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
  }

  .btn-sm {
    padding: 0.25rem 0.5rem;
    font-size: 0.8125rem;
  }
</style>
