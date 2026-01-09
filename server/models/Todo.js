import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_FILE = path.join(__dirname, '../data/todos.json');

class Todo {
  constructor(data) {
    this.id = data.id || uuidv4();
    this.title = data.title;
    this.description = data.description || '';
    this.category = data.category || 'other';
    this.priority = data.priority || 'medium';
    this.completed = data.completed || false;
    this.tags = data.tags || [];
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
    this.completedAt = data.completedAt || null;
  }

  static async ensureDataFile() {
    try {
      await fs.access(DATA_FILE);
    } catch {
      await fs.writeFile(DATA_FILE, JSON.stringify([], null, 2));
    }
  }

  static async readTodos() {
    await this.ensureDataFile();
    const data = await fs.readFile(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  }

  static async writeTodos(todos) {
    const tempFile = DATA_FILE + '.tmp';
    await fs.writeFile(tempFile, JSON.stringify(todos, null, 2));
    await fs.rename(tempFile, DATA_FILE);
  }

  static async findAll(filters = {}) {
    const todos = await this.readTodos();
    let filtered = todos;

    if (filters.completed !== undefined) {
      filtered = filtered.filter(todo => todo.completed === filters.completed);
    }

    if (filters.category) {
      filtered = filtered.filter(todo => todo.category === filters.category);
    }

    if (filters.priority) {
      filtered = filtered.filter(todo => todo.priority === filters.priority);
    }

    return filtered.map(todo => new Todo(todo));
  }

  static async findById(id) {
    const todos = await this.readTodos();
    const todo = todos.find(t => t.id === id);
    return todo ? new Todo(todo) : null;
  }

  static async create(data) {
    const todos = await this.readTodos();
    const todo = new Todo(data);
    todos.push(todo);
    await this.writeTodos(todos);
    return todo;
  }

  static async update(id, data) {
    const todos = await this.readTodos();
    const index = todos.findIndex(t => t.id === id);

    if (index === -1) {
      return null;
    }

    const existingTodo = todos[index];
    const updatedTodo = new Todo({
      ...existingTodo,
      ...data,
      id: existingTodo.id,
      createdAt: existingTodo.createdAt,
      updatedAt: new Date().toISOString()
    });

    todos[index] = updatedTodo;
    await this.writeTodos(todos);
    return updatedTodo;
  }

  static async delete(id) {
    const todos = await this.readTodos();
    const index = todos.findIndex(t => t.id === id);

    if (index === -1) {
      return false;
    }

    todos.splice(index, 1);
    await this.writeTodos(todos);
    return true;
  }

  static async toggleComplete(id) {
    const todos = await this.readTodos();
    const index = todos.findIndex(t => t.id === id);

    if (index === -1) {
      return null;
    }

    const todo = todos[index];
    todo.completed = !todo.completed;
    todo.completedAt = todo.completed ? new Date().toISOString() : null;
    todo.updatedAt = new Date().toISOString();

    todos[index] = todo;
    await this.writeTodos(todos);
    return new Todo(todo);
  }
}

export default Todo;
