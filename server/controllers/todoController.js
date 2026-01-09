import Todo from '../models/Todo.js';

export const getAllTodos = async (req, res, next) => {
  try {
    const { completed, category, priority } = req.query;
    const filters = {};

    if (completed !== undefined) {
      filters.completed = completed === 'true';
    }
    if (category) {
      filters.category = category;
    }
    if (priority) {
      filters.priority = priority;
    }

    const todos = await Todo.findAll(filters);
    res.json(todos);
  } catch (error) {
    next(error);
  }
};

export const getTodoById = async (req, res, next) => {
  try {
    const todo = await Todo.findById(req.params.id);
    if (!todo) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    res.json(todo);
  } catch (error) {
    next(error);
  }
};

export const createTodo = async (req, res, next) => {
  try {
    const todo = await Todo.create(req.body);
    res.status(201).json(todo);
  } catch (error) {
    next(error);
  }
};

export const updateTodo = async (req, res, next) => {
  try {
    const todo = await Todo.update(req.params.id, req.body);
    if (!todo) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    res.json(todo);
  } catch (error) {
    next(error);
  }
};

export const deleteTodo = async (req, res, next) => {
  try {
    const deleted = await Todo.delete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const toggleComplete = async (req, res, next) => {
  try {
    const todo = await Todo.toggleComplete(req.params.id);
    if (!todo) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    res.json(todo);
  } catch (error) {
    next(error);
  }
};
