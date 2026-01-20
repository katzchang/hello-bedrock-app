import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export const todosAPI = {
  getAll: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.completed !== undefined) params.append('completed', filters.completed);
    if (filters.category) params.append('category', filters.category);
    if (filters.priority) params.append('priority', filters.priority);

    return api.get(`/todos?${params.toString()}`);
  },

  getById: (id) => api.get(`/todos/${id}`),

  create: (data) => api.post('/todos', data),

  update: (id, data) => api.put(`/todos/${id}`, data),

  delete: (id) => api.delete(`/todos/${id}`),

  toggleComplete: (id) => api.patch(`/todos/${id}/complete`)
};

export const aiAPI = {
  generateTasks: (description) => api.post('/ai/generate-tasks', { description }),

  classifyTask: (title, description) => api.post('/ai/classify-task', { title, description }),

  setPriority: (title, description, deadline) =>
    api.post('/ai/set-priority', { title, description, deadline }),

  generateExecutionGuide: (title, description, category, priority) =>
    api.post('/ai/generate-execution-guide', { title, description, category, priority }),

  generateCompletionMessage: (title, description, category) =>
    api.post('/ai/generate-completion-message', { title, description, category }),

  detectStaleTasks: (todos) => api.post('/ai/detect-stale-tasks', { todos }),

  recommendTasks: (todos) => api.post('/ai/recommend-tasks', { todos })
};

export const searchAPI = {
  searchTaskContext: (title, description, numResults = 5) =>
    api.post('/search/task-context', { title, description, numResults })
};

export default api;
