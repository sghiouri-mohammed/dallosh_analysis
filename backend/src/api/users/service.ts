import { BaseService } from '@common/services/BaseService';
import { User, UserData } from '@/types/schema/users.schema';
import { hashPassword, generateUID } from '@utils';
import { COLLECTIONS } from '@configs/constants';

export class UsersService extends BaseService {
  async create(userData: UserData, createdBy: string): Promise<User> {
    if (userData.password) {
      userData.password = await hashPassword(userData.password);
    }

    const now = new Date();
    const user: User = {
      uid: generateUID(),
      data: userData,
      createdAt: now,
      createdBy,
      updatedAt: now,
      updatedBy: createdBy,
    };

    await this.db.insertOne(COLLECTIONS.USERS, user);
    return user;
  }

  async findAll(filter: any = {}, options: any = {}): Promise<User[]> {
    return (await this.db.findMany(COLLECTIONS.USERS, filter, options)) as User[];
  }

  async findOne(uid: string): Promise<User | null> {
    return (await this.db.findOne(COLLECTIONS.USERS, { uid })) as User | null;
  }

  async update(uid: string, updates: Partial<UserData>, updatedBy: string): Promise<User | null> {
    const updateData: any = {};
    if (updates.email) updateData['data.email'] = updates.email;
    if (updates.password) {
      updateData['data.password'] = await hashPassword(updates.password);
    }
    if (updates.roleId !== undefined) updateData['data.roleId'] = updates.roleId;

    updateData.updatedAt = new Date();
    updateData.updatedBy = updatedBy;

    await this.db.updateOne(COLLECTIONS.USERS, { uid }, updateData);
    return await this.findOne(uid);
  }

  async delete(uid: string): Promise<boolean> {
    return await this.db.deleteOne(COLLECTIONS.USERS, { uid });
  }
}

