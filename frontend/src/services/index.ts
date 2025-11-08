/**
 * API Services SDK
 * 
 * This module exports all service clients as a unified SDK.
 * Use these services throughout the application to communicate with the backend.
 * 
 * @example
 * ```typescript
 * import { authService, tasksService } from '@/services';
 * 
 * // Login
 * const { user, token } = await authService.login({ email, password });
 * 
 * // Listen to task events
 * await tasksService.onTaskEvent(fileId, (message) => {
 *   console.log('Task event:', message);
 * });
 * ```
 */

// Export base client
export { default as apiClient } from './client';

// Export all services
export { authService } from './auth';
export { usersService } from './users';
export { rolesService } from './roles';
export { filesService } from './files';
export { tasksService } from './tasks';
export { logsService } from './logs';
export { settingsService } from './settings';

// Re-export types for convenience
export * from '@/types';

