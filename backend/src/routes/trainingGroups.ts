import { Router } from 'express';
import { 
  createTrainingGroup, 
  getTrainingGroups, 
  getTrainingGroup, 
  updateTrainingGroup, 
  deleteTrainingGroup 
} from '../controllers/trainingGroupController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Training group routes
router.post('/', createTrainingGroup);
router.get('/', getTrainingGroups);
router.get('/:id', getTrainingGroup);
router.put('/:id', updateTrainingGroup);
router.delete('/:id', deleteTrainingGroup);

export default router;
