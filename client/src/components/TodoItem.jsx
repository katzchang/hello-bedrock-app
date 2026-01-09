import { useState } from 'react';
import { useTodos } from '../context/TodoContext';
import './TodoItem.css';

const CategoryBadge = ({ category }) => {
  const categoryLabels = {
    work: '仕事',
    personal: '個人',
    shopping: '買い物',
    health: '健康',
    other: 'その他'
  };

  return <span className={`badge badge-category badge-${category}`}>
    {categoryLabels[category] || category}
  </span>;
};

const PriorityBadge = ({ priority }) => {
  const priorityLabels = {
    low: '低',
    medium: '中',
    high: '高',
    urgent: '緊急'
  };

  return <span className={`badge badge-priority badge-${priority}`}>
    {priorityLabels[priority] || priority}
  </span>;
};

const TodoItem = ({ todo }) => {
  const { toggleComplete, deleteTodo } = useTodos();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleToggle = async () => {
    try {
      await toggleComplete(todo.id);
    } catch (err) {
      console.error('Failed to toggle todo:', err);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('このTODOを削除してもよろしいですか？')) {
      setIsDeleting(true);
      try {
        await deleteTodo(todo.id);
      } catch (err) {
        console.error('Failed to delete todo:', err);
        setIsDeleting(false);
      }
    }
  };

  return (
    <div className={`todo-item ${todo.completed ? 'completed' : ''} ${isDeleting ? 'deleting' : ''}`}>
      <div className="todo-checkbox">
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={handleToggle}
          id={`todo-${todo.id}`}
        />
        <label htmlFor={`todo-${todo.id}`}></label>
      </div>

      <div className="todo-content">
        <h3 className="todo-title">{todo.title}</h3>
        {todo.description && (
          <p className="todo-description">{todo.description}</p>
        )}

        <div className="todo-meta">
          <CategoryBadge category={todo.category} />
          <PriorityBadge priority={todo.priority} />

          {todo.tags && todo.tags.length > 0 && (
            <div className="todo-tags">
              {todo.tags.map((tag, index) => (
                <span key={index} className="badge badge-tag">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="todo-footer">
          <span className="todo-date">
            作成: {new Date(todo.createdAt).toLocaleDateString('ja-JP')}
          </span>
          {todo.completedAt && (
            <span className="todo-date">
              完了: {new Date(todo.completedAt).toLocaleDateString('ja-JP')}
            </span>
          )}
        </div>
      </div>

      <div className="todo-actions">
        <button
          className="btn-icon btn-delete"
          onClick={handleDelete}
          disabled={isDeleting}
          title="削除"
        >
          🗑️
        </button>
      </div>
    </div>
  );
};

export default TodoItem;
