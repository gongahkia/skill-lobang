import { Request, Response } from 'express';
import { UserModel } from '@/models/User';
import { hashPassword, comparePassword, generateToken } from '@/utils/auth';
import { sendSuccess, sendError, sendUnauthorized } from '@/utils/response';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, firstName, lastName, skillsFutureCredits, creditExpiryDate } = req.body;

    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
      sendError(res, 'User with this email already exists', 409);
      return;
    }

    const hashedPassword = await hashPassword(password);

    const user = await UserModel.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      skillsFutureCredits: skillsFutureCredits || 0,
      creditExpiryDate,
    });

    const token = generateToken({ userId: user.id, email: user.email });

    const userResponse = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      skillsFutureCredits: user.skillsFutureCredits,
      creditExpiryDate: user.creditExpiryDate,
      preferences: user.preferences,
    };

    sendSuccess(res, { user: userResponse, token }, 'User registered successfully', 201);
  } catch (error) {
    console.error('Registration error:', error);
    sendError(res, 'Registration failed', 500);
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await UserModel.findByEmail(email);
    if (!user) {
      sendUnauthorized(res, 'Invalid email or password');
      return;
    }

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      sendUnauthorized(res, 'Invalid email or password');
      return;
    }

    const token = generateToken({ userId: user.id, email: user.email });

    const userResponse = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      skillsFutureCredits: user.skillsFutureCredits,
      creditExpiryDate: user.creditExpiryDate,
      preferences: user.preferences,
    };

    sendSuccess(res, { user: userResponse, token }, 'Login successful');
  } catch (error) {
    console.error('Login error:', error);
    sendError(res, 'Login failed', 500);
  }
};

export const me = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendUnauthorized(res, 'No user found');
      return;
    }

    const user = await UserModel.findById(req.user.userId);
    if (!user) {
      sendUnauthorized(res, 'User not found');
      return;
    }

    const userResponse = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      skillsFutureCredits: user.skillsFutureCredits,
      creditExpiryDate: user.creditExpiryDate,
      preferences: user.preferences,
    };

    sendSuccess(res, userResponse);
  } catch (error) {
    console.error('Get user error:', error);
    sendError(res, 'Failed to get user info', 500);
  }
};