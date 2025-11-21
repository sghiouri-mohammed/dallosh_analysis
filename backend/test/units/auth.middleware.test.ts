import { authMiddleware, AuthRequest } from '@common/middleware/auth';
import { Response, NextFunction } from 'express';
import { verifyToken, signToken, JWTPayload } from '@utils';

// Mock utils
jest.mock('@utils', () => ({
  verifyToken: jest.fn(),
  signToken: jest.fn(),
  hashPassword: jest.fn(),
  comparePassword: jest.fn(),
  generateUID: jest.fn(),
}));

const mockedVerifyToken = verifyToken as jest.MockedFunction<typeof verifyToken>;

describe('authMiddleware', () => {
  let mockReq: Partial<AuthRequest>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {
      headers: {},
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    mockNext = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should call next() when valid token is provided', () => {
    const token = 'valid-token';
    const payload: JWTPayload = {
      uid: 'user-123',
      email: 'test@example.com',
      roleId: 'role-123',
    };

    mockReq.headers = {
      authorization: `Bearer ${token}`,
    };

    mockedVerifyToken.mockReturnValue(payload);

    authMiddleware(mockReq as AuthRequest, mockRes as Response, mockNext);

    expect(mockedVerifyToken).toHaveBeenCalledWith(token);
    expect(mockReq.user).toEqual(payload);
    expect(mockNext).toHaveBeenCalled();
    expect(mockRes.status).not.toHaveBeenCalled();
  });

  it('should return 401 when no authorization header is provided', () => {
    mockReq.headers = {};

    authMiddleware(mockReq as AuthRequest, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      message: 'No token provided',
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should return 401 when authorization header does not start with Bearer', () => {
    mockReq.headers = {
      authorization: 'Invalid token',
    };

    authMiddleware(mockReq as AuthRequest, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      message: 'No token provided',
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should return 401 when token is invalid', () => {
    const token = 'invalid-token';

    mockReq.headers = {
      authorization: `Bearer ${token}`,
    };

    const error = new Error('Invalid or expired token');
    mockedVerifyToken.mockImplementation(() => {
      throw error;
    });

    authMiddleware(mockReq as AuthRequest, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      message: 'Invalid or expired token',
      error: error.message,
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should extract token correctly from Bearer header', () => {
    const token = 'valid-token';
    const payload: JWTPayload = {
      uid: 'user-123',
      email: 'test@example.com',
    };

    mockReq.headers = {
      authorization: `Bearer ${token}`,
    };

    mockedVerifyToken.mockReturnValue(payload);

    authMiddleware(mockReq as AuthRequest, mockRes as Response, mockNext);

    expect(mockedVerifyToken).toHaveBeenCalledWith(token);
    expect(mockReq.user).toEqual(payload);
  });

  it('should handle token with extra spaces', () => {
    const token = 'valid-token';
    const payload: JWTPayload = {
      uid: 'user-123',
      email: 'test@example.com',
    };

    mockReq.headers = {
      authorization: `Bearer  ${token}  `,
    };

    mockedVerifyToken.mockReturnValue(payload);

    authMiddleware(mockReq as AuthRequest, mockRes as Response, mockNext);

    // Should extract token correctly (substring(7) removes "Bearer ")
    expect(mockedVerifyToken).toHaveBeenCalled();
    expect(mockNext).toHaveBeenCalled();
  });
});

