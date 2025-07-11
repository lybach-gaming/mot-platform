import { IUser } from '../../../core/database/types';

export interface GetUserByIdDto
  extends Omit<IUser, 'id' | 'status' | 'remove_ads' | 'coins'> {
  id: string;
  status: string;
  remove_ads: string;
  coins: string;

  all_time_score: string;
  all_time_rank: string;
}
