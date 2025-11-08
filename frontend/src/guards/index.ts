/**
 * Route Guards
 * 
 * Reusable guard components for protecting routes based on authentication and roles.
 * 
 * @example
 * ```tsx
 * // In a page or layout
 * import { ProtectedGuard, AdminGuard } from '@/guards';
 * 
 * export default function AdminPage() {
 *   return (
 *     <ProtectedGuard>
 *       <AdminGuard>
 *         <YourPageContent />
 *       </AdminGuard>
 *     </ProtectedGuard>
 *   );
 * }
 * ```
 */

export { AuthGuard } from './AuthGuard';
export { ProtectedGuard } from './ProtectedGuard';
export { RoleGuard } from './RoleGuard';
export { AdminGuard } from './AdminGuard';
export { GuestGuard } from './GuestGuard';

