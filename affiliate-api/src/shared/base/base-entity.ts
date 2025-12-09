import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity, CreateDateColumn, UpdateDateColumn, PrimaryGeneratedColumn } from 'typeorm';

export abstract class CustomBaseEntity extends BaseEntity {
  @ApiProperty({ description: 'Unique identifier' })
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @ApiProperty({ description: 'Record creation timestamp' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @ApiProperty({ description: 'Record update timestamp' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
