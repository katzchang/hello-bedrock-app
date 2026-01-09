import express from 'express';
import {
  generateTasksController,
  classifyTaskController,
  setPriorityController
} from '../controllers/aiController.js';

const router = express.Router();

router.post('/generate-tasks', generateTasksController);
router.post('/classify-task', classifyTaskController);
router.post('/set-priority', setPriorityController);

export default router;
