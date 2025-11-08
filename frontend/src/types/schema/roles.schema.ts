export type Permission =
  | 'manage_roles'
  | 'manage_users'
  | 'manage_datasets'
  | 'manage_tasks'
  | 'manage_app'
  | 'view_overview'
  | 'read_users'
  | 'read_datasets'
  | 'read_tasks'
  | 'read_analysis';

export interface RoleData {
  name: string;
  description: string;
  permissions: Permission[];
}

export interface Role {
  uid: string;
  data: RoleData;
  createdAt: Date | string;
  createdBy: string;
  updatedAt: Date | string;
  updatedBy: string;
}

export interface CreateRoleRequest {
  name: string;
  description: string;
  permissions: Permission[];
}

export interface UpdateRoleRequest {
  name?: string;
  description?: string;
  permissions?: Permission[];
}

