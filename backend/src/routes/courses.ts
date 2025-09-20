import express from 'express';
import { getCourses, getCourse, getCategories, getSkillAreas, getProviders } from '@/controllers/courseController';
import { validateQuery } from '@/middleware/validation';
import { optionalAuth } from '@/middleware/auth';
import { courseSearchSchema } from '@/utils/validation';
import Joi from 'joi';

const router = express.Router();

const idSchema = Joi.object({
  id: Joi.string().uuid().required(),
});

router.get('/', optionalAuth, validateQuery(courseSearchSchema), getCourses);
router.get('/categories', getCategories);
router.get('/skill-areas', getSkillAreas);
router.get('/providers', getProviders);
router.get('/:id', validateQuery(idSchema), getCourse);

export default router;