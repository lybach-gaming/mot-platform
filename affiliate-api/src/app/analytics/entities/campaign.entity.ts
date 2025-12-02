import { Column, Entity, Index } from 'typeorm';
import { CustomBaseEntity } from '../../../shared/base/base-entity';
import { CampaignMetadata, CampaignStatus } from '../types';
import { decimalTransformer } from '../../../shared/utils/decimal-transformer';

@Entity({ name: 'campaigns' })
@Index(['projectId', 'status'])
export class CampaignEntity extends CustomBaseEntity {

  @Column({ name: 'project_id', type: 'int' })
  @Index()
  projectId: number;

  @Column({ name: 'name', type: 'varchar' })
  name: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description?: string;

  @Column({
    name: 'status',
    type: 'enum',
    enum: CampaignStatus,
    default: CampaignStatus.ACTIVE
  })
  status: CampaignStatus;

  @Column({ name: 'start_date', type: 'timestamp' })
  startDate: Date;

  @Column({ name: 'end_date', type: 'timestamp', nullable: true })
  endDate?: Date;

  @Column({
    name: 'budget',
    type: 'decimal',
    precision: 20,
    scale: 2,
    nullable: true,
    transformer: decimalTransformer
  })
  budget?: number;

  @Column({ name: 'metadata', type: 'json', nullable: true })
  metadata?: CampaignMetadata | null;

  // createdAt and updatedAt inherited from CustomBaseEntity
}
