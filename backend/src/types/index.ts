export interface User {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  skillsFutureCredits: number;
  creditExpiryDate?: Date;
  preferences?: UserPreferences;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPreferences {
  notificationSettings: {
    creditExpiry: boolean;
    courseReminders: boolean;
    newCourses: boolean;
  };
  defaultFilters: {
    maxPrice?: number;
    preferredProviders?: string[];
    skillAreas?: string[];
  };
}

export interface Course {
  id: string;
  title: string;
  description: string;
  provider: string;
  providerId: string;
  category: string;
  skillArea: string;
  duration: number;
  priceBeforeSubsidy: number;
  priceAfterSubsidy: number;
  subsidyPercentage: number;
  availableSeats: number;
  totalSeats: number;
  startDate: Date;
  endDate: Date;
  registrationDeadline: Date;
  frequency: 'weekday' | 'weekend' | 'evening' | 'full-time' | 'part-time';
  mode: 'online' | 'in-person' | 'hybrid';
  location?: string;
  prerequisites?: string[];
  learningOutcomes: string[];
  sourceUrl: string;
  lastUpdated: Date;
  createdAt: Date;
}

export interface Provider {
  id: string;
  name: string;
  description?: string;
  website?: string;
  rating: number;
  reviewCount: number;
  accreditation: string[];
  specializations: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Review {
  id: string;
  userId: string;
  courseId?: string;
  providerId?: string;
  rating: number;
  title: string;
  content: string;
  helpful: number;
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SavedCourse {
  id: string;
  userId: string;
  courseId: string;
  notes?: string;
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
}

export interface CourseAlert {
  id: string;
  userId: string;
  courseId: string;
  alertType: 'registration_deadline' | 'seats_available' | 'price_drop';
  isActive: boolean;
  triggeredAt?: Date;
  createdAt: Date;
}

export interface SearchFilters {
  query?: string;
  category?: string;
  skillArea?: string;
  provider?: string;
  maxPrice?: number;
  minPrice?: number;
  startDate?: Date;
  endDate?: Date;
  frequency?: string[];
  mode?: string[];
  location?: string;
  availableSeats?: boolean;
  sortBy?: 'price' | 'rating' | 'startDate' | 'popularity' | 'subsidyPercentage';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface JWTPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

export interface ScrapingJob {
  id: string;
  source: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  coursesFound: number;
  coursesUpdated: number;
  errors?: string[];
  startedAt: Date;
  completedAt?: Date;
}