<script>
  import { settings, tags, projects, tasks, timeEntries } from '../../lib/stores.js';
  import { put, exportData, importData, getAll } from '../../lib/db.js';
  import { downloadJSON, readJSONFile } from '../../lib/utils.js';
  import TagManager from './TagManager.svelte';

  let theme = 'light';
  let accentColor = '#4a90d9';
  let navMode = 'sidebar';
  let importError = '';
  let importSuccess = false;

  const accentColors = [
    '#4a90d9', '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7',
    '#ec4899', '#ef4444', '#f97316', '#f59e0b', '#22c55e',
    '#14b8a6', '#06b6d4'
  ];

  settings.subscribe(s => {
    if (s) {
      theme = s.theme;
      accentColor = s.accentColor;
      navMode = s.navMode;
    }
  });

  async function saveSetting(key, value) {
    await put('settings', { key, value });

    settings.update(s => ({ ...s, [key]: value }));
  }

  async function handleThemeChange(e) {
    const newTheme = e.target.value;
    theme = newTheme;
    await saveSetting('theme', newTheme);
  }

  async function handleAccentChange(color) {
    accentColor = color;
    await saveSetting('accentColor', color);
  }

  async function handleNavModeChange(e) {
    const mode = e.target.value;
    navMode = mode;
    await saveSetting('navMode', mode);
  }

  async function handleExport() {
    try {
      const data = await exportData();
      const filename = `productivity-backup-${new Date().toISOString().split('T')[0]}.json`;
      downloadJSON(data, filename);
    } catch (err) {
      console.error('Export failed:', err);
    }
  }

  async function handleImport(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    importError = '';
    importSuccess = false;

    try {
      const data = await readJSONFile(file);
      await importData(data);

      // Reload data into stores
      const [projectsData, tasksData, tagsData, entriesData] = await Promise.all([
        getAll('projects'),
        getAll('tasks'),
        getAll('tags'),
        getAll('timeEntries')
      ]);

      projects.set(projectsData);
      tasks.set(tasksData);
      tags.set(tagsData);
      timeEntries.set(entriesData);

      importSuccess = true;
      e.target.value = '';
    } catch (err) {
      importError = err.message || 'Import failed';
      e.target.value = '';
    }
  }
</script>

<div class="settings-view">
  <div class="view-header">
    <h1>Settings</h1>
  </div>

  <div class="settings-section">
    <h2>Appearance</h2>

    <div class="setting-item">
      <div class="setting-info">
        <label for="theme">Theme</label>
        <p>Choose between light and dark mode</p>
      </div>
      <select id="theme" value={theme} on:change={handleThemeChange}>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
    </div>

    <div class="setting-item">
      <div class="setting-info">
        <label>Accent Color</label>
        <p>Choose your preferred accent color</p>
      </div>
      <div class="color-picker">
        {#each accentColors as color}
          <button
            class="color-option"
            class:selected={accentColor === color}
            style="background-color: {color}"
            on:click={() => handleAccentChange(color)}
          ></button>
        {/each}
      </div>
    </div>

    <div class="setting-item">
      <div class="setting-info">
        <label for="navMode">Navigation Mode</label>
        <p>Choose how to navigate between projects</p>
      </div>
      <select id="navMode" value={navMode} on:change={handleNavModeChange}>
        <option value="sidebar">Sidebar</option>
        <option value="topnav">Top Navigation</option>
        <option value="dashboard">Dashboard Only</option>
      </select>
    </div>
  </div>

  <div class="settings-section">
    <h2>Tags</h2>
    <p class="section-description">Manage your custom tags for organizing tasks</p>
    <TagManager />
  </div>

  <div class="settings-section">
    <h2>Data Management</h2>

    <div class="setting-item">
      <div class="setting-info">
        <label>Export Data</label>
        <p>Download all your data as a JSON file</p>
      </div>
      <button class="btn-secondary" on:click={handleExport}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="7 10 12 15 17 10"/>
          <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
        Export
      </button>
    </div>

    <div class="setting-item">
      <div class="setting-info">
        <label>Import Data</label>
        <p>Restore data from a backup file (replaces existing data)</p>
      </div>
      <label class="btn-secondary file-input-label">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="17 8 12 3 7 8"/>
          <line x1="12" y1="3" x2="12" y2="15"/>
        </svg>
        Import
        <input type="file" accept=".json" on:change={handleImport} />
      </label>
    </div>

    {#if importError}
      <div class="alert error">{importError}</div>
    {/if}

    {#if importSuccess}
      <div class="alert success">Data imported successfully!</div>
    {/if}
  </div>

  <div class="settings-section">
    <h2>About</h2>
    <div class="about-content">
      <p><strong>Productivity</strong> - Personal Task Management</p>
      <p class="version">Version 1.0.0</p>
      <p class="description">A clean, minimal, and intuitive productivity app that works offline and syncs across all your devices.</p>
    </div>
  </div>
</div>

<style>
  .settings-view {
    padding: 1.5rem;
    max-width: 700px;
    margin: 0 auto;
  }

  .view-header {
    margin-bottom: 1.5rem;
  }

  .view-header h1 {
    font-size: 1.5rem;
  }

  .settings-section {
    background-color: var(--bg-primary);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 1.5rem;
    margin-bottom: 1rem;
  }

  .settings-section h2 {
    font-size: 1rem;
    margin-bottom: 0.5rem;
  }

  .section-description {
    font-size: 0.875rem;
    color: var(--text-secondary);
    margin-bottom: 1rem;
  }

  .setting-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 0;
    border-bottom: 1px solid var(--border);
  }

  .setting-item:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }

  .setting-item:first-of-type {
    padding-top: 0.5rem;
  }

  .setting-info {
    flex: 1;
  }

  .setting-info label {
    display: block;
    font-weight: 500;
    margin-bottom: 0.125rem;
  }

  .setting-info p {
    font-size: 0.75rem;
    color: var(--text-secondary);
  }

  .setting-item select {
    width: auto;
    min-width: 150px;
  }

  .color-picker {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .color-option {
    width: 28px;
    height: 28px;
    border-radius: 50%;
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

  .file-input-label {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
  }

  .file-input-label input {
    display: none;
  }

  .alert {
    padding: 0.75rem 1rem;
    border-radius: 6px;
    font-size: 0.875rem;
    margin-top: 1rem;
  }

  .alert.error {
    background-color: var(--overdue-bg);
    color: var(--danger);
    border: 1px solid var(--danger);
  }

  .alert.success {
    background-color: rgba(34, 197, 94, 0.1);
    color: var(--success);
    border: 1px solid var(--success);
  }

  .about-content {
    padding-top: 0.5rem;
  }

  .about-content p {
    margin-bottom: 0.25rem;
  }

  .version {
    font-size: 0.875rem;
    color: var(--text-secondary);
  }

  .description {
    font-size: 0.875rem;
    color: var(--text-secondary);
    margin-top: 0.5rem;
  }

  @media (max-width: 640px) {
    .settings-view {
      padding: 1rem;
    }

    .setting-item {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.75rem;
    }

    .setting-item select {
      width: 100%;
    }
  }
</style>
