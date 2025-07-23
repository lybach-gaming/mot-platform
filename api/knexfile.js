import './env.js';

const config = {
  development: {
    client: 'mysql2',
    connection: process.env.DATABASE_URI,
    migrations: {
      directory: './migrations',
      tableName: 'knex_migrations',
    },
  },
  staging: {
    client: 'mysql2',
    connection: process.env.DATABASE_URI,
    migrations: {
      directory: './migrations',
      tableName: 'knex_migrations',
    },
  },
  production: {
    client: 'mysql2',
    connection: process.env.DATABASE_URI,
    migrations: {
      directory: './migrations',
      tableName: 'knex_migrations',
    },
  },
};

export default config;
