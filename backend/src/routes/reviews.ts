import express from 'express';
import { getReviewsByCourse, getReviewsByProvider, createReview, updateReview, deleteReview } from '@/controllers/reviewController';
import { validateBody, validateParams } from '@/middleware/validation';
import { authenticate, optionalAuth } from '@/middleware/auth';
import { reviewSchema } from '@/utils/validation';
import Joi from 'joi';

const router = express.Router();

const idSchema = Joi.object({
  id: Joi.string().uuid().required(),
});

const courseIdSchema = Joi.object({
  courseId: Joi.string().uuid().required(),
});

const providerIdSchema = Joi.object({
  providerId: Joi.string().uuid().required(),
});

router.get('/course/:courseId', validateParams(courseIdSchema), getReviewsByCourse);
router.get('/provider/:providerId', validateParams(providerIdSchema), getReviewsByProvider);
router.post('/', authenticate, validateBody(reviewSchema), createReview);
router.put('/:id', authenticate, validateParams(idSchema), validateBody(reviewSchema), updateReview);
router.delete('/:id', authenticate, validateParams(idSchema), deleteReview);

export default router;