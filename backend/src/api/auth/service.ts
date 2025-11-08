import { BaseService } from '@common/services/BaseService';
import { User, UserData } from '@/types/schema/users.schema';
import { hashPassword, comparePassword, signToken, generateUID } from '@utils';
import { COLLECTIONS } from '@configs/constants';

export class AuthService extends BaseService {
  async register(email: string, password: string, roleId?: string): Promise<{ user: User; token: string }> {
    // Check if user already exists
    const existingUser = await this.db.findOne(COLLECTIONS.USERS, {
      'data.email': email,
    });

    if (existingUser) {
      throw new Error('User already exists');
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const userData: UserData = {
      email,
      password: hashedPassword,
      roleId,
    };

    const now = new Date();
    const user: User = {
      uid: generateUID(),
      data: userData,
      createdAt: now,
      createdBy: 'system',
      updatedAt: now,
      updatedBy: 'system',
    };

    await this.db.insertOne(COLLECTIONS.USERS, user);

    // Generate token
    const token = signToken({
      uid: user.uid,
      email: user.data.email,
      roleId: user.data.roleId,
    });

    return { user, token };
  }

  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const user = await this.db.findOne(COLLECTIONS.USERS, {
      'data.email': email,
    }) as User | null;

    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isPasswordValid = await comparePassword(password, user.data.password);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    const token = signToken({
      uid: user.uid,
      email: user.data.email,
      roleId: user.data.roleId,
    });

    return { user, token };
  }

  async getMe(uid: string): Promise<User | null> {
    return (await this.db.findOne(COLLECTIONS.USERS, { uid })) as User | null;
  }

  async updateAccount(uid: string, updates: Partial<UserData>, updatedBy: string): Promise<User | null> {
    const updateData: any = {};
    if (updates.email) updateData['data.email'] = updates.email;
    if (updates.password) {
      updateData['data.password'] = await hashPassword(updates.password);
    }
    if (updates.roleId !== undefined) updateData['data.roleId'] = updates.roleId;

    updateData.updatedAt = new Date();
    updateData.updatedBy = updatedBy;

    await this.db.updateOne(COLLECTIONS.USERS, { uid }, updateData);
    return await this.getMe(uid);
  }

  async deleteAccount(uid: string): Promise<boolean> {
    return await this.db.deleteOne(COLLECTIONS.USERS, { uid });
  }

  async refreshToken(uid: string): Promise<string> {
    const user = await this.getMe(uid);
    if (!user) {
      throw new Error('User not found');
    }

    return signToken({
      uid: user.uid,
      email: user.data.email,
      roleId: user.data.roleId,
    });
  }
}

