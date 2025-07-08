import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../core/database/database.service';

@Injectable()
export class AppService {
  constructor(private readonly dbService: DatabaseService) {}

  async ping(): Promise<{ message: string; data?: [] }> {
    try {
      const [result] = await this.dbService.connection.raw('SELECT 1 as test');

      return { message: 'Hello API - DB OK', data: result };
    } catch (error) {
      return { message: 'Hello API - DB ERROR' };
    }
  }

  getData(): { message: string } {
    return { message: 'Hello API' };
  }
}
