import { DatabaseAdapter } from '@lib/database/base/BaseAdapter';
import { COLLECTIONS } from '@configs/constants';
import { Settings } from '@/types/schema/settings.schema';
import { generateUID } from '@utils';

export const initializeCollections = async (db: DatabaseAdapter): Promise<void> => {
  console.log('Initializing collections...');

  const collections = [
    COLLECTIONS.USERS,
    COLLECTIONS.ROLES,
    COLLECTIONS.FILES,
    COLLECTIONS.TASKS,
    COLLECTIONS.LOGS,
    COLLECTIONS.SETTINGS,
  ];

  for (const collectionName of collections) {
    const exists = await db.collectionExists(collectionName);
    if (!exists) {
      await db.createCollection(collectionName);
      console.log(`✓ Collection ${collectionName} created`);
    } else {
      console.log(`✓ Collection ${collectionName} already exists`);
    }
  }

  // Initialize settings document if it doesn't exist
  const settingsExists = await db.findOne(COLLECTIONS.SETTINGS, {});
  if (!settingsExists) {
    const now = new Date();
    const defaultSettings: Settings = {
      uid: generateUID(),
      data: {
        general: {
          appName: 'Dallosh Analysis',
          appDescription: 'Data analysis platform for customer reclamations',
          timeZone: 'UTC',
          isMaintenance: false,
        },
        ai: {
          preferences: {
            mode: 'local',
            default_local_model_id: undefined,
            default_external_model_id: undefined,
          },
          local: [],
          external: [],
        },
      },
      createdAt: now,
      createdBy: 'system',
      updatedAt: now,
      updatedBy: 'system',
    };

    await db.insertOne(COLLECTIONS.SETTINGS, defaultSettings);
    console.log('✓ Default settings document created');
  } else {
    console.log('✓ Settings document already exists');
  }

  console.log('Collections initialization completed');
};

