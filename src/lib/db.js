const DB_NAME = 'productivity-db';
const DB_VERSION = 1;

let db = null;

export async function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = event.target.result;

      // Projects store
      if (!database.objectStoreNames.contains('projects')) {
        const projectStore = database.createObjectStore('projects', { keyPath: 'id' });
        projectStore.createIndex('name', 'name', { unique: false });
        projectStore.createIndex('createdAt', 'createdAt', { unique: false });
      }

      // Tasks store
      if (!database.objectStoreNames.contains('tasks')) {
        const taskStore = database.createObjectStore('tasks', { keyPath: 'id' });
        taskStore.createIndex('projectId', 'projectId', { unique: false });
        taskStore.createIndex('columnId', 'columnId', { unique: false });
        taskStore.createIndex('dueDate', 'dueDate', { unique: false });
        taskStore.createIndex('completed', 'completed', { unique: false });
      }

      // Tags store
      if (!database.objectStoreNames.contains('tags')) {
        database.createObjectStore('tags', { keyPath: 'id' });
      }

      // Time entries store
      if (!database.objectStoreNames.contains('timeEntries')) {
        const timeStore = database.createObjectStore('timeEntries', { keyPath: 'id' });
        timeStore.createIndex('taskId', 'taskId', { unique: false });
        timeStore.createIndex('projectId', 'projectId', { unique: false });
        timeStore.createIndex('startTime', 'startTime', { unique: false });
      }

      // Settings store
      if (!database.objectStoreNames.contains('settings')) {
        database.createObjectStore('settings', { keyPath: 'key' });
      }
    };
  });
}

function getStore(storeName, mode = 'readonly') {
  const transaction = db.transaction(storeName, mode);
  return transaction.objectStore(storeName);
}

// Generic CRUD operations
export async function getAll(storeName) {
  return new Promise((resolve, reject) => {
    const store = getStore(storeName);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function get(storeName, id) {
  return new Promise((resolve, reject) => {
    const store = getStore(storeName);
    const request = store.get(id);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function put(storeName, item) {
  return new Promise((resolve, reject) => {
    const store = getStore(storeName, 'readwrite');
    const request = store.put(item);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function remove(storeName, id) {
  return new Promise((resolve, reject) => {
    const store = getStore(storeName, 'readwrite');
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function clear(storeName) {
  return new Promise((resolve, reject) => {
    const store = getStore(storeName, 'readwrite');
    const request = store.clear();
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function getByIndex(storeName, indexName, value) {
  return new Promise((resolve, reject) => {
    const store = getStore(storeName);
    const index = store.index(indexName);
    const request = index.getAll(value);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Export all data
export async function exportData() {
  const projects = await getAll('projects');
  const tasks = await getAll('tasks');
  const tags = await getAll('tags');
  const timeEntries = await getAll('timeEntries');
  const settings = await getAll('settings');

  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    data: { projects, tasks, tags, timeEntries, settings }
  };
}

// Import data (replaces existing)
export async function importData(data) {
  if (!data || !data.data) throw new Error('Invalid data format');

  const { projects, tasks, tags, timeEntries, settings } = data.data;

  // Clear existing data
  await clear('projects');
  await clear('tasks');
  await clear('tags');
  await clear('timeEntries');
  await clear('settings');

  // Import new data
  for (const item of projects || []) await put('projects', item);
  for (const item of tasks || []) await put('tasks', item);
  for (const item of tags || []) await put('tags', item);
  for (const item of timeEntries || []) await put('timeEntries', item);
  for (const item of settings || []) await put('settings', item);
}
