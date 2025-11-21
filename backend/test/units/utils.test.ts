import {
  generateUID,
  signToken,
  verifyToken,
  hashPassword,
  comparePassword,
  JWTPayload,
} from '@utils';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { env } from '@configs/env';

// Mock dependencies
jest.mock('jsonwebtoken');
jest.mock('bcryptjs');
jest.mock('@configs/env', () => ({
  env: {
    JWT_SECRET: 'test-secret',
    JWT_EXPIRES_IN: '7d',
  },
}));

const mockedJwt = jwt as jest.Mocked<typeof jwt>;
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateUID', () => {
    it('should generate a unique ID', () => {
      const uid1 = generateUID();
      const uid2 = generateUID();

      expect(uid1).toBeDefined();
      expect(uid2).toBeDefined();
      expect(uid1).not.toBe(uid2);
      expect(typeof uid1).toBe('string');
      expect(uid1.length).toBeGreaterThan(0);
    });

    it('should generate UUID v4 format', () => {
      const uid = generateUID();
      // UUID v4 format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      expect(uid).toMatch(uuidRegex);
    });
  });

  describe('signToken', () => {
    it('should sign a JWT token', () => {
      const payload: JWTPayload = {
        uid: 'user-123',
        email: 'test@example.com',
        roleId: 'role-123',
      };

      const expectedToken = 'signed-token';
      mockedJwt.sign.mockReturnValue(expectedToken as any);

      const token = signToken(payload);

      expect(mockedJwt.sign).toHaveBeenCalledWith(
        payload,
        env.JWT_SECRET,
        { expiresIn: env.JWT_EXPIRES_IN }
      );
      expect(token).toBe(expectedToken);
    });

    it('should sign token without roleId', () => {
      const payload: JWTPayload = {
        uid: 'user-123',
        email: 'test@example.com',
      };

      const expectedToken = 'signed-token';
      mockedJwt.sign.mockReturnValue(expectedToken as any);

      const token = signToken(payload);

      expect(token).toBe(expectedToken);
    });
  });

  describe('verifyToken', () => {
    it('should verify a valid token', () => {
      const token = 'valid-token';
      const payload: JWTPayload = {
        uid: 'user-123',
        email: 'test@example.com',
        roleId: 'role-123',
      };

      mockedJwt.verify.mockReturnValue(payload as any);

      const result = verifyToken(token);

      expect(mockedJwt.verify).toHaveBeenCalledWith(token, env.JWT_SECRET);
      expect(result).toEqual(payload);
    });

    it('should throw error for invalid token', () => {
      const token = 'invalid-token';

      mockedJwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      expect(() => verifyToken(token)).toThrow('Invalid or expired token');
    });

    it('should throw error for expired token', () => {
      const token = 'expired-token';

      mockedJwt.verify.mockImplementation(() => {
        throw new jwt.TokenExpiredError('Token expired', new Date());
      });

      expect(() => verifyToken(token)).toThrow('Invalid or expired token');
    });
  });

  describe('hashPassword', () => {
    it('should hash a password', async () => {
      const password = 'plainPassword123';
      const hashedPassword = 'hashedPassword123';
      const salt = 'salt123';

      mockedBcrypt.genSalt.mockResolvedValue(salt as any);
      mockedBcrypt.hash.mockResolvedValue(hashedPassword as any);

      const result = await hashPassword(password);

      expect(mockedBcrypt.genSalt).toHaveBeenCalledWith(10);
      expect(mockedBcrypt.hash).toHaveBeenCalledWith(password, salt);
      expect(result).toBe(hashedPassword);
    });

    it('should generate different hashes for same password', async () => {
      const password = 'samePassword';
      const salt1 = 'salt1';
      const salt2 = 'salt2';
      const hash1 = 'hash1';
      const hash2 = 'hash2';

      mockedBcrypt.genSalt
        .mockResolvedValueOnce(salt1 as any)
        .mockResolvedValueOnce(salt2 as any);
      mockedBcrypt.hash
        .mockResolvedValueOnce(hash1 as any)
        .mockResolvedValueOnce(hash2 as any);

      const result1 = await hashPassword(password);
      const result2 = await hashPassword(password);

      expect(result1).toBe(hash1);
      expect(result2).toBe(hash2);
      // Different salts should produce different hashes
      expect(mockedBcrypt.genSalt).toHaveBeenCalledTimes(2);
    });
  });

  describe('comparePassword', () => {
    it('should return true for matching password', async () => {
      const password = 'plainPassword123';
      const hashedPassword = 'hashedPassword123';

      mockedBcrypt.compare.mockResolvedValue(true as any);

      const result = await comparePassword(password, hashedPassword);

      expect(mockedBcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
      expect(result).toBe(true);
    });

    it('should return false for non-matching password', async () => {
      const password = 'wrongPassword';
      const hashedPassword = 'hashedPassword123';

      mockedBcrypt.compare.mockResolvedValue(false as any);

      const result = await comparePassword(password, hashedPassword);

      expect(mockedBcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
      expect(result).toBe(false);
    });
  });
});
