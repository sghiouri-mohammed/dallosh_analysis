/**
 * Unit tests for Auth Service
 */
import { authService } from '@/services/auth';
import apiClient from '@/services/client';

// Mock the API client
jest.mock('@/services/client', () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
    get: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
    setToken: jest.fn(),
    clearToken: jest.fn(),
    getToken: jest.fn(),
  },
}));

const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    
    // Mock window object
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
      },
      writable: true,
    });
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            user: { uid: 'user-123', data: { email: 'test@example.com' } },
            token: 'test-token-123',
          },
          message: 'User registered successfully',
        },
      };

      mockedApiClient.post.mockResolvedValue(mockResponse);

      const result = await authService.register({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(mockedApiClient.post).toHaveBeenCalledWith(
        expect.any(String),
        { email: 'test@example.com', password: 'password123' }
      );
      expect(mockedApiClient.setToken).toHaveBeenCalledWith('test-token-123');
      expect(result.user).toEqual(mockResponse.data.data.user);
      expect(result.token).toBe('test-token-123');
    });

    it('should store user in localStorage', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            user: { uid: 'user-123', data: { email: 'test@example.com' } },
            token: 'test-token',
          },
          message: 'Success',
        },
      };

      mockedApiClient.post.mockResolvedValue(mockResponse);

      await authService.register({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'user',
        JSON.stringify(mockResponse.data.data.user)
      );
    });
  });

  describe('login', () => {
    it('should login user successfully', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            user: { uid: 'user-123', data: { email: 'test@example.com' } },
            token: 'test-token-123',
          },
          message: 'Login successful',
        },
      };

      mockedApiClient.post.mockResolvedValue(mockResponse);

      const result = await authService.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(mockedApiClient.post).toHaveBeenCalledWith(
        expect.any(String),
        { email: 'test@example.com', password: 'password123' }
      );
      expect(mockedApiClient.setToken).toHaveBeenCalledWith('test-token-123');
      expect(result.user).toEqual(mockResponse.data.data.user);
      expect(result.token).toBe('test-token-123');
    });
  });

  describe('me', () => {
    it('should get current user', async () => {
      const mockUser = {
        uid: 'user-123',
        data: { email: 'test@example.com', roleId: 'role-123' },
      };

      mockedApiClient.get.mockResolvedValue({
        success: true,
        data: mockUser,
        message: 'User retrieved',
      });

      const result = await authService.me();

      expect(mockedApiClient.get).toHaveBeenCalled();
      expect(result).toEqual(mockUser);
    });
  });

  describe('updateAccount', () => {
    it('should update user account', async () => {
      const mockUser = {
        uid: 'user-123',
        data: { email: 'updated@example.com' },
      };

      mockedApiClient.patch.mockResolvedValue({
        success: true,
        data: mockUser,
        message: 'Account updated',
      });

      const result = await authService.updateAccount({
        email: 'updated@example.com',
      });

      expect(mockedApiClient.patch).toHaveBeenCalled();
      expect(result).toEqual(mockUser);
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'user',
        JSON.stringify(mockUser)
      );
    });
  });

  describe('deleteAccount', () => {
    it('should delete user account', async () => {
      mockedApiClient.delete.mockResolvedValue({
        success: true,
        data: null,
        message: 'Account deleted',
      });

      await authService.deleteAccount();

      expect(mockedApiClient.delete).toHaveBeenCalled();
      expect(mockedApiClient.clearToken).toHaveBeenCalled();
    });
  });

  describe('refreshToken', () => {
    it('should refresh authentication token', async () => {
      const newToken = 'new-token-123';

      mockedApiClient.post.mockResolvedValue({
        success: true,
        data: { token: newToken },
        message: 'Token refreshed',
      });

      const result = await authService.refreshToken();

      expect(mockedApiClient.post).toHaveBeenCalled();
      expect(mockedApiClient.setToken).toHaveBeenCalledWith(newToken);
      expect(result).toBe(newToken);
    });
  });

  describe('logout', () => {
    it('should logout user and clear token', () => {
      authService.logout();

      expect(mockedApiClient.clearToken).toHaveBeenCalled();
    });
  });

  describe('isAuthenticated', () => {
    it('should return true when token exists', () => {
      mockedApiClient.getToken.mockReturnValue('test-token');

      const result = authService.isAuthenticated();

      expect(result).toBe(true);
    });

    it('should return false when token does not exist', () => {
      mockedApiClient.getToken.mockReturnValue(null);

      const result = authService.isAuthenticated();

      expect(result).toBe(false);
    });
  });
});

