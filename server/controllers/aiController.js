import { generateTasks, classifyTask, setPriority, recommendTasks } from '../services/bedrockService.js';

export const generateTasksController = async (req, res, next) => {
  try {
    const { description } = req.body;

    if (!description || description.trim().length === 0) {
      return res.status(400).json({
        error: 'Validation Error',
        message: '説明を入力してください'
      });
    }

    const tasks = await generateTasks(description);
    res.json({ tasks });
  } catch (error) {
    next(error);
  }
};

export const classifyTaskController = async (req, res, next) => {
  try {
    const { title, description } = req.body;

    if (!title || title.trim().length === 0) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'タイトルを入力してください'
      });
    }

    const result = await classifyTask(title, description);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const setPriorityController = async (req, res, next) => {
  try {
    const { title, description, deadline } = req.body;

    if (!title || title.trim().length === 0) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'タイトルを入力してください'
      });
    }

    const result = await setPriority(title, description, deadline);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const recommendTasksController = async (req, res, next) => {
  try {
    const { todos } = req.body;

    if (!todos || !Array.isArray(todos) || todos.length === 0) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'タスクリストを提供してください'
      });
    }

    const result = await recommendTasks(todos);
    res.json(result);
  } catch (error) {
    next(error);
  }
};
