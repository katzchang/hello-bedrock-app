import express from 'express';
import {
  generateTasksController,
  classifyTaskController,
  setPriorityController,
  recommendTasksController
} from '../controllers/aiController.js';

const router = express.Router();

router.post('/generate-tasks', generateTasksController);
router.post('/classify-task', classifyTaskController);
router.post('/set-priority', setPriorityController);
router.post('/recommend-tasks', recommendTasksController);

export default router;
