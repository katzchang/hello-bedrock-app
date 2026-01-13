import { useState } from 'react';
import { useTodos } from '../context/TodoContext';
import './TaskRecommendations.css';

const TaskRecommendations = () => {
  const { todos, recommendations, getRecommendations, aiLoading, setRecommendations } = useTodos();
  const [showPanel, setShowPanel] = useState(false);

  const handleGetRecommendations = async () => {
    try {
      await getRecommendations();
      setShowPanel(true);
    } catch (err) {
      console.error('Failed to get recommendations:', err);
      alert('推薦タスクの取得に失敗しました');
    }
  };

  const handleClose = () => {
    setShowPanel(false);
    setRecommendations(null);
  };

  const getDependenciesForTask = (taskId) => {
    if (!recommendations?.dependencies) return [];
    const dep = recommendations.dependencies.find(d => d.taskId === taskId);
    return dep ? dep.dependsOn : [];
  };

  const getTaskTitle = (taskId) => {
    const task = todos.find(t => t.id === taskId);
    return task ? task.title : 'Unknown Task';
  };

  const incompleteTodos = todos.filter(t => !t.completed);

  return (
    <div className="task-recommendations">
      <button
        className="btn btn-ai"
        onClick={handleGetRecommendations}
        disabled={aiLoading || incompleteTodos.length === 0}
      >
        {aiLoading ? '分析中...' : '🎯 次のタスクを推薦'}
      </button>

      {showPanel && recommendations && (
        <div className="recommendations-panel">
          <div className="panel-header">
            <h3>📋 推薦タスク</h3>
            <button className="btn-close" onClick={handleClose}>✕</button>
          </div>

          {recommendations.insights && (
            <div className="insights-section">
              <p className="insights">{recommendations.insights}</p>
            </div>
          )}

          <div className="recommendations-list">
            <h4>優先的に取り組むべきタスク</h4>
            {recommendations.recommendations?.map((rec, index) => {
              const deps = getDependenciesForTask(rec.taskId);
              return (
                <div key={rec.taskId} className="recommendation-item">
                  <div className="rank-badge">{index + 1}</div>
                  <div className="rec-content">
                    <h5>{rec.title}</h5>
                    <p className="reason">{rec.reason}</p>
                    <div className="rec-meta">
                      <span className="score">スコア: {rec.score}</span>
                      {deps.length > 0 && (
                        <div className="dependencies-info">
                          <span className="dep-label">⚠ 依存タスク:</span>
                          <ul className="dep-list">
                            {deps.map(depId => (
                              <li key={depId}>{getTaskTitle(depId)}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {deps.length === 0 && (
                        <span className="no-blockers">✓ すぐに着手可能</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {recommendations.dependencies?.length > 0 && (
            <div className="dependencies-section">
              <h4>タスク依存関係</h4>
              <div className="dependencies-graph">
                {recommendations.dependencies.map(dep => (
                  <div key={dep.taskId} className="dependency-item">
                    <div className="dep-main-task">
                      {getTaskTitle(dep.taskId)}
                    </div>
                    <div className="dep-arrow">←</div>
                    <div className="dep-required-tasks">
                      {dep.dependsOn.map(reqId => (
                        <div key={reqId} className="required-task">
                          {getTaskTitle(reqId)}
                        </div>
                      ))}
                    </div>
                    <p className="dep-reasoning">{dep.reasoning}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {aiLoading && (
        <div className="ai-loading">
          <div className="spinner"></div>
          <p>AIがタスクを分析中...</p>
        </div>
      )}
    </div>
  );
};

export default TaskRecommendations;
