import { Router } from 'express';
import { 
  createExerciseSession, 
  getExerciseSessions, 
  getExerciseSession, 
  addExerciseRecord, 
  updateExerciseSession, 
  deleteExerciseSession 
} from '../controllers/exerciseSessionController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Exercise session routes
router.post('/', createExerciseSession);
router.get('/', getExerciseSessions);
router.get('/:id', getExerciseSession);
router.put('/:id', updateExerciseSession);
router.delete('/:id', deleteExerciseSession);

// Exercise record routes
router.post('/:sessionId/records', addExerciseRecord);

export default router;
