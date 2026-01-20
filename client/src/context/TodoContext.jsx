import { createContext, useState, useEffect, useContext } from 'react';
import { todosAPI, aiAPI, searchAPI } from '../services/api';

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
  const [recommendations, setRecommendations] = useState(null);
  const [executionGuides, setExecutionGuides] = useState({});
  const [completionMessage, setCompletionMessage] = useState(null);
  const [staleTasksInfo, setStaleTasksInfo] = useState(null);
  const [contextSearchResults, setContextSearchResults] = useState({});
  const [searchLoading, setSearchLoading] = useState(false);

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

  useEffect(() => {
    if (todos.length > 0) {
      checkStaleTasks();
    }
  }, [todos.length]);

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
      const updatedTodo = response.data;

      setTodos((prev) =>
        prev.map((todo) => (todo.id === id ? updatedTodo : todo))
      );

      // Generate completion message when task is marked as complete
      if (updatedTodo.completed && !completionMessage) {
        try {
          const messageResponse = await aiAPI.generateCompletionMessage(
            updatedTodo.title,
            updatedTodo.description || '',
            updatedTodo.category || 'other'
          );
          setCompletionMessage({ todoId: id, ...messageResponse.data });

          // Auto-hide after 5 seconds
          setTimeout(() => {
            setCompletionMessage(null);
          }, 5000);
        } catch (messageErr) {
          console.error('Failed to generate completion message:', messageErr);
          // Don't throw - completion message is optional
        }
      }
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

  const generateExecutionGuide = async (todo) => {
    setAiLoading(true);
    try {
      const response = await aiAPI.generateExecutionGuide(
        todo.title,
        todo.description || '',
        todo.category || 'other',
        todo.priority || 'medium'
      );
      setExecutionGuides((prev) => ({
        ...prev,
        [todo.id]: response.data
      }));
      return response.data;
    } catch (err) {
      setError('実行手順の生成に失敗しました');
      throw err;
    } finally {
      setAiLoading(false);
    }
  };

  const checkStaleTasks = async () => {
    if (todos.length === 0) {
      setStaleTasksInfo(null);
      return;
    }

    try {
      const response = await aiAPI.detectStaleTasks(todos);
      if (response.data.staleTasks.length > 0) {
        setStaleTasksInfo(response.data);
      } else {
        setStaleTasksInfo(null);
      }
    } catch (err) {
      console.error('Failed to check stale tasks:', err);
      // Don't set error - this is a background check
    }
  };

  const searchTaskContext = async (todo) => {
    setSearchLoading(true);
    try {
      const response = await searchAPI.searchTaskContext(
        todo.title,
        todo.description || '',
        5
      );
      setContextSearchResults((prev) => ({
        ...prev,
        [todo.id]: response.data
      }));
      return response.data;
    } catch (err) {
      setError('コンテキスト検索に失敗しました');
      throw err;
    } finally {
      setSearchLoading(false);
    }
  };

  const getRecommendations = async () => {
    setAiLoading(true);
    try {
      const response = await aiAPI.recommendTasks(todos);
      setRecommendations(response.data);
      return response.data;
    } catch (err) {
      setError('タスク推薦の取得に失敗しました');
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
    recommendations,
    executionGuides,
    completionMessage,
    staleTasksInfo,
    contextSearchResults,
    searchLoading,
    fetchTodos,
    addTodo,
    updateTodo,
    deleteTodo,
    toggleComplete,
    generateTasks,
    classifyTask,
    setPriorityAI,
    generateExecutionGuide,
    checkStaleTasks,
    searchTaskContext,
    getRecommendations,
    setRecommendations,
    setCompletionMessage,
    updateFilters,
    setError
  };

  return <TodoContext.Provider value={value}>{children}</TodoContext.Provider>;
};
