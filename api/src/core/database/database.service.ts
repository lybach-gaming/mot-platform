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

    if (await this.checkConnection()) {
      console.log('✅ Database connected');
    }
  }

  onModuleDestroy() {
    this.db?.destroy();
  }

  async checkConnection() {
    try {
      await this.db.raw('SELECT 1');
      return true;
    } catch (err) {
      console.error('DB not connected:', err);
      return false;
    }
  }

  get connection(): Knex {
    return this.db;
  }
}
