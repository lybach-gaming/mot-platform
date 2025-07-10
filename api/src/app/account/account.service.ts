import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../core/database/database.service';

@Injectable()
export class AccountService {
  constructor(private readonly dbService: DatabaseService) {}

  async getUserById(userId: number) {
    const result = await this.dbService.connection
      .table('tbl_users')
      .select(
        'id',
        'name',
        'email',
        'mobile',
        'profile',
        'firebase_id',
        'fcm_id',
        'friends_code',
        'refer_code',
        'type',
        'status',
        'remove_ads',
        'coins',
        // 'all_time_score',
        // 'all_time_rank',
        'date_registered'
      )
      .where('id', userId)
      .first();

    return { data: result, error: false };
  }
}
