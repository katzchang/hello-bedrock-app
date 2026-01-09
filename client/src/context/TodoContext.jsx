import { createContext, useState, useEffect, useContext } from 'react';
import { todosAPI, aiAPI } from '../services/api';

const TodoContext = createContext();

export const useTodos = () => {
  const context = useContext(TodoContext);
  if (!context) {
    throw new Error('useTodos must be used within a TodoProvider');
  }
  return context;
};

export const TodoProvider = ({ children }) => {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  const [filters, setFilters] = useState({
    completed: undefined,
    category: '',
    priority: '',
    search: ''
  });

  const fetchTodos = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await todosAPI.getAll(filters);
      setTodos(response.data);
    } catch (err) {
      setError('TODOの読み込みに失敗しました');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, [filters.completed, filters.category, filters.priority]);

  const addTodo = async (todoData) => {
    try {
      const response = await todosAPI.create(todoData);
      setTodos((prev) => [response.data, ...prev]);
      return response.data;
    } catch (err) {
      setError('TODOの作成に失敗しました');
      throw err;
    }
  };

  const updateTodo = async (id, updates) => {
    try {
      const response = await todosAPI.update(id, updates);
      setTodos((prev) =>
        prev.map((todo) => (todo.id === id ? response.data : todo))
      );
      return response.data;
    } catch (err) {
      setError('TODOの更新に失敗しました');
      throw err;
    }
  };

  const deleteTodo = async (id) => {
    try {
      await todosAPI.delete(id);
      setTodos((prev) => prev.filter((todo) => todo.id !== id));
    } catch (err) {
      setError('TODOの削除に失敗しました');
      throw err;
    }
  };

  const toggleComplete = async (id) => {
    try {
      const response = await todosAPI.toggleComplete(id);
      setTodos((prev) =>
        prev.map((todo) => (todo.id === id ? response.data : todo))
      );
    } catch (err) {
      setError('完了状態の切り替えに失敗しました');
      throw err;
    }
  };

  const generateTasks = async (description) => {
    setAiLoading(true);
    try {
      const response = await aiAPI.generateTasks(description);
      return response.data.tasks;
    } catch (err) {
      setError('タスクの生成に失敗しました');
      throw err;
    } finally {
      setAiLoading(false);
    }
  };

  const classifyTask = async (title, description) => {
    setAiLoading(true);
    try {
      const response = await aiAPI.classifyTask(title, description);
      return response.data;
    } catch (err) {
      setError('タスクの分類に失敗しました');
      throw err;
    } finally {
      setAiLoading(false);
    }
  };

  const setPriorityAI = async (title, description, deadline) => {
    setAiLoading(true);
    try {
      const response = await aiAPI.setPriority(title, description, deadline);
      return response.data;
    } catch (err) {
      setError('優先度の設定に失敗しました');
      throw err;
    } finally {
      setAiLoading(false);
    }
  };

  const updateFilters = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const getFilteredTodos = () => {
    let filtered = todos;

    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(
        (todo) =>
          todo.title.toLowerCase().includes(search) ||
          (todo.description && todo.description.toLowerCase().includes(search))
      );
    }

    return filtered;
  };

  const value = {
    todos: getFilteredTodos(),
    loading,
    error,
    aiLoading,
    filters,
    fetchTodos,
    addTodo,
    updateTodo,
    deleteTodo,
    toggleComplete,
    generateTasks,
    classifyTask,
    setPriorityAI,
    updateFilters,
    setError
  };

  return <TodoContext.Provider value={value}>{children}</TodoContext.Provider>;
};
