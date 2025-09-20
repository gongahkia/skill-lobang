import express from 'express';
import {
  updateProfile,
  updatePreferences,
  getSavedCourses,
  saveCourse,
  removeSavedCourse,
  getCourseAlerts,
  createCourseAlert,
} from '@/controllers/userController';
import { validateBody, validateParams } from '@/middleware/validation';
import { authenticate } from '@/middleware/auth';
import { savedCourseSchema, courseAlertSchema, userPreferencesSchema } from '@/utils/validation';
import Joi from 'joi';

const router = express.Router();

const profileUpdateSchema = Joi.object({
  firstName: Joi.string().min(2).max(50).optional(),
  lastName: Joi.string().min(2).max(50).optional(),
  skillsFutureCredits: Joi.number().min(0).optional(),
  creditExpiryDate: Joi.date().optional(),
});

const courseIdParamSchema = Joi.object({
  courseId: Joi.string().uuid().required(),
});

router.put('/profile', authenticate, validateBody(profileUpdateSchema), updateProfile);
router.put('/preferences', authenticate, validateBody(userPreferencesSchema), updatePreferences);

router.get('/saved-courses', authenticate, getSavedCourses);
router.post('/saved-courses', authenticate, validateBody(savedCourseSchema), saveCourse);
router.delete('/saved-courses/:courseId', authenticate, validateParams(courseIdParamSchema), removeSavedCourse);

router.get('/course-alerts', authenticate, getCourseAlerts);
router.post('/course-alerts', authenticate, validateBody(courseAlertSchema), createCourseAlert);

export default router;