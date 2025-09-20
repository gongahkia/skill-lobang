import express from 'express';
import { register, login, me } from '@/controllers/authController';
import { validateBody } from '@/middleware/validation';
import { authenticate } from '@/middleware/auth';
import { userRegistrationSchema, userLoginSchema } from '@/utils/validation';

const router = express.Router();

router.post('/register', validateBody(userRegistrationSchema), register);
router.post('/login', validateBody(userLoginSchema), login);
router.get('/me', authenticate, me);

export default router;