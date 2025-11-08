export interface UserData {
  email: string;
  password: string;
  roleId?: string;
}

export interface User {
  uid: string;
  data: UserData;
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  updatedBy: string;
}

