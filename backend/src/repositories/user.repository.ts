import { User, IUserDocument } from '../models/User';

/**
 * User Repository - Data access layer for User model
 * Handles all database operations for users
 */
export class UserRepository {
  /**
   * Find user by email address
   */
  async findByEmail(email: string): Promise<IUserDocument | null> {
    return User.findOne({ email }).select('+password');
  }

  /**
   * Find user by ID
   */
  async findById(id: string): Promise<IUserDocument | null> {
    return User.findById(id);
  }

  /**
   * Create a new user
   */
  async create(data: {
    email: string;
    name: string;
    password: string;
  }): Promise<IUserDocument> {
    const user = new User(data);
    return user.save();
  }

  /**
   * Update user profile
   */
  async update(
    id: string,
    data: Partial<{ name: string; email: string }>
  ): Promise<IUserDocument | null> {
    return User.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  /**
   * Get all users (for assignment dropdown)
   */
  async findAll(): Promise<IUserDocument[]> {
    return User.find().select('_id name email');
  }
}

export const userRepository = new UserRepository();
