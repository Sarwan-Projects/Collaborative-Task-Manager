import jwt from 'jsonwebtoken';
import { config } from '../config';
import { userRepository } from '../repositories/user.repository';
import { RegisterInput, LoginInput, UpdateProfileInput } from '../dtos/auth.dto';
import { ApiError } from '../middleware/error.middleware';
import { IUserDocument } from '../models/User';

/**
 * Authentication Service
 * Handles user registration, login, and profile management
 */
export class AuthService {
  /**
   * Generate JWT token for a user
   */
  private generateToken(user: IUserDocument): string {
    return jwt.sign(
      { id: user._id.toString(), email: user.email },
      config.jwtSecret,
      { expiresIn: '7d' }
    );
  }

  /**
   * Register a new user
   * @throws ApiError if email already exists
   */
  async register(data: RegisterInput): Promise<{ user: IUserDocument; token: string }> {
    // Check if user already exists
    const existingUser = await userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new ApiError('Email already registered', 409);
    }

    // Create new user
    const user = await userRepository.create(data);
    const token = this.generateToken(user);

    return { user, token };
  }

  /**
   * Login user with email and password
   * @throws ApiError if credentials are invalid
   */
  async login(data: LoginInput): Promise<{ user: IUserDocument; token: string }> {
    // Find user by email
    const user = await userRepository.findByEmail(data.email);
    if (!user) {
      throw new ApiError('Invalid email or password', 401);
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(data.password);
    if (!isPasswordValid) {
      throw new ApiError('Invalid email or password', 401);
    }

    const token = this.generateToken(user);

    return { user, token };
  }

  /**
   * Get user profile by ID
   */
  async getProfile(userId: string): Promise<IUserDocument> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new ApiError('User not found', 404);
    }
    return user;
  }

  /**
   * Update user profile
   */
  async updateProfile(
    userId: string,
    data: UpdateProfileInput
  ): Promise<IUserDocument> {
    // Check if email is being changed and if it's already taken
    if (data.email) {
      const existingUser = await userRepository.findByEmail(data.email);
      if (existingUser && existingUser._id.toString() !== userId) {
        throw new ApiError('Email already in use', 409);
      }
    }

    const user = await userRepository.update(userId, data);
    if (!user) {
      throw new ApiError('User not found', 404);
    }

    return user;
  }

  /**
   * Get all users (for task assignment)
   */
  async getAllUsers(): Promise<IUserDocument[]> {
    return userRepository.findAll();
  }
}

export const authService = new AuthService();
