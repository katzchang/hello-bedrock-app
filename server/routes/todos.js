import express from 'express';
import {
  getAllTodos,
  getTodoById,
  createTodo,
  updateTodo,
  deleteTodo,
  toggleComplete
} from '../controllers/todoController.js';
import { validateTodo, checkValidation } from '../middleware/validation.js';

const router = express.Router();

router.get('/', getAllTodos);
router.get('/:id', getTodoById);
router.post('/', validateTodo, checkValidation, createTodo);
router.put('/:id', validateTodo, checkValidation, updateTodo);
router.delete('/:id', deleteTodo);
router.patch('/:id/complete', toggleComplete);

export default router;
