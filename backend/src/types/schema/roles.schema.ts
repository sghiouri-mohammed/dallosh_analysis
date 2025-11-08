export type Permission =
  | 'manage_users'
  | 'manage_datasets'
  | 'manage_tasks'
  | 'manage_app'
  | 'view_overview'
  | 'read_users'
  | 'read_datasets'
  | 'read_tasks';

export interface RoleData {
  name: string;
  description: string;
  permissions: Permission[];
}

export interface Role {
  uid: string;
  data: RoleData;
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  updatedBy: string;
}

