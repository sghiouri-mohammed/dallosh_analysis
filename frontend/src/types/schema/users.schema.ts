export interface UserData {
  email: string;
  password?: string; // Optional in responses
  roleId?: string;
}

export interface User {
  uid: string;
  data: UserData;
  createdAt: Date | string;
  createdBy: string;
  updatedAt: Date | string;
  updatedBy: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  roleId?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface UpdateAccountRequest {
  email?: string;
  password?: string;
  roleId?: string;
}

