import { useState } from 'react';
import { useTodos } from '../context/TodoContext';
import './TodoForm.css';

const TodoForm = ({ onClose }) => {
  const { addTodo, error, setError } = useTodos();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'other',
    priority: 'medium'
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      setError('タイトルを入力してください');
      return;
    }

    setSubmitting(true);
    try {
      await addTodo(formData);
      setFormData({
        title: '',
        description: '',
        category: 'other',
        priority: 'medium'
      });
      if (onClose) onClose();
    } catch (err) {
      console.error('Failed to add todo:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="todo-form" onSubmit={handleSubmit}>
      <h3>新しいTODOを追加</h3>

      <div className="form-group">
        <label htmlFor="title">タイトル *</label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="タスクのタイトルを入力"
          required
          maxLength={200}
        />
      </div>

      <div className="form-group">
        <label htmlFor="description">説明</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="タスクの詳細を入力（任意）"
          rows={3}
          maxLength={1000}
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="category">カテゴリ</label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
          >
            <option value="work">仕事</option>
            <option value="personal">個人</option>
            <option value="shopping">買い物</option>
            <option value="health">健康</option>
            <option value="other">その他</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="priority">優先度</label>
          <select
            id="priority"
            name="priority"
            value={formData.priority}
            onChange={handleChange}
          >
            <option value="low">低</option>
            <option value="medium">中</option>
            <option value="high">高</option>
            <option value="urgent">緊急</option>
          </select>
        </div>
      </div>

      <div className="form-actions">
        {onClose && (
          <button type="button" onClick={onClose} className="btn btn-cancel">
            キャンセル
          </button>
        )}
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? '追加中...' : '追加'}
        </button>
      </div>
    </form>
  );
};

export default TodoForm;
