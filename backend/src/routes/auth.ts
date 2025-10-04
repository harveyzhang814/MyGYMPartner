import { Router } from 'express';
import { register, login, getProfile } from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import { validateRequest } from '../utils/validation';

const router = Router();

// Public routes
router.post('/register', validateRequest, register);
router.post('/login', validateRequest, login);

// Protected routes
router.get('/profile', authenticate, getProfile);

export default router;
