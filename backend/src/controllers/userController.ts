import { Request, Response } from 'express';
import { UserModel } from '@/models/User';
import { pool } from '@/database/connection';
import { sendSuccess, sendError, sendNotFound } from '@/utils/response';

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 'User not authenticated', 401);
      return;
    }

    const { firstName, lastName, skillsFutureCredits, creditExpiryDate } = req.body;

    const updatedUser = await UserModel.update(req.user.userId, {
      firstName,
      lastName,
      skillsFutureCredits,
      creditExpiryDate,
    });

    if (!updatedUser) {
      sendNotFound(res, 'User not found');
      return;
    }

    const userResponse = {
      id: updatedUser.id,
      email: updatedUser.email,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      skillsFutureCredits: updatedUser.skillsFutureCredits,
      creditExpiryDate: updatedUser.creditExpiryDate,
      preferences: updatedUser.preferences,
    };

    sendSuccess(res, userResponse, 'Profile updated successfully');
  } catch (error) {
    console.error('Update profile error:', error);
    sendError(res, 'Failed to update profile', 500);
  }
};

export const updatePreferences = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 'User not authenticated', 401);
      return;
    }

    const preferences = req.body;

    const updatedUser = await UserModel.updatePreferences(req.user.userId, preferences);

    if (!updatedUser) {
      sendNotFound(res, 'User not found');
      return;
    }

    sendSuccess(res, updatedUser.preferences, 'Preferences updated successfully');
  } catch (error) {
    console.error('Update preferences error:', error);
    sendError(res, 'Failed to update preferences', 500);
  }
};

export const getSavedCourses = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 'User not authenticated', 401);
      return;
    }

    const query = `
      SELECT sc.*, c.title, c.provider, c.price_after_subsidy, c.start_date, c.registration_deadline
      FROM saved_courses sc
      JOIN courses c ON sc.course_id = c.id
      WHERE sc.user_id = $1
      ORDER BY sc.created_at DESC
    `;

    const result = await pool.query(query, [req.user.userId]);

    const savedCourses = result.rows.map(row => ({
      id: row.id,
      courseId: row.course_id,
      notes: row.notes,
      priority: row.priority,
      createdAt: row.created_at,
      course: {
        title: row.title,
        provider: row.provider,
        priceAfterSubsidy: parseFloat(row.price_after_subsidy),
        startDate: row.start_date,
        registrationDeadline: row.registration_deadline,
      },
    }));

    sendSuccess(res, savedCourses);
  } catch (error) {
    console.error('Get saved courses error:', error);
    sendError(res, 'Failed to fetch saved courses', 500);
  }
};

export const saveCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 'User not authenticated', 401);
      return;
    }

    const { courseId, notes, priority } = req.body;

    const query = `
      INSERT INTO saved_courses (user_id, course_id, notes, priority)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (user_id, course_id) DO UPDATE SET
        notes = EXCLUDED.notes,
        priority = EXCLUDED.priority
      RETURNING *
    `;

    const result = await pool.query(query, [req.user.userId, courseId, notes, priority]);

    sendSuccess(res, result.rows[0], 'Course saved successfully');
  } catch (error) {
    console.error('Save course error:', error);
    sendError(res, 'Failed to save course', 500);
  }
};

export const removeSavedCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 'User not authenticated', 401);
      return;
    }

    const { courseId } = req.params;

    const query = 'DELETE FROM saved_courses WHERE user_id = $1 AND course_id = $2';
    const result = await pool.query(query, [req.user.userId, courseId]);

    if (result.rowCount === 0) {
      sendNotFound(res, 'Saved course not found');
      return;
    }

    sendSuccess(res, null, 'Course removed from saved list');
  } catch (error) {
    console.error('Remove saved course error:', error);
    sendError(res, 'Failed to remove saved course', 500);
  }
};

export const getCourseAlerts = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 'User not authenticated', 401);
      return;
    }

    const query = `
      SELECT ca.*, c.title, c.provider, c.registration_deadline, c.start_date
      FROM course_alerts ca
      JOIN courses c ON ca.course_id = c.id
      WHERE ca.user_id = $1 AND ca.is_active = true
      ORDER BY ca.created_at DESC
    `;

    const result = await pool.query(query, [req.user.userId]);

    const alerts = result.rows.map(row => ({
      id: row.id,
      courseId: row.course_id,
      alertType: row.alert_type,
      isActive: row.is_active,
      triggeredAt: row.triggered_at,
      createdAt: row.created_at,
      course: {
        title: row.title,
        provider: row.provider,
        registrationDeadline: row.registration_deadline,
        startDate: row.start_date,
      },
    }));

    sendSuccess(res, alerts);
  } catch (error) {
    console.error('Get course alerts error:', error);
    sendError(res, 'Failed to fetch course alerts', 500);
  }
};

export const createCourseAlert = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 'User not authenticated', 401);
      return;
    }

    const { courseId, alertType } = req.body;

    const query = `
      INSERT INTO course_alerts (user_id, course_id, alert_type)
      VALUES ($1, $2, $3)
      ON CONFLICT (user_id, course_id, alert_type) DO UPDATE SET
        is_active = true
      RETURNING *
    `;

    const result = await pool.query(query, [req.user.userId, courseId, alertType]);

    sendSuccess(res, result.rows[0], 'Course alert created successfully', 201);
  } catch (error) {
    console.error('Create course alert error:', error);
    sendError(res, 'Failed to create course alert', 500);
  }
};