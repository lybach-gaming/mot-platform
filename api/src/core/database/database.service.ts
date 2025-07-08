import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import knex, { Knex } from 'knex';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private db!: Knex;

  async onModuleInit() {
    this.db = knex({
      client: 'mysql2',
      connection: {
        uri: process.env.DATABASE_URI,
      },
      pool: { min: 5, max: 100 },
    });
    console.log('✅ Database connected');
  }

  onModuleDestroy() {
    this.db?.destroy();
  }

  get connection(): Knex {
    return this.db;
  }
}
