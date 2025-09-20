import Joi from 'joi';

export const userRegistrationSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  firstName: Joi.string().min(2).max(50).required(),
  lastName: Joi.string().min(2).max(50).required(),
  skillsFutureCredits: Joi.number().min(0).default(0),
  creditExpiryDate: Joi.date().optional(),
});

export const userLoginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const courseSearchSchema = Joi.object({
  query: Joi.string().optional(),
  category: Joi.string().optional(),
  skillArea: Joi.string().optional(),
  provider: Joi.string().optional(),
  maxPrice: Joi.number().min(0).optional(),
  minPrice: Joi.number().min(0).optional(),
  startDate: Joi.date().optional(),
  endDate: Joi.date().optional(),
  frequency: Joi.array().items(Joi.string().valid('weekday', 'weekend', 'evening', 'full-time', 'part-time')).optional(),
  mode: Joi.array().items(Joi.string().valid('online', 'in-person', 'hybrid')).optional(),
  location: Joi.string().optional(),
  availableSeats: Joi.boolean().optional(),
  sortBy: Joi.string().valid('price', 'rating', 'startDate', 'popularity', 'subsidyPercentage').default('startDate'),
  sortOrder: Joi.string().valid('asc', 'desc').default('asc'),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
});

export const reviewSchema = Joi.object({
  courseId: Joi.string().uuid().optional(),
  providerId: Joi.string().uuid().optional(),
  rating: Joi.number().integer().min(1).max(5).required(),
  title: Joi.string().min(5).max(255).required(),
  content: Joi.string().min(10).max(2000).required(),
}).xor('courseId', 'providerId');

export const savedCourseSchema = Joi.object({
  courseId: Joi.string().uuid().required(),
  notes: Joi.string().max(1000).optional(),
  priority: Joi.string().valid('low', 'medium', 'high').default('medium'),
});

export const courseAlertSchema = Joi.object({
  courseId: Joi.string().uuid().required(),
  alertType: Joi.string().valid('registration_deadline', 'seats_available', 'price_drop').required(),
});

export const userPreferencesSchema = Joi.object({
  notificationSettings: Joi.object({
    creditExpiry: Joi.boolean().default(true),
    courseReminders: Joi.boolean().default(true),
    newCourses: Joi.boolean().default(false),
  }).optional(),
  defaultFilters: Joi.object({
    maxPrice: Joi.number().min(0).optional(),
    preferredProviders: Joi.array().items(Joi.string()).optional(),
    skillAreas: Joi.array().items(Joi.string()).optional(),
  }).optional(),
});