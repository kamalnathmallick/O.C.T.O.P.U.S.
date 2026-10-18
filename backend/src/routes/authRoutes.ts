import { Router } from 'express';
import { register, login, refreshToken, forgotPassword, resetPassword, logout, getProfile } from '../controllers/authController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refreshToken);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/logout', authenticate, logout);
router.get('/profile', authenticate, getProfile);

export default router;