import { Router } from 'express';
import { 
  getExercises, 
  getExercise, 
  getFavoriteExercises, 
  addFavoriteExercise, 
  removeFavoriteExercise 
} from '../controllers/exerciseController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/', getExercises);
router.get('/:id', getExercise);

// Protected routes
router.use(authenticate);
router.get('/favorites/list', getFavoriteExercises);
router.post('/favorites', addFavoriteExercise);
router.delete('/favorites/:exerciseId', removeFavoriteExercise);

export default router;
