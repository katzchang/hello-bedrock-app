import json
import os
import uuid
from datetime import datetime
from typing import List, Dict, Optional
from pathlib import Path

# Data file path
DATA_DIR = Path(__file__).parent.parent.parent / 'data'
DATA_FILE = DATA_DIR / 'todos.json'


def ensure_data_file():
    """Ensure data directory and file exist"""
    DATA_DIR.mkdir(exist_ok=True)
    if not DATA_FILE.exists():
        with open(DATA_FILE, 'w', encoding='utf-8') as f:
            json.dump([], f, ensure_ascii=False, indent=2)


def read_todos() -> List[Dict]:
    """Read all todos from file"""
    ensure_data_file()
    try:
        with open(DATA_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as error:
        print(f'Error reading todos: {error}')
        return []


def write_todos(todos: List[Dict]):
    """Write todos to file"""
    ensure_data_file()
    try:
        with open(DATA_FILE, 'w', encoding='utf-8') as f:
            json.dump(todos, f, ensure_ascii=False, indent=2)
    except Exception as error:
        print(f'Error writing todos: {error}')
        raise Exception('データの保存に失敗しました')


def get_all_todos(
    completed: Optional[bool] = None,
    category: Optional[str] = None,
    priority: Optional[str] = None
) -> List[Dict]:
    """Get todos with optional filters"""
    todos = read_todos()

    # Apply filters
    if completed is not None:
        todos = [t for t in todos if t.get('completed') == completed]

    if category:
        todos = [t for t in todos if t.get('category') == category]

    if priority:
        todos = [t for t in todos if t.get('priority') == priority]

    return todos


def get_todo_by_id(todo_id: str) -> Optional[Dict]:
    """Get a single todo by ID"""
    todos = read_todos()
    for todo in todos:
        if todo.get('id') == todo_id:
            return todo
    return None


def create_todo(todo_data: Dict) -> Dict:
    """Create a new todo"""
    todos = read_todos()

    new_todo = {
        'id': str(uuid.uuid4()),
        'title': todo_data['title'],
        'description': todo_data.get('description', ''),
        'category': todo_data.get('category', 'other'),
        'priority': todo_data.get('priority', 'medium'),
        'tags': todo_data.get('tags', []),
        'deadline': todo_data.get('deadline'),
        'completed': False,
        'createdAt': datetime.utcnow().isoformat() + 'Z',
        'updatedAt': datetime.utcnow().isoformat() + 'Z',
        'completedAt': None
    }

    todos.append(new_todo)
    write_todos(todos)

    return new_todo


def update_todo(todo_id: str, updates: Dict) -> Optional[Dict]:
    """Update an existing todo"""
    todos = read_todos()

    for i, todo in enumerate(todos):
        if todo.get('id') == todo_id:
            # Update fields
            for key, value in updates.items():
                if value is not None:
                    todo[key] = value

            todo['updatedAt'] = datetime.utcnow().isoformat() + 'Z'

            # Handle completion
            if updates.get('completed') == True and not todo.get('completedAt'):
                todo['completedAt'] = datetime.utcnow().isoformat() + 'Z'
            elif updates.get('completed') == False:
                todo['completedAt'] = None

            todos[i] = todo
            write_todos(todos)
            return todo

    return None


def delete_todo(todo_id: str) -> bool:
    """Delete a todo"""
    todos = read_todos()
    initial_length = len(todos)

    todos = [t for t in todos if t.get('id') != todo_id]

    if len(todos) < initial_length:
        write_todos(todos)
        return True

    return False


def toggle_complete(todo_id: str) -> Optional[Dict]:
    """Toggle todo completion status"""
    todo = get_todo_by_id(todo_id)

    if not todo:
        return None

    updates = {
        'completed': not todo.get('completed', False)
    }

    return update_todo(todo_id, updates)
