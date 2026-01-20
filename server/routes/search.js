import express from 'express';
import { searchTaskContextController } from '../controllers/searchController.js';

const router = express.Router();

router.post('/task-context', searchTaskContextController);

export default router;
