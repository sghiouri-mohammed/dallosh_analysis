import { BaseService } from '@common/services/BaseService';
import { Role, RoleData } from '@/types/schema/roles.schema';
import { generateUID } from '@utils';
import { COLLECTIONS } from '@configs/constants';

export class RolesService extends BaseService {
  async create(roleData: RoleData, createdBy: string): Promise<Role> {
    const now = new Date();
    const role: Role = {
      uid: generateUID(),
      data: roleData,
      createdAt: now,
      createdBy,
      updatedAt: now,
      updatedBy: createdBy,
    };

    await this.db.insertOne(COLLECTIONS.ROLES, role);
    return role;
  }

  async findAll(filter: any = {}, options: any = {}): Promise<Role[]> {
    return (await this.db.findMany(COLLECTIONS.ROLES, filter, options)) as Role[];
  }

  async findOne(uid: string): Promise<Role | null> {
    return (await this.db.findOne(COLLECTIONS.ROLES, { uid })) as Role | null;
  }

  async update(uid: string, updates: Partial<RoleData>, updatedBy: string): Promise<Role | null> {
    const updateData: any = {};
    if (updates.name) updateData['data.name'] = updates.name;
    if (updates.description) updateData['data.description'] = updates.description;
    if (updates.permissions) updateData['data.permissions'] = updates.permissions;

    updateData.updatedAt = new Date();
    updateData.updatedBy = updatedBy;

    await this.db.updateOne(COLLECTIONS.ROLES, { uid }, updateData);
    return await this.findOne(uid);
  }

  async delete(uid: string): Promise<boolean> {
    return await this.db.deleteOne(COLLECTIONS.ROLES, { uid });
  }
}

