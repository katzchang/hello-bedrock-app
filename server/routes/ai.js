import express from 'express';
import {
  generateTasksController,
  classifyTaskController,
  setPriorityController,
  generateExecutionGuideController,
  generateCompletionMessageController,
  detectStaleTasksController,
  recommendTasksController
} from '../controllers/aiController.js';

const router = express.Router();

router.post('/generate-tasks', generateTasksController);
router.post('/classify-task', classifyTaskController);
router.post('/set-priority', setPriorityController);
router.post('/generate-execution-guide', generateExecutionGuideController);
router.post('/generate-completion-message', generateCompletionMessageController);
router.post('/detect-stale-tasks', detectStaleTasksController);
router.post('/recommend-tasks', recommendTasksController);

export default router;
