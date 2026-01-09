import { useTodos } from '../context/TodoContext';
import TodoItem from './TodoItem';
import './TodoList.css';

const TodoList = () => {
  const { todos, loading, error } = useTodos();

  if (loading) {
    return (
      <div className="todo-list-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="todo-list-container">
        <div className="error-state">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (todos.length === 0) {
    return (
      <div className="todo-list-container">
        <div className="empty-state">
          <h3>TODOがありません</h3>
          <p>新しいTODOを追加して始めましょう！</p>
        </div>
      </div>
    );
  }

  const completedCount = todos.filter((t) => t.completed).length;
  const totalCount = todos.length;

  return (
    <div className="todo-list-container">
      <div className="todo-list-header">
        <h2>TODO一覧</h2>
        <div className="todo-stats">
          <span className="stat-item">
            全体: <strong>{totalCount}</strong>
          </span>
          <span className="stat-item">
            完了: <strong>{completedCount}</strong>
          </span>
          <span className="stat-item">
            未完了: <strong>{totalCount - completedCount}</strong>
          </span>
        </div>
      </div>

      <div className="todo-list">
        {todos.map((todo) => (
          <TodoItem key={todo.id} todo={todo} />
        ))}
      </div>
    </div>
  );
};

export default TodoList;
