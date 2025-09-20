import { Request, Response } from 'express';
import { CourseModel } from '@/models/Course';
import { sendSuccess, sendError, sendNotFound } from '@/utils/response';
import { SearchFilters } from '@/types';

export const getCourses = async (req: Request, res: Response): Promise<void> => {
  try {
    const filters: SearchFilters = req.query as SearchFilters;
    const result = await CourseModel.search(filters);
    sendSuccess(res, result);
  } catch (error) {
    console.error('Get courses error:', error);
    sendError(res, 'Failed to fetch courses', 500);
  }
};

export const getCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const course = await CourseModel.findById(id);

    if (!course) {
      sendNotFound(res, 'Course not found');
      return;
    }

    sendSuccess(res, course);
  } catch (error) {
    console.error('Get course error:', error);
    sendError(res, 'Failed to fetch course', 500);
  }
};

export const getCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const categories = await CourseModel.getCategories();
    sendSuccess(res, categories);
  } catch (error) {
    console.error('Get categories error:', error);
    sendError(res, 'Failed to fetch categories', 500);
  }
};

export const getSkillAreas = async (req: Request, res: Response): Promise<void> => {
  try {
    const skillAreas = await CourseModel.getSkillAreas();
    sendSuccess(res, skillAreas);
  } catch (error) {
    console.error('Get skill areas error:', error);
    sendError(res, 'Failed to fetch skill areas', 500);
  }
};

export const getProviders = async (req: Request, res: Response): Promise<void> => {
  try {
    const providers = await CourseModel.getProviders();
    sendSuccess(res, providers);
  } catch (error) {
    console.error('Get providers error:', error);
    sendError(res, 'Failed to fetch providers', 500);
  }
};