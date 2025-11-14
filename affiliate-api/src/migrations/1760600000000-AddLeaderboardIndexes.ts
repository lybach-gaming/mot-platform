import { MigrationInterface, QueryRunner, TableIndex } from "typeorm";

export class AddLeaderboardIndexes1760600000000 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Optimized indexes for leaderboard queries

    // Index for referrals aggregation (used in leaderboard calculations)
    // Covers: project_id, referrer_address, verified, disqualified, created_at
    await queryRunner.createIndex('referrals', new TableIndex({
      name: 'idx_referrals_leaderboard',
      columnNames: ['project_id', 'referrer_address', 'verified', 'disqualified', 'created_at'],
    }));

    // Index for payments aggregation (used in earnings calculations)
    // Covers: project_id, invited_by_address, created_at, value
    await queryRunner.createIndex('payments', new TableIndex({
      name: 'idx_payments_leaderboard',
      columnNames: ['project_id', 'invited_by_address', 'created_at', 'value'],
    }));

    // Index for referrals by referrer (for user-specific queries)
    await queryRunner.createIndex('referrals', new TableIndex({
      name: 'idx_referrals_referrer',
      columnNames: ['referrer_address', 'project_id', 'verified', 'disqualified'],
    }));

    // Index for events aggregation (for future use with custom events)
    await queryRunner.createIndex('events', new TableIndex({
      name: 'idx_events_leaderboard',
      columnNames: ['project_id', 'referred_by_address', 'created_at', 'name'],
    }));

    // Composite index for affiliates lookup
    await queryRunner.createIndex('affiliates', new TableIndex({
      name: 'idx_affiliates_project_address',
      columnNames: ['project_id', 'address'],
    }));

    // Index for user lookups by address (for dashboard queries)
    await queryRunner.createIndex('users', new TableIndex({
      name: 'idx_users_address_project',
      columnNames: ['address', 'project_id'],
    }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes in reverse order
    await queryRunner.dropIndex('users', 'idx_users_address_project');
    await queryRunner.dropIndex('affiliates', 'idx_affiliates_project_address');
    await queryRunner.dropIndex('events', 'idx_events_leaderboard');
    await queryRunner.dropIndex('referrals', 'idx_referrals_referrer');
    await queryRunner.dropIndex('payments', 'idx_payments_leaderboard');
    await queryRunner.dropIndex('referrals', 'idx_referrals_leaderboard');
  }

}
