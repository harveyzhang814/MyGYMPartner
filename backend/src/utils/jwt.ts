import jwt, { SignOptions } from 'jsonwebtoken';

export const generateToken = (userId: string): string => {
  const secret = process.env.JWT_SECRET || 'default-secret-key';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign({ userId }, secret, { expiresIn } as SignOptions);
};

export const verifyToken = (token: string): { userId: string } => {
  const secret = process.env.JWT_SECRET || 'default-secret-key';
  return jwt.verify(token, secret) as { userId: string };
};
