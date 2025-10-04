import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  getTrainingPlans,
  getTrainingPlan,
  createTrainingPlan,
  updateTrainingPlan,
  deleteTrainingPlan,
  duplicateTrainingPlan
} from '../controllers/trainingPlanController';

const router = Router();

// 所有路由都需要认证
router.use(authenticate);

// 训练计划路由
router.get('/', getTrainingPlans);
router.get('/:id', getTrainingPlan);
router.post('/', createTrainingPlan);
router.put('/:id', updateTrainingPlan);
router.delete('/:id', deleteTrainingPlan);
router.post('/:id/duplicate', duplicateTrainingPlan);

export default router;
