import { registerAs } from '@nestjs/config';
import { config as dotenvConfig } from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

dotenvConfig({ path: '.env' });
const config = {
  type: 'postgres',
  url: `${process.env.DATABASE_URL}`,
  autoLoadEntities: true,
  migrationsRun: true,
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
  ssl: process.env.DATABASE_URL?.includes('localhost') ? false : {
    rejectUnauthorized: false,
  },
  logging: true,
  prepare: false,
  synchronize: true,
  extra: {
    connectionTimeoutMillis: 100000, // 100 seconds
  },
  migrations: ['dist/migrations/*.js'],
  namingStrategy: new SnakeNamingStrategy(),

};
export default registerAs('typeorm', () => config);
export const connectionSource = new DataSource(config as DataSourceOptions);
