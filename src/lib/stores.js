import { writable, derived } from 'svelte/store';

// Core data stores
export const projects = writable([]);
export const tasks = writable([]);
export const tags = writable([]);
export const timeEntries = writable([]);

// Navigation/UI state
export const currentRoute = writable({ path: '/', params: {} });
export const currentProjectId = writable(null);
export const editingTask = writable(null);
export const showTaskModal = writable(false);

// Timer state
export const timerState = writable({
  isRunning: false,
  isPaused: false,
  startTime: null,
  pausedTime: 0,
  taskId: null,
  projectId: null,
  customTitle: ''
});

// Settings
export const settings = writable({
  theme: 'light',
  accentColor: '#4a90d9',
  navMode: 'sidebar'
});

// Derived stores
export const currentProject = derived(
  [projects, currentProjectId],
  ([$projects, $currentProjectId]) => {
    return $projects.find(p => p.id === $currentProjectId) || null;
  }
);

export const currentProjectTasks = derived(
  [tasks, currentProjectId],
  ([$tasks, $currentProjectId]) => {
    return $tasks.filter(t => t.projectId === $currentProjectId);
  }
);

export const todayTasks = derived(
  [tasks, projects],
  ([$tasks, $projects]) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];

    return $tasks
      .filter(t => !t.completed && t.dueDate && t.dueDate.split('T')[0] === todayStr)
      .map(t => ({
        ...t,
        project: $projects.find(p => p.id === t.projectId)
      }));
  }
);

export const upcomingTasks = derived(
  [tasks, projects],
  ([$tasks, $projects]) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    return $tasks
      .filter(t => {
        if (t.completed || !t.dueDate) return false;
        const dueDate = new Date(t.dueDate);
        return dueDate > today && dueDate <= nextWeek;
      })
      .map(t => ({
        ...t,
        project: $projects.find(p => p.id === t.projectId)
      }))
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  }
);

export const overdueTasks = derived(
  [tasks],
  ([$tasks]) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return $tasks.filter(t => {
      if (t.completed || !t.dueDate) return false;
      return new Date(t.dueDate) < today;
    });
  }
);

// Helper to get tasks by column
export function getTasksByColumn(columnId) {
  return derived(currentProjectTasks, ($tasks) => {
    return $tasks
      .filter(t => t.columnId === columnId)
      .sort((a, b) => a.order - b.order);
  });
}
