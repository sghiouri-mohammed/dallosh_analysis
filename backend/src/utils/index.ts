import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import * as bcrypt from 'bcryptjs';
import { env } from '@configs/env';

export const generateUID = (): string => {
  return uuidv4();
};

export interface JWTPayload {
  uid: string;
  email: string;
  roleId?: string;
}

export const signToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  } as jwt.SignOptions);
};

export const verifyToken = (token: string): JWTPayload => {
  try {
    return jwt.verify(token, env.JWT_SECRET) as JWTPayload;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

export const comparePassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

