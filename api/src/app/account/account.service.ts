import { Injectable } from '@nestjs/common';
import {
  BASE_URL,
  DEFAULT_DATETIME_FORMAT,
  USER_IMG_PATH,
} from '../../common/constants/app';
import { IApiResponse } from '../../common/types/response.type';
import { isValidUrl, urlJoin } from '../../common/utils/string.util';
import { DatabaseService } from '../../core/database/database.service';
import { USERS_BADGES_SCHEMA, USERS_SCHEMA } from '../../core/database/schemas';
import { EUserStatus, IUser, IUserBadge } from '../../core/database/types';
import { GetUserByIdDto } from './dto/get-user-by-id.dto';
import dayjs from 'dayjs';

@Injectable()
export class AccountService {
  constructor(private readonly dbService: DatabaseService) {}

  async getUserById(userId: number): Promise<IApiResponse<GetUserByIdDto>> {
    const user: IUser = await this.dbService.connection
      .table(USERS_SCHEMA.TABLE)
      .select(
        USERS_SCHEMA.FIELDS.ID,
        USERS_SCHEMA.FIELDS.NAME,
        USERS_SCHEMA.FIELDS.EMAIL,
        USERS_SCHEMA.FIELDS.MOBILE,
        USERS_SCHEMA.FIELDS.PROFILE,
        USERS_SCHEMA.FIELDS.FIREBASE_ID,
        USERS_SCHEMA.FIELDS.FCM_ID,
        USERS_SCHEMA.FIELDS.FRIENDS_CODE,
        USERS_SCHEMA.FIELDS.REFER_CODE,
        USERS_SCHEMA.FIELDS.TYPE,
        USERS_SCHEMA.FIELDS.STATUS,
        USERS_SCHEMA.FIELDS.REMOVE_ADS,
        USERS_SCHEMA.FIELDS.COINS,
        USERS_SCHEMA.FIELDS.DATE_REGISTERED
      )
      .where(USERS_SCHEMA.FIELDS.ID, userId)
      .first();

    if (!user) {
      return { message: 'NOT', error: true };
    }

    const userBadge: IUserBadge = await this.dbService.connection
      .table(USERS_BADGES_SCHEMA.TABLE)

      .where(USERS_BADGES_SCHEMA.FIELDS.USER_ID, userId)
      .first();

    if (!userBadge) {
      const counter = 0;
      const newUserBadge = {
        user_id: userId,
        dashing_debut: counter,
        dashing_debut_counter: counter,
        combat_winner: counter,
        combat_winner_counter: counter,
        clash_winner: counter,
        clash_winner_counter: counter,
        most_wanted_winner: counter,
        most_wanted_winner_counter: counter,
        ultimate_player: counter,
        quiz_warrior: counter,
        quiz_warrior_counter: counter,
        super_sonic: counter,
        flashback: counter,
        brainiac: counter,
        big_thing: counter,
        elite: counter,
        thirsty: counter,
        thirsty_date: '0000-00-00',
        thirsty_counter: counter,
        power_elite: counter,
        power_elite_counter: counter,
        sharing_caring: counter,
        streak: counter,
        streak_date: '0000-00-00',
        streak_counter: counter,
      };

      await this.dbService.connection
        .table(USERS_BADGES_SCHEMA.TABLE)
        .insert(newUserBadge);
    }

    if (user?.profile && !isValidUrl(user?.profile)) {
      user.profile = user.profile
        ? urlJoin(BASE_URL, USER_IMG_PATH, user.profile)
        : '';
    }

    const myRank: { score: number | null; user_rank: number | null } =
      await this.dbService.connection.raw(
        `
      SELECT r.score, r.user_rank
      FROM (
        SELECT s.*, @user_rank := @user_rank + 1 AS user_rank
        FROM (
          SELECT m.user_id, SUM(m.score) AS score
          FROM tbl_leaderboard_monthly m
          JOIN tbl_users u ON u.id = m.user_id
          GROUP BY m.user_id
        ) s, (SELECT @user_rank := 0) init
        ORDER BY score DESC
      ) r
      INNER JOIN tbl_users u ON u.id = r.user_id
      WHERE r.user_id = ?
      `,
        [userId]
      );

    const response: GetUserByIdDto = {
      ...user,
      id: user?.id?.toString(),
      status: (user?.status || EUserStatus.Inactive)?.toString(),
      remove_ads: (user?.remove_ads || 0)?.toString(),
      coins: (user?.coins || 0)?.toString(),
      date_registered: dayjs(user?.date_registered)?.format(
        DEFAULT_DATETIME_FORMAT
      ),
      all_time_score: (myRank?.score || 0)?.toString(),
      all_time_rank: (myRank?.user_rank || 0)?.toString(),
    };

    return { data: response, error: false };
  }
}
