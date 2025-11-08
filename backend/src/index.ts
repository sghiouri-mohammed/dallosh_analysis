import { env } from './configs/env';
import bootstrap from './main';
import { BootstrapConfig } from './types/configs';

const bootstrapConfigs: BootstrapConfig = {
  dbConfigs: {
    type: env.DB_TYPE as 'mongodb',
    host: env.DB_HOST,
    port: env.DB_PORT,
    dbname: env.DB_NAME,
    auth: env.DB_USER && env.DB_PASSWORD
      ? {
          username: env.DB_USER,
          password: env.DB_PASSWORD,
        }
      : undefined,
  },
};

bootstrap(bootstrapConfigs);