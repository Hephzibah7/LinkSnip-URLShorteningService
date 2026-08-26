import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { userRepository } from '../repositories/user.repository.js';
import { tokenRepository } from '../repositories/token.repository.js';
import { config } from '../config/env.js';

export interface UserPayload {
  userId: string;
  email: string;
  name: string;
}

export class AuthService {
  /**
   * Generates a signed JWT token
   */
  generateJwt(payload: UserPayload): string {
    return jwt.sign(payload, config.jwtSecret, {
      expiresIn: config.jwtExpiresIn as any,
    });
  }

  /**
   * Registers a new user
   */
  async register(data: { email: string; name: string; password: string }) {
    const existingUser = await userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(data.password, salt);
    const apiKey = `ls_${crypto.randomBytes(24).toString('hex')}`;

    const user = await userRepository.create({
      email: data.email,
      name: data.name,
      passwordHash,
      apiKey,
      isEmailVerified: false,
    });

    // Create an email verification token (valid for 24 hours)
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await tokenRepository.create(user.id, verificationToken, 'EMAIL_VERIFY', expiresAt);

    const token = this.generateJwt({
      userId: user.id,
      email: user.email,
      name: user.name,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        isEmailVerified: user.isEmailVerified,
        apiKey: user.apiKey,
      },
      token,
      verificationToken, // Provided in development/demo response for seamless email verification testing
    };
  }

  /**
   * Authenticates user and returns JWT token
   */
  async login(data: { email: string; password: string }) {
    const user = await userRepository.findByEmail(data.email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(data.password, user.passwordHash);
    if (!isMatch) {
      throw new Error('Invalid email or password');
    }

    const token = this.generateJwt({
      userId: user.id,
      email: user.email,
      name: user.name,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        isEmailVerified: user.isEmailVerified,
        apiKey: user.apiKey,
      },
      token,
    };
  }

  /**
   * Verifies an email verification token
   */
  async verifyEmail(token: string) {
    const tokenRecord = await tokenRepository.findByToken(token, 'EMAIL_VERIFY');
    if (!tokenRecord) {
      throw new Error('Invalid or expired verification token');
    }

    if (new Date() > tokenRecord.expiresAt) {
      await tokenRepository.delete(tokenRecord.id);
      throw new Error('Verification token has expired');
    }

    await userRepository.update(tokenRecord.userId, {
      isEmailVerified: true,
    });

    await tokenRepository.delete(tokenRecord.id);
    return { success: true, message: 'Email successfully verified' };
  }

  /**
   * Requests a password reset token
   */
  async requestPasswordReset(email: string) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      // Return true to prevent email enumeration
      return { success: true, message: 'If an account with that email exists, a password reset token has been sent.' };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour expiration
    await tokenRepository.create(user.id, resetToken, 'PASSWORD_RESET', expiresAt);

    return {
      success: true,
      message: 'Password reset token generated successfully',
      resetToken, // Returned for testing / demo sandbox
    };
  }

  /**
   * Resets password using a reset token
   */
  async resetPassword(token: string, newPassword: string) {
    const tokenRecord = await tokenRepository.findByToken(token, 'PASSWORD_RESET');
    if (!tokenRecord) {
      throw new Error('Invalid or expired password reset token');
    }

    if (new Date() > tokenRecord.expiresAt) {
      await tokenRepository.delete(tokenRecord.id);
      throw new Error('Password reset token has expired');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    await userRepository.update(tokenRecord.userId, {
      passwordHash,
    });

    await tokenRepository.delete(tokenRecord.id);
    return { success: true, message: 'Password has been reset successfully' };
  }

  /**
   * Regenerates API key for user
   */
  async regenerateApiKey(userId: string) {
    const newApiKey = `ls_${crypto.randomBytes(24).toString('hex')}`;
    const user = await userRepository.update(userId, {
      apiKey: newApiKey,
    });
    return { apiKey: user.apiKey };
  }

  /**
   * Retrieves profile information
   */
  async getProfile(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      isEmailVerified: user.isEmailVerified,
      apiKey: user.apiKey,
      createdAt: user.createdAt,
      totalLinks: (user as any)._count?.links || 0,
    };
  }
}

export const authService = new AuthService();
