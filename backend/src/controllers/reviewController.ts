import { Request, Response } from 'express';
import { ReviewModel } from '@/models/Review';
import { sendSuccess, sendError, sendNotFound, sendForbidden } from '@/utils/response';

export const getReviewsByCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await ReviewModel.findByCourseId(courseId, page, limit);
    sendSuccess(res, result);
  } catch (error) {
    console.error('Get course reviews error:', error);
    sendError(res, 'Failed to fetch course reviews', 500);
  }
};

export const getReviewsByProvider = async (req: Request, res: Response): Promise<void> => {
  try {
    const { providerId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await ReviewModel.findByProviderId(providerId, page, limit);
    sendSuccess(res, result);
  } catch (error) {
    console.error('Get provider reviews error:', error);
    sendError(res, 'Failed to fetch provider reviews', 500);
  }
};

export const createReview = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 'User not authenticated', 401);
      return;
    }

    const { courseId, providerId, rating, title, content } = req.body;

    // Check if user already reviewed this course/provider
    const existingReview = await ReviewModel.checkUserReviewExists(req.user.userId, courseId, providerId);
    if (existingReview) {
      sendError(res, 'You have already reviewed this course/provider', 409);
      return;
    }

    const review = await ReviewModel.create({
      userId: req.user.userId,
      courseId,
      providerId,
      rating,
      title,
      content,
    });

    sendSuccess(res, review, 'Review created successfully', 201);
  } catch (error) {
    console.error('Create review error:', error);
    sendError(res, 'Failed to create review', 500);
  }
};

export const updateReview = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 'User not authenticated', 401);
      return;
    }

    const { id } = req.params;
    const { rating, title, content } = req.body;

    const existingReview = await ReviewModel.findById(id);
    if (!existingReview) {
      sendNotFound(res, 'Review not found');
      return;
    }

    if (existingReview.userId !== req.user.userId) {
      sendForbidden(res, 'You can only update your own reviews');
      return;
    }

    const updatedReview = await ReviewModel.update(id, { rating, title, content });
    sendSuccess(res, updatedReview, 'Review updated successfully');
  } catch (error) {
    console.error('Update review error:', error);
    sendError(res, 'Failed to update review', 500);
  }
};

export const deleteReview = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 'User not authenticated', 401);
      return;
    }

    const { id } = req.params;

    const existingReview = await ReviewModel.findById(id);
    if (!existingReview) {
      sendNotFound(res, 'Review not found');
      return;
    }

    if (existingReview.userId !== req.user.userId) {
      sendForbidden(res, 'You can only delete your own reviews');
      return;
    }

    const deleted = await ReviewModel.delete(id);
    if (deleted) {
      sendSuccess(res, null, 'Review deleted successfully');
    } else {
      sendError(res, 'Failed to delete review', 500);
    }
  } catch (error) {
    console.error('Delete review error:', error);
    sendError(res, 'Failed to delete review', 500);
  }
};