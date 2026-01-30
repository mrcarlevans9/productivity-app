// Generate unique ID
export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Date utilities
export function isToday(dateStr) {
  if (!dateStr) return false;
  const date = new Date(dateStr);
  const today = new Date();
  return date.toDateString() === today.toDateString();
}

export function isOverdue(dateStr) {
  if (!dateStr) return false;
  const date = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
}

export function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
  });
}

export function formatTime(ms) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  const pad = (n) => n.toString().padStart(2, '0');

  if (hours > 0) {
    return `${pad(hours)}:${pad(minutes % 60)}:${pad(seconds % 60)}`;
  }
  return `${pad(minutes)}:${pad(seconds % 60)}`;
}

export function formatDuration(ms) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  }
  if (minutes > 0) {
    return `${minutes}m`;
  }
  return `${seconds}s`;
}

// Calculate next due date for recurring tasks
export function getNextDueDate(currentDueDate, recurring) {
  if (!recurring || !recurring.enabled || !currentDueDate) return null;

  const date = new Date(currentDueDate);
  const { interval, unit } = recurring;

  switch (unit) {
    case 'day':
      date.setDate(date.getDate() + interval);
      break;
    case 'week':
      date.setDate(date.getDate() + (interval * 7));
      break;
    case 'month':
      date.setMonth(date.getMonth() + interval);
      break;
    default:
      return null;
  }

  return date.toISOString().split('T')[0];
}

// Priority colors
export const priorityColors = {
  high: '#ef4444',
  medium: '#f59e0b',
  low: '#22c55e'
};

// Default columns for quick start
export const defaultColumns = [
  { id: generateId(), name: 'To Do', order: 0 },
  { id: generateId(), name: 'In Progress', order: 1 },
  { id: generateId(), name: 'Done', order: 2 }
];

// Create new project
export function createProject(name, columns = null) {
  return {
    id: generateId(),
    name,
    columns: columns || defaultColumns.map((c, i) => ({ ...c, id: generateId(), order: i })),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

// Create new task
export function createTask(projectId, columnId, title) {
  return {
    id: generateId(),
    projectId,
    columnId,
    previousColumnId: null,
    title,
    description: '',
    subtasks: [],
    tags: [],
    dueDate: null,
    priority: null,
    recurring: null,
    completed: false,
    completedAt: null,
    order: Date.now(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

// Create new tag
export function createTag(name, color) {
  return {
    id: generateId(),
    name,
    color
  };
}

// Create time entry
export function createTimeEntry(taskId, projectId, customTitle, startTime, endTime) {
  return {
    id: generateId(),
    taskId,
    projectId,
    customTitle,
    startTime,
    endTime,
    duration: endTime - startTime
  };
}

// Download JSON file
export function downloadJSON(data, filename) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Read JSON file
export function readJSONFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        resolve(data);
      } catch (err) {
        reject(new Error('Invalid JSON file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}
