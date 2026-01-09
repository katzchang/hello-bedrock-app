import { useState } from 'react';
import { useTodos } from '../context/TodoContext';
import './AIAssistant.css';

const AIAssistant = () => {
  const { generateTasks, addTodo, aiLoading } = useTodos();
  const [description, setDescription] = useState('');
  const [generatedTasks, setGeneratedTasks] = useState([]);
  const [showResults, setShowResults] = useState(false);

  const handleGenerate = async (e) => {
    e.preventDefault();

    if (!description.trim()) {
      alert('目標を入力してください');
      return;
    }

    try {
      const tasks = await generateTasks(description);
      setGeneratedTasks(tasks);
      setShowResults(true);
    } catch (err) {
      console.error('Failed to generate tasks:', err);
      alert('タスクの生成に失敗しました。AWS認証情報を確認してください。');
    }
  };

  const handleAddTask = async (task) => {
    try {
      await addTodo({
        title: task.title,
        description: task.description || '',
        category: task.estimatedCategory || 'other',
        priority: task.estimatedPriority || 'medium'
      });
      alert('タスクを追加しました！');
    } catch (err) {
      console.error('Failed to add task:', err);
      alert('タスクの追加に失敗しました');
    }
  };

  const handleAddAll = async () => {
    try {
      for (const task of generatedTasks) {
        await addTodo({
          title: task.title,
          description: task.description || '',
          category: task.estimatedCategory || 'other',
          priority: task.estimatedPriority || 'medium'
        });
      }
      alert(`${generatedTasks.length}件のタスクを追加しました！`);
      setGeneratedTasks([]);
      setShowResults(false);
      setDescription('');
    } catch (err) {
      console.error('Failed to add tasks:', err);
      alert('タスクの追加に失敗しました');
    }
  };

  const handleReset = () => {
    setGeneratedTasks([]);
    setShowResults(false);
    setDescription('');
  };

  return (
    <div className="ai-assistant">
      <div className="ai-header">
        <h3>🤖 AI アシスタント</h3>
        <p>目標を入力すると、AIが関連するタスクを自動生成します</p>
      </div>

      <form onSubmit={handleGenerate} className="ai-form">
        <div className="form-group">
          <label htmlFor="ai-description">目標・プロジェクト</label>
          <textarea
            id="ai-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="例: 誕生日パーティーを企画する"
            rows={3}
            disabled={aiLoading}
          />
        </div>

        <button
          type="submit"
          className="btn btn-ai"
          disabled={aiLoading || !description.trim()}
        >
          {aiLoading ? '生成中...' : 'タスクを生成'}
        </button>
      </form>

      {showResults && generatedTasks.length > 0 && (
        <div className="ai-results">
          <div className="results-header">
            <h4>生成されたタスク ({generatedTasks.length}件)</h4>
            <div className="results-actions">
              <button className="btn btn-small btn-primary" onClick={handleAddAll}>
                すべて追加
              </button>
              <button className="btn btn-small btn-cancel" onClick={handleReset}>
                クリア
              </button>
            </div>
          </div>

          <div className="generated-tasks">
            {generatedTasks.map((task, index) => (
              <div key={index} className="generated-task">
                <div className="task-content">
                  <h5>{task.title}</h5>
                  {task.description && <p>{task.description}</p>}
                  <div className="task-meta">
                    <span className="badge badge-category">
                      {task.estimatedCategory}
                    </span>
                    <span className="badge badge-priority">
                      {task.estimatedPriority}
                    </span>
                  </div>
                </div>
                <button
                  className="btn btn-small btn-add"
                  onClick={() => handleAddTask(task)}
                >
                  追加
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {aiLoading && (
        <div className="ai-loading">
          <div className="spinner"></div>
          <p>AIがタスクを生成中...</p>
        </div>
      )}
    </div>
  );
};

export default AIAssistant;
