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
  const {
    toggleComplete,
    deleteTodo,
    recommendations,
    todos,
    executionGuides,
    generateExecutionGuide,
    completionMessage,
    setCompletionMessage,
    staleTasksInfo,
    contextSearchResults,
    searchTaskContext
  } = useTodos();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showExecutionGuide, setShowExecutionGuide] = useState(false);
  const [isLoadingGuide, setIsLoadingGuide] = useState(false);
  const [showContextSearch, setShowContextSearch] = useState(false);
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);

  const getDaysSinceUpdate = () => {
    const updatedAt = new Date(todo.updatedAt || todo.createdAt);
    const now = new Date();
    return Math.floor((now - updatedAt) / (1000 * 60 * 60 * 24));
  };

  const isStale = () => {
    return !todo.completed && getDaysSinceUpdate() >= 7;
  };

  const showCompletionOverlay = completionMessage && completionMessage.todoId === todo.id;

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

  const handleGenerateGuide = async () => {
    if (executionGuides[todo.id]) {
      setShowExecutionGuide(!showExecutionGuide);
      return;
    }

    setIsLoadingGuide(true);
    try {
      await generateExecutionGuide(todo);
      setShowExecutionGuide(true);
    } catch (err) {
      console.error('Failed to generate execution guide:', err);
    } finally {
      setIsLoadingGuide(false);
    }
  };

  const handleSearchContext = async () => {
    if (contextSearchResults[todo.id]) {
      setShowContextSearch(!showContextSearch);
      return;
    }

    setIsLoadingSearch(true);
    try {
      await searchTaskContext(todo);
      setShowContextSearch(true);
    } catch (err) {
      console.error('Failed to search context:', err);
    } finally {
      setIsLoadingSearch(false);
    }
  };

  const getDependencies = () => {
    if (!recommendations?.dependencies) return null;
    const dep = recommendations.dependencies.find(d => d.taskId === todo.id);
    return dep;
  };

  const getTaskTitle = (taskId) => {
    const task = todos.find(t => t.id === taskId);
    return task ? task.title : taskId;
  };

  const dependency = getDependencies();

  return (
    <div className={`todo-item ${todo.completed ? 'completed' : ''} ${isDeleting ? 'deleting' : ''} ${isStale() ? 'stale' : ''}`}>
      {showCompletionOverlay && (
        <div className="completion-overlay">
          <div className="completion-content">
            <div className="completion-emoji">{completionMessage.emoji}</div>
            <p className="completion-message">{completionMessage.message}</p>
            <p className="completion-encouragement">{completionMessage.encouragement}</p>
            <button
              className="btn-close-overlay"
              onClick={() => setCompletionMessage(null)}
              title="閉じる"
            >
              ✕
            </button>
          </div>
        </div>
      )}

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

          {isStale() && (
            <span className="stale-badge" title={`${getDaysSinceUpdate()}日間未更新`}>
              ⚠️ {getDaysSinceUpdate()}日間未更新
            </span>
          )}

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

        {dependency && dependency.dependsOn.length > 0 && (
          <div className="todo-dependencies">
            <span className="dep-icon">⚠</span>
            <div className="dep-info">
              <strong>依存タスク:</strong>
              <ul className="dep-tasks">
                {dependency.dependsOn.map(depId => (
                  <li key={depId}>{getTaskTitle(depId)}</li>
                ))}
              </ul>
              <p className="dep-reason">{dependency.reasoning}</p>
            </div>
          </div>
        )}

        {isStale() && staleTasksInfo && staleTasksInfo.taskMessages[todo.id] && (
          <div className="stale-message">
            <span className="stale-icon">💭</span>
            <div className="stale-content">
              <p>{staleTasksInfo.taskMessages[todo.id]}</p>
            </div>
          </div>
        )}

        <div className="todo-footer">
          <span className="todo-date">
            作成: {new Date(todo.createdAt).toLocaleDateString('ja-JP')}
          </span>
          {todo.completedAt && (
            <span className="todo-date">
              完了: {new Date(todo.completedAt).toLocaleDateString('ja-JP')}
            </span>
          )}
          {!todo.completed && (
            <div className="todo-actions-footer">
              <button
                className="btn-guide"
                onClick={handleGenerateGuide}
                disabled={isLoadingGuide}
                title="実行手順を生成"
              >
                {isLoadingGuide ? '生成中...' : executionGuides[todo.id] ? (showExecutionGuide ? '📋 手順を閉じる' : '📋 手順を表示') : '📋 手順を生成'}
              </button>
              <button
                className="btn-search"
                onClick={handleSearchContext}
                disabled={isLoadingSearch}
                title="情報を検索"
              >
                {isLoadingSearch ? '検索中...' : contextSearchResults[todo.id] ? (showContextSearch ? '🔍 検索を閉じる' : '🔍 検索を表示') : '🔍 情報検索'}
              </button>
            </div>
          )}
        </div>

        {showExecutionGuide && executionGuides[todo.id] && (
          <div className="execution-guide-section">
            <h4>📋 実行手順ガイド</h4>

            {executionGuides[todo.id].prerequisites && executionGuides[todo.id].prerequisites.length > 0 && (
              <div className="guide-prerequisites">
                <strong>事前準備:</strong>
                <ul>
                  {executionGuides[todo.id].prerequisites.map((prereq, index) => (
                    <li key={index}>{prereq}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="guide-steps">
              {executionGuides[todo.id].steps.map((step) => (
                <div key={step.stepNumber} className="guide-step">
                  <div className="step-header">
                    <span className="step-number">ステップ {step.stepNumber}</span>
                    <span className="step-time">⏱️ {step.estimatedTime}</span>
                  </div>
                  <p className="step-instruction">{step.instruction}</p>
                  {step.tips && (
                    <p className="step-tips">💡 <em>{step.tips}</em></p>
                  )}
                </div>
              ))}
            </div>

            <div className="guide-footer">
              <p className="guide-total-time">
                <strong>合計推定時間:</strong> {executionGuides[todo.id].totalEstimatedTime}
              </p>
              {executionGuides[todo.id].successCriteria && (
                <p className="guide-success">
                  <strong>完了基準:</strong> {executionGuides[todo.id].successCriteria}
                </p>
              )}
            </div>
          </div>
        )}

        {showContextSearch && contextSearchResults[todo.id] && (
          <div className="context-search-section">
            <h4>🔍 コンテキスト情報</h4>

            <div className="search-header">
              <p className="search-query">
                <strong>検索クエリ:</strong> {contextSearchResults[todo.id].optimizedQuery}
              </p>
              <p className="search-meta">
                検索結果: {contextSearchResults[todo.id].results.length}件 / 検索時間: {contextSearchResults[todo.id].searchTime}秒
              </p>
            </div>

            <div className="search-results">
              {contextSearchResults[todo.id].results.length > 0 ? (
                contextSearchResults[todo.id].results.map((result, index) => (
                  <div key={index} className="search-result-item">
                    <h5 className="result-title">
                      <a href={result.link} target="_blank" rel="noopener noreferrer">
                        {result.title}
                      </a>
                    </h5>
                    <p className="result-snippet">{result.snippet}</p>
                    <span className="result-link">{result.displayLink}</span>
                  </div>
                ))
              ) : (
                <p className="no-results">検索結果が見つかりませんでした</p>
              )}
            </div>
          </div>
        )}
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
