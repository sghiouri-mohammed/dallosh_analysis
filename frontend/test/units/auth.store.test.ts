/**
 * Unit tests for Auth Store (Zustand)
 */
import { useAuthStore } from '@/stores/auth';
import { authService } from '@/services/auth';
import apiClient from '@/services/client';

// Mock services
jest.mock('@/services/auth', () => ({
  authService: {
    login: jest.fn(),
    register: jest.fn(),
    me: jest.fn(),
    logout: jest.fn(),
  },
}));

jest.mock('@/services/client', () => ({
  __esModule: true,
  default: {
    setToken: jest.fn(),
    clearToken: jest.fn(),
  },
}));

const mockedAuthService = authService as jest.Mocked<typeof authService>;
const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('AuthStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset store state
    useAuthStore.setState({
      user: null,
      token: null,
      isAuthenticated: false,
    });
    
    // Clear localStorage
    localStorage.clear();
  });

  describe('Initial State', () => {
    it('should have initial state with null user and token', () => {
      const state = useAuthStore.getState();
      
      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });
  });

  describe('login', () => {
    it('should login user and update state', async () => {
      const mockUser = {
        uid: 'user-123',
        data: { email: 'test@example.com', roleId: 'role-123' },
      };
      const mockToken = 'test-token-123';

      mockedAuthService.login.mockResolvedValue({
        user: mockUser,
        token: mockToken,
      });

      await useAuthStore.getState().login('test@example.com', 'password123');

      const state = useAuthStore.getState();
      expect(state.user).toEqual(mockUser);
      expect(state.token).toBe(mockToken);
      expect(state.isAuthenticated).toBe(true);
      expect(mockedApiClient.setToken).toHaveBeenCalledWith(mockToken);
    });

    it('should handle login errors', async () => {
      mockedAuthService.login.mockRejectedValue(new Error('Login failed'));

      await expect(
        useAuthStore.getState().login('test@example.com', 'wrong-password')
      ).rejects.toThrow('Login failed');

      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(false);
    });
  });

  describe('register', () => {
    it('should register user and update state', async () => {
      const mockUser = {
        uid: 'user-123',
        data: { email: 'new@example.com', roleId: 'role-123' },
      };
      const mockToken = 'test-token-123';

      mockedAuthService.register.mockResolvedValue({
        user: mockUser,
        token: mockToken,
      });

      await useAuthStore.getState().register('new@example.com', 'password123');

      const state = useAuthStore.getState();
      expect(state.user).toEqual(mockUser);
      expect(state.token).toBe(mockToken);
      expect(state.isAuthenticated).toBe(true);
      expect(mockedApiClient.setToken).toHaveBeenCalledWith(mockToken);
    });
  });

  describe('logout', () => {
    it('should logout user and clear state', () => {
      // Set initial authenticated state
      useAuthStore.setState({
        user: { uid: 'user-123', data: { email: 'test@example.com' } },
        token: 'test-token',
        isAuthenticated: true,
      });

      useAuthStore.getState().logout();

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(mockedAuthService.logout).toHaveBeenCalled();
    });
  });

  describe('setUser', () => {
    it('should update user in state', () => {
      const newUser = {
        uid: 'user-456',
        data: { email: 'updated@example.com' },
      };

      useAuthStore.getState().setUser(newUser);

      const state = useAuthStore.getState();
      expect(state.user).toEqual(newUser);
    });
  });

  describe('setToken', () => {
    it('should set token and mark as authenticated', () => {
      const token = 'new-token-123';

      useAuthStore.getState().setToken(token);

      const state = useAuthStore.getState();
      expect(state.token).toBe(token);
      expect(state.isAuthenticated).toBe(true);
      expect(mockedApiClient.setToken).toHaveBeenCalledWith(token);
    });
  });

  describe('refreshUser', () => {
    it('should refresh user data', async () => {
      const mockUser = {
        uid: 'user-123',
        data: { email: 'test@example.com' },
      };

      mockedAuthService.me.mockResolvedValue(mockUser);

      await useAuthStore.getState().refreshUser();

      const state = useAuthStore.getState();
      expect(state.user).toEqual(mockUser);
    });

    it('should logout on refresh failure', async () => {
      mockedAuthService.me.mockRejectedValue(new Error('Unauthorized'));

      await useAuthStore.getState().refreshUser();

      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(false);
    });
  });

  describe('initialize', () => {
    it('should sync token with API client if token exists', () => {
      useAuthStore.setState({ token: 'existing-token' });

      useAuthStore.getState().initialize();

      expect(mockedApiClient.setToken).toHaveBeenCalledWith('existing-token');
    });

    it('should not sync token if token does not exist', () => {
      useAuthStore.setState({ token: null });

      useAuthStore.getState().initialize();

      expect(mockedApiClient.setToken).not.toHaveBeenCalled();
    });
  });
});

