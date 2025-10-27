import { ApiProperty } from '@nestjs/swagger';
import {
  BaseEntity,
  BeforeInsert,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  BeforeUpdate,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

export abstract class CustomBaseEntity extends BaseEntity {
  @ApiProperty({ description: 'Unique identifier', example: '550e8400-e29b-41d4-a716-446655440000' })
  @PrimaryGeneratedColumn('uuid') // Ensures UUID generation
  id!: string;

  @ApiProperty({ description: 'Record creation timestamp', example: '2025-02-05T10:30:00Z' })
  @CreateDateColumn()
  createdAt!: Date;

  @ApiProperty({ description: 'Record update timestamp', example: '2025-02-05T10:30:00Z' })
  @UpdateDateColumn()
  updatedAt!: Date;

  @BeforeInsert()
  updateTimestampBeforeInsert() {
    if (!this.id) {
      this.id = uuidv4(); // Generates UUID if not set
    }
    this.createdAt = new Date();
    this.updatedAt = this.updatedAt ?? new Date();
  }

  @BeforeUpdate()
  updateTimestampBeforeUpdate() {
    this.updatedAt = new Date();
  }
}
