import { DatabaseAdapter } from '@lib/database/base/BaseAdapter';
import { COLLECTIONS, DEFAULT_ADMIN_EMAIL, DEFAULT_ADMIN_PASSWORD, PERMISSIONS } from '@configs/constants';
import { env } from '@configs/env';
import { User, UserData } from '@/types/schema/users.schema';
import { Role, RoleData } from '@/types/schema/roles.schema';
import { hashPassword, generateUID } from '@utils';

export const initializeRoot = async (db: DatabaseAdapter): Promise<void> => {
  console.log('Initializing root user and admin role...');

  // Check if admin role exists
  let adminRole = (await db.findOne(COLLECTIONS.ROLES, {
    'data.name': 'admin',
  })) as Role | null;

  if (!adminRole) {
    const now = new Date();
    const adminRoleData: RoleData = {
      name: 'admin',
      description: 'Administrator role with all permissions',
      permissions: [
        PERMISSIONS.MANAGE_USERS,
        PERMISSIONS.MANAGE_DATASETS,
        PERMISSIONS.MANAGE_TASKS,
        PERMISSIONS.MANAGE_APP,
        PERMISSIONS.VIEW_OVERVIEW,
        PERMISSIONS.READ_USERS,
        PERMISSIONS.READ_DATASETS,
        PERMISSIONS.READ_TASKS,
      ],
    };

    adminRole = {
      uid: generateUID(),
      data: adminRoleData,
      createdAt: now,
      createdBy: 'system',
      updatedAt: now,
      updatedBy: 'system',
    };

    await db.insertOne(COLLECTIONS.ROLES, adminRole);
    console.log('✓ Admin role created');
  } else {
    console.log('✓ Admin role already exists');
  }

  // Check if admin user exists
  const adminUser = (await db.findOne(COLLECTIONS.USERS, {
    'data.email': env.DEFAULT_ADMIN_EMAIL || DEFAULT_ADMIN_EMAIL,
  })) as User | null;

  if (!adminUser) {
    const hashedPassword = await hashPassword(env.DEFAULT_ADMIN_PASSWORD || DEFAULT_ADMIN_PASSWORD);
    const now = new Date();
    const adminUserData: UserData = {
      email: env.DEFAULT_ADMIN_EMAIL || DEFAULT_ADMIN_EMAIL,
      password: hashedPassword,
      roleId: adminRole.uid,
    };

    const newAdminUser: User = {
      uid: generateUID(),
      data: adminUserData,
      createdAt: now,
      createdBy: 'system',
      updatedAt: now,
      updatedBy: 'system',
    };

    await db.insertOne(COLLECTIONS.USERS, newAdminUser);
    console.log(`✓ Admin user created (email: ${env.DEFAULT_ADMIN_EMAIL || DEFAULT_ADMIN_EMAIL}, password: ${env.DEFAULT_ADMIN_PASSWORD ||  DEFAULT_ADMIN_PASSWORD})`);
  } else {
    console.log('✓ Admin user already exists');
  }

  console.log('Root initialization completed');
};

