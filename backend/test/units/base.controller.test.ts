import { BaseController } from '@common/controllers/BaseController';
import { Response } from 'express';
import { DatabaseAdapter } from '@lib/database/base/BaseAdapter';

// Create a concrete implementation for testing
class TestController extends BaseController {
  testSuccess(data: any, message?: string, statusCode?: number) {
    this.success(this.mockRes as Response, data, message, statusCode);
  }

  testError(message: string, statusCode?: number, error?: any) {
    this.error(this.mockRes as Response, message, statusCode, error);
  }

  testHandleError(error: any) {
    this.handleError(error, this.mockRes as Response);
  }

  private mockRes: Partial<Response>;
  
  constructor(db: DatabaseAdapter, mockRes: Partial<Response>) {
    super(db);
    this.mockRes = mockRes;
  }
}

describe('BaseController', () => {
  let controller: TestController;
  let mockDb: jest.Mocked<DatabaseAdapter>;
  let mockRes: Partial<Response>;

  beforeEach(() => {
    mockDb = {
      findOne: jest.fn(),
      insertOne: jest.fn(),
      findMany: jest.fn(),
      updateOne: jest.fn(),
      deleteOne: jest.fn(),
      insertMany: jest.fn(),
      updateMany: jest.fn(),
      deleteMany: jest.fn(),
      count: jest.fn(),
      connect: jest.fn(),
      disconnect: jest.fn(),
      createCollection: jest.fn(),
      collectionExists: jest.fn(),
    } as any;

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    controller = new TestController(mockDb, mockRes);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('success', () => {
    it('should send success response with default status code', () => {
      const data = { id: 1, name: 'Test' };
      const message = 'Operation successful';

      controller.testSuccess(data, message);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message,
        data,
      });
    });

    it('should send success response with custom status code', () => {
      const data = { id: 1 };
      const message = 'Created successfully';
      const statusCode = 201;

      controller.testSuccess(data, message, statusCode);

      expect(mockRes.status).toHaveBeenCalledWith(statusCode);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message,
        data,
      });
    });

    it('should use default message when not provided', () => {
      const data = { id: 1 };

      controller.testSuccess(data);

      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Operation successful',
        data,
      });
    });

    it('should handle null data', () => {
      controller.testSuccess(null, 'Deleted successfully');

      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Deleted successfully',
        data: null,
      });
    });
  });

  describe('error', () => {
    it('should send error response with default status code', () => {
      const message = 'Bad request';

      controller.testError(message);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message,
        error: undefined,
      });
    });

    it('should send error response with custom status code', () => {
      const message = 'Not found';
      const statusCode = 404;

      controller.testError(message, statusCode);

      expect(mockRes.status).toHaveBeenCalledWith(statusCode);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message,
        error: undefined,
      });
    });

    it('should include error details when provided', () => {
      const message = 'Validation error';
      const error = new Error('Invalid input');

      controller.testError(message, 400, error);

      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message,
        error: error.message,
      });
    });

    it('should handle error object without message property', () => {
      const message = 'Error occurred';
      const error = { code: 'ERR001', details: 'Some details' };

      controller.testError(message, 500, error);

      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message,
        error,
      });
    });
  });

  describe('handleError', () => {
    it('should handle Error object', () => {
      const error = new Error('Database connection failed');
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      controller.testHandleError(error);

      expect(consoleSpy).toHaveBeenCalledWith('Controller error:', error);
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: error.message,
        error: error,
      });

      consoleSpy.mockRestore();
    });

    it('should handle error without message', () => {
      const error = { code: 'ERR001' };
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      controller.testHandleError(error);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Internal server error',
        error: error,
      });

      consoleSpy.mockRestore();
    });

    it('should handle string error', () => {
      const error = 'Simple error message';
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      controller.testHandleError(error);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Internal server error',
        error: error,
      });

      consoleSpy.mockRestore();
    });

    it('should handle null error', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      controller.testHandleError(null);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Internal server error',
        error: null,
      });

      consoleSpy.mockRestore();
    });
  });
});

