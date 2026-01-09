import { useState } from 'react';
import './App.css';
import AIAssistant from './components/AIAssistant';
import TodoForm from './components/TodoForm';
import TodoFilters from './components/TodoFilters';
import TodoList from './components/TodoList';

function App() {
  const [showForm, setShowForm] = useState(true);

  return (
    <div className="app">
      <header className="app-header">
        <h1>AWS Bedrock TODO アプリ</h1>
        <p>AI powered task management</p>
      </header>

      <main className="app-main">
        <div className="app-container">
          <AIAssistant />

          {showForm && <TodoForm />}

          <div className="toggle-form">
            <button
              className="btn btn-secondary"
              onClick={() => setShowForm(!showForm)}
            >
              {showForm ? 'フォームを非表示' : '新しいTODOを追加'}
            </button>
          </div>

          <TodoFilters />

          <TodoList />
        </div>
      </main>
    </div>
  );
}

export default App;
