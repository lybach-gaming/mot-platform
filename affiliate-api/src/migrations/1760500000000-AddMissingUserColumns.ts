import { MigrationInterface, QueryRunner, TableColumn, TableIndex } from "typeorm";

export class AddMissingUserColumns1760500000000 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add timezone column
    await queryRunner.addColumn('users', new TableColumn({
      name: 'timezone',
      type: 'varchar',
      isNullable: true,
    }));

    // Add country column
    await queryRunner.addColumn('users', new TableColumn({
      name: 'country',
      type: 'varchar',
      isNullable: true,
    }));

    // Add referral_slug column with unique constraint
    await queryRunner.addColumn('users', new TableColumn({
      name: 'referral_slug',
      type: 'varchar',
      isNullable: true,
      isUnique: true,
    }));

    // Add unique index for referral_slug
    await queryRunner.createIndex('users', new TableIndex({
      name: 'idx_users_referral_slug',
      columnNames: ['referral_slug'],
      isUnique: true,
    }));

    // Add payout_currency column
    await queryRunner.addColumn('users', new TableColumn({
      name: 'payout_currency',
      type: 'varchar',
      isNullable: true,
    }));

    // Add privacy column
    await queryRunner.addColumn('users', new TableColumn({
      name: 'privacy',
      type: 'json',
      isNullable: true,
    }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop index first
    await queryRunner.dropIndex('users', 'idx_users_referral_slug');
    
    // Drop columns in reverse order
    await queryRunner.dropColumn('users', 'privacy');
    await queryRunner.dropColumn('users', 'payout_currency');
    await queryRunner.dropColumn('users', 'referral_slug');
    await queryRunner.dropColumn('users', 'country');
    await queryRunner.dropColumn('users', 'timezone');
  }

}

