import prisma from '../config/prisma.js';
import { Token } from '@prisma/client';

export class TokenRepository {
  async create(userId: string, token: string, type: 'EMAIL_VERIFY' | 'PASSWORD_RESET', expiresAt: Date): Promise<Token> {
    // Clean up old tokens of same type for this user
    await prisma.token.deleteMany({
      where: { userId, type },
    });

    return prisma.token.create({
      data: {
        userId,
        token,
        type,
        expiresAt,
      },
    });
  }

  async findByToken(token: string, type?: string): Promise<(Token & { user: { id: string; email: string; name: string } }) | null> {
    return prisma.token.findFirst({
      where: {
        token,
        ...(type ? { type } : {}),
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });
  }

  async delete(id: string): Promise<Token> {
    return prisma.token.delete({
      where: { id },
    });
  }

  async deleteByToken(token: string): Promise<number> {
    const res = await prisma.token.deleteMany({
      where: { token },
    });
    return res.count;
  }
}

export const tokenRepository = new TokenRepository();
