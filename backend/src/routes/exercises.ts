import { Router } from 'express';
import { 
  getExercises, 
  getExercise, 
  getFavoriteExercises, 
  addFavoriteExercise, 
  removeFavoriteExercise,
  createExercise,
  updateExercise,
  deleteExercise,
  getExerciseTemplates,
  batchCreateExercises
} from '../controllers/exerciseController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/', getExercises);
router.get('/templates', getExerciseTemplates);
router.get('/:id', getExercise);

// Protected routes
router.use(authenticate);
router.post('/batch', batchCreateExercises);
router.post('/', createExercise);
router.put('/:id', updateExercise);
router.delete('/:id', deleteExercise);
router.get('/favorites/list', getFavoriteExercises);
router.post('/favorites', addFavoriteExercise);
router.delete('/favorites/:exerciseId', removeFavoriteExercise);

export default router;
