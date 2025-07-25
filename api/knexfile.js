import './env.js';

const baseConfig = {
  client: 'mysql2',
  connection: process.env.DATABASE_URI,
  migrations: {
    directory: './migrations',
    tableName: 'knex_migrations',
  },
};

const config = {
  development: baseConfig,
  staging: baseConfig,
  production: baseConfig,
};

export default config;
