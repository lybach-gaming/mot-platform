import { MigrationInterface, QueryRunner, Table, TableIndex, TableUnique } from "typeorm";

export class InitialAffiliateSchema1760413746161 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    // projects
    await queryRunner.createTable(new Table({
      name: 'projects',
      columns: [
        { name: 'id', type: 'serial', isPrimary: true },
        { name: 'slug', type: 'varchar', isUnique: true, isNullable: false, comment: 'tenant identifier' },
        { name: 'name', type: 'varchar', isNullable: true },
        { name: 'api_secret_hash', type: 'varchar', isNullable: true, comment: 'hashed api secret for private endpoints' },
        { name: 'config', type: 'json', isNullable: true },
        { name: 'created_at', type: 'timestamp', default: 'now()' },
        { name: 'updated_at', type: 'timestamp', default: 'now()' },
      ],
    }), true);

    // users
    await queryRunner.createTable(new Table({
      name: 'users',
      columns: [
        { name: 'id', type: 'serial', isPrimary: true },
        { name: 'project_id', type: 'int', isNullable: false },
        { name: 'project_user_id', type: 'varchar', isNullable: true },
        { name: 'address', type: 'varchar', isNullable: true },
        { name: 'email', type: 'varchar', isNullable: true },
        { name: 'chain', type: 'varchar', isNullable: true },
        { name: 'metadata', type: 'json', isNullable: true },
        { name: 'created_at', type: 'timestamp', default: 'now()' },
        { name: 'updated_at', type: 'timestamp', default: 'now()' },
      ],
      foreignKeys: [
        {
          columnNames: ['project_id'],
          referencedTableName: 'projects',
          referencedColumnNames: ['id'],
          onDelete: 'CASCADE',
        },
      ],
    }), true);

    await queryRunner.createIndex('users', new TableIndex({
      name: 'idx_users_project_address',
      columnNames: ['project_id', 'address'],
    }));
    await queryRunner.createIndex('users', new TableIndex({
      name: 'idx_users_project_email',
      columnNames: ['project_id', 'email'],
    }));

    // invite_codes
    await queryRunner.createTable(new Table({
      name: 'invite_codes',
      columns: [
        { name: 'id', type: 'serial', isPrimary: true },
        { name: 'project_id', type: 'int', isNullable: false },
        { name: 'project_user_id', type: 'varchar', isNullable: true },
        { name: 'code', type: 'varchar', isNullable: false, isUnique: true },
        { name: 'address', type: 'varchar', isNullable: true },
        { name: 'created_at', type: 'timestamp', default: 'now()' },
      ],
      foreignKeys: [
        {
          columnNames: ['project_id'],
          referencedTableName: 'projects',
          referencedColumnNames: ['id'],
          onDelete: 'CASCADE',
        },
      ],
    }), true);

    // affiliates
    await queryRunner.createTable(new Table({
      name: 'affiliates',
      columns: [
        { name: 'id', type: 'serial', isPrimary: true },
        { name: 'project_id', type: 'int', isNullable: false },
        { name: 'project_user_id', type: 'varchar', isNullable: true },
        { name: 'address', type: 'varchar', isNullable: true },
        { name: 'referral_code', type: 'varchar', isNullable: true, isUnique: true },
        { name: 'metadata', type: 'json', isNullable: true },
        { name: 'stats', type: 'json', isNullable: true },
        { name: 'created_at', type: 'timestamp', default: 'now()' },
        { name: 'updated_at', type: 'timestamp', default: 'now()' },
      ],
      foreignKeys: [
        {
          columnNames: ['project_id'],
          referencedTableName: 'projects',
          referencedColumnNames: ['id'],
          onDelete: 'CASCADE',
        },
      ],
    }), true);
    await queryRunner.createIndex('affiliates', new TableIndex({
      name: 'idx_affiliates_project_address',
      columnNames: ['project_id', 'address'],
    }));

    // referrals
    await queryRunner.createTable(new Table({
      name: 'referrals',
      columns: [
        { name: 'id', type: 'serial', isPrimary: true },
        { name: 'project_id', type: 'int', isNullable: false },
        { name: 'referee_user_id', type: 'int', isNullable: true },
        { name: 'referee_address', type: 'varchar', isNullable: true },
        { name: 'referee_email', type: 'varchar', isNullable: true },
        { name: 'referrer_project_user_id', type: 'varchar', isNullable: true },
        { name: 'referrer_address', type: 'varchar', isNullable: true },
        { name: 'transaction_hash', type: 'varchar', isNullable: true },
        { name: 'chain', type: 'varchar', isNullable: true },
        { name: 'minter', type: 'varchar', isNullable: true },
        { name: 'verified', type: 'boolean', default: false },
        { name: 'disqualified', type: 'boolean', default: false },
        { name: 'created_at', type: 'timestamp', default: 'now()' },
      ],
      uniques: [
        new TableUnique({
          name: 'uq_referrals_project_txhash',
          columnNames: ['project_id', 'transaction_hash'],
        }),
      ],
      foreignKeys: [
        {
          columnNames: ['project_id'],
          referencedTableName: 'projects',
          referencedColumnNames: ['id'],
          onDelete: 'CASCADE',
        },
        {
          columnNames: ['referee_user_id'],
          referencedTableName: 'users',
          referencedColumnNames: ['id'],
          onDelete: 'SET NULL',
        },
      ],
    }), true);
    await queryRunner.createIndex('referrals', new TableIndex({
      name: 'idx_referrals_project_referee_address',
      columnNames: ['project_id', 'referee_address'],
    }));

    // events
    await queryRunner.createTable(new Table({
      name: 'events',
      columns: [
        { name: 'id', type: 'serial', isPrimary: true },
        { name: 'project_id', type: 'int', isNullable: false },
        { name: 'name', type: 'varchar', isNullable: false },
        { name: 'value', type: 'decimal', precision: 18, scale: 8, isNullable: true },
        { name: 'user_id', type: 'int', isNullable: true },
        { name: 'address', type: 'varchar', isNullable: true },
        { name: 'email', type: 'varchar', isNullable: true },
        { name: 'referred_by_code', type: 'varchar', isNullable: true },
        { name: 'referred_by_address', type: 'varchar', isNullable: true },
        { name: 'created_at', type: 'timestamp', default: 'now()' },
      ],
      foreignKeys: [
        {
          columnNames: ['project_id'],
          referencedTableName: 'projects',
          referencedColumnNames: ['id'],
          onDelete: 'CASCADE',
        },
        {
          columnNames: ['user_id'],
          referencedTableName: 'users',
          referencedColumnNames: ['id'],
          onDelete: 'SET NULL',
        },
      ],
    }), true);

    // payments
    await queryRunner.createTable(new Table({
      name: 'payments',
      columns: [
        { name: 'id', type: 'serial', isPrimary: true },
        { name: 'project_id', type: 'int', isNullable: false },
        { name: 'user_id', type: 'int', isNullable: true },
        { name: 'address', type: 'varchar', isNullable: true },
        { name: 'email', type: 'varchar', isNullable: true },
        { name: 'invited_by_id', type: 'varchar', isNullable: true },
        { name: 'invited_by_address', type: 'varchar', isNullable: true },
        { name: 'value', type: 'decimal', precision: 30, scale: 8, default: 0 },
        { name: 'quantity', type: 'int', isNullable: true },
        { name: 'chain', type: 'varchar', isNullable: true },
        { name: 'transaction_hash', type: 'varchar', isNullable: true },
        { name: 'created_at', type: 'timestamp', default: 'now()' },
      ],
      uniques: [
        new TableUnique({
          name: 'uq_payments_project_txhash',
          columnNames: ['project_id', 'transaction_hash'],
        }),
      ],
      foreignKeys: [
        {
          columnNames: ['project_id'],
          referencedTableName: 'projects',
          referencedColumnNames: ['id'],
          onDelete: 'CASCADE',
        },
        {
          columnNames: ['user_id'],
          referencedTableName: 'users',
          referencedColumnNames: ['id'],
          onDelete: 'SET NULL',
        },
      ],
    }), true);
    await queryRunner.createIndex('payments', new TableIndex({
      name: 'idx_payments_project_invited_by_address',
      columnNames: ['project_id', 'invited_by_address'],
    }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('payments', true);
    await queryRunner.dropTable('events', true);
    await queryRunner.dropTable('referrals', true);
    await queryRunner.dropTable('affiliates', true);
    await queryRunner.dropTable('invite_codes', true);
    await queryRunner.dropTable('users', true);
    await queryRunner.dropTable('projects', true);
  }

}
