import { useTodos } from '../context/TodoContext';
import './TodoFilters.css';

const TodoFilters = () => {
  const { filters, updateFilters } = useTodos();

  const handleCompletedChange = (value) => {
    let completed;
    if (value === 'all') {
      completed = undefined;
    } else if (value === 'active') {
      completed = false;
    } else {
      completed = true;
    }
    updateFilters({ completed });
  };

  const handleCategoryChange = (e) => {
    updateFilters({ category: e.target.value });
  };

  const handlePriorityChange = (e) => {
    updateFilters({ priority: e.target.value });
  };

  const handleSearchChange = (e) => {
    updateFilters({ search: e.target.value });
  };

  const handleReset = () => {
    updateFilters({
      completed: undefined,
      category: '',
      priority: '',
      search: ''
    });
  };

  const activeFilterCount = [
    filters.completed !== undefined,
    filters.category,
    filters.priority,
    filters.search
  ].filter(Boolean).length;

  return (
    <div className="todo-filters">
      <div className="filters-header">
        <h3>フィルター</h3>
        {activeFilterCount > 0 && (
          <button className="btn-reset" onClick={handleReset}>
            リセット ({activeFilterCount})
          </button>
        )}
      </div>

      <div className="filters-grid">
        <div className="filter-group">
          <label>検索</label>
          <input
            type="text"
            placeholder="タイトルや説明で検索..."
            value={filters.search || ''}
            onChange={handleSearchChange}
          />
        </div>

        <div className="filter-group">
          <label>状態</label>
          <div className="filter-buttons">
            <button
              className={`filter-btn ${
                filters.completed === undefined ? 'active' : ''
              }`}
              onClick={() => handleCompletedChange('all')}
            >
              すべて
            </button>
            <button
              className={`filter-btn ${
                filters.completed === false ? 'active' : ''
              }`}
              onClick={() => handleCompletedChange('active')}
            >
              未完了
            </button>
            <button
              className={`filter-btn ${
                filters.completed === true ? 'active' : ''
              }`}
              onClick={() => handleCompletedChange('completed')}
            >
              完了
            </button>
          </div>
        </div>

        <div className="filter-group">
          <label>カテゴリ</label>
          <select value={filters.category || ''} onChange={handleCategoryChange}>
            <option value="">すべて</option>
            <option value="work">仕事</option>
            <option value="personal">個人</option>
            <option value="shopping">買い物</option>
            <option value="health">健康</option>
            <option value="other">その他</option>
          </select>
        </div>

        <div className="filter-group">
          <label>優先度</label>
          <select value={filters.priority || ''} onChange={handlePriorityChange}>
            <option value="">すべて</option>
            <option value="urgent">緊急</option>
            <option value="high">高</option>
            <option value="medium">中</option>
            <option value="low">低</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default TodoFilters;
