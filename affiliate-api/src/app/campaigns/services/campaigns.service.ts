import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ForbiddenException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CampaignEntity, CampaignPromotionEntity } from '../entities';
import { CampaignStatus } from '../types';
import {
  CreateCampaignDto,
  UpdateCampaignDto,
  PromoteCampaignDto,
  CampaignQueryDto,
  CampaignResponseDto,
  CampaignsListResponseDto,
  PromotionResponseDto
} from '../dto';

@Injectable()
export class CampaignsService {
  private readonly logger = new Logger(CampaignsService.name);

  constructor(
    @InjectRepository(CampaignEntity)
    private campaignRepo: Repository<CampaignEntity>,
    @InjectRepository(CampaignPromotionEntity)
    private promotionRepo: Repository<CampaignPromotionEntity>
  ) {}

  async findAll(query: CampaignQueryDto): Promise<CampaignsListResponseDto> {
    const queryBuilder = this.campaignRepo.createQueryBuilder('campaign');

    // Apply filters
    if (query.status) {
      queryBuilder.andWhere('campaign.status = :status', { status: query.status });
    }

    if (query.topic) {
      queryBuilder.andWhere('campaign.topic = :topic', { topic: query.topic });
    }

    if (query.minRating) {
      queryBuilder.andWhere('campaign.rating >= :minRating', { minRating: query.minRating });
    }

    // Get total count before pagination
    const totalItems = await queryBuilder.getCount();

    // Apply sorting
    const sortField = this.mapSortField(query.sortBy);
    queryBuilder.orderBy(sortField, query.sortOrder);

    // Apply pagination
    queryBuilder.skip((query.page - 1) * query.limit).take(query.limit);

    const campaigns = await queryBuilder.getMany();

    const totalPages = Math.ceil(totalItems / query.limit);

    return {
      campaigns,
      page: query.page,
      limit: query.limit,
      totalItems,
      totalPages,
      hasNextPage: query.page < totalPages,
      hasPreviousPage: query.page > 1
    };
  }

  async findOne(id: number): Promise<CampaignResponseDto> {
    const campaign = await this.campaignRepo.findOne({ where: { id } });

    if (!campaign) {
      throw new NotFoundException(`Campaign with ID ${id} not found`);
    }

    return campaign;
  }

  async create(dto: CreateCampaignDto, userId: number): Promise<CampaignResponseDto> {
    // Check slug uniqueness
    const existing = await this.campaignRepo.findOne({ where: { slug: dto.slug } });
    if (existing) {
      throw new BadRequestException(`Campaign with slug "${dto.slug}" already exists`);
    }

    // Validate commission model structure
    this.validateCommissionModel(dto.commissionModel);

    const campaign = this.campaignRepo.create({
      ...dto,
      createdBy: userId,
      updatedBy: userId,
      activeAffiliates: 0
    });

    const saved = await this.campaignRepo.save(campaign);
    this.logger.log(`Campaign ${saved.id} "${saved.name}" created by user ${userId}`);

    return saved;
  }

  async update(id: number, dto: UpdateCampaignDto, userId: number): Promise<CampaignResponseDto> {
    const campaign = await this.campaignRepo.findOne({ where: { id } });

    if (!campaign) {
      throw new NotFoundException(`Campaign with ID ${id} not found`);
    }

    // Check slug uniqueness if changed
    if (dto.slug && dto.slug !== campaign.slug) {
      const existing = await this.campaignRepo.findOne({ where: { slug: dto.slug } });
      if (existing) {
        throw new BadRequestException(`Campaign with slug "${dto.slug}" already exists`);
      }
    }

    // Validate commission model if provided
    if (dto.commissionModel) {
      this.validateCommissionModel(dto.commissionModel);
    }

    Object.assign(campaign, dto);
    campaign.updatedBy = userId;

    const saved = await this.campaignRepo.save(campaign);
    this.logger.log(`Campaign ${id} "${saved.name}" updated by user ${userId}`);

    return saved;
  }

  async delete(id: number): Promise<void> {
    const campaign = await this.findOne(id);
    await this.campaignRepo.remove(campaign);
    this.logger.log(`Campaign ${id} "${campaign.name}" deleted`);
  }

  async promoteCampaign(
    campaignId: number,
    affiliateId: number,
    dto: PromoteCampaignDto
  ): Promise<PromotionResponseDto> {
    const campaign = await this.findOne(campaignId);

    // Validate campaign is active
    if (campaign.status !== CampaignStatus.ACTIVE) {
      throw new ForbiddenException(
        `Cannot promote campaign "${campaign.name}" - status is ${campaign.status}. Only active campaigns can be promoted.`
      );
    }

    // Check if already promoting
    const existing = await this.promotionRepo.findOne({
      where: { campaignId, affiliateId }
    });

    if (existing) {
      // Update promotion record
      existing.promotedAt = new Date();
      existing.channel = dto.channel;
      existing.metadata = dto.metadata;
      await this.promotionRepo.save(existing);

      this.logger.log(`Affiliate ${affiliateId} re-promoted campaign ${campaignId} "${campaign.name}"`);
    } else {
      // Create new promotion record
      const promotion = this.promotionRepo.create({
        campaignId,
        affiliateId,
        channel: dto.channel,
        metadata: dto.metadata
      });
      await this.promotionRepo.save(promotion);

      // Increment active affiliates counter
      await this.campaignRepo.increment({ id: campaignId }, 'activeAffiliates', 1);

      this.logger.log(`Affiliate ${affiliateId} started promoting campaign ${campaignId} "${campaign.name}"`);
    }

    return {
      success: true,
      message: 'Campaign promotion registered successfully',
      campaignId: campaign.id,
      campaignName: campaign.name,
      promotedAt: new Date(),
      channel: dto.channel
    };
  }

  private validateCommissionModel(model: any): void {
    // Validate based on commission type
    switch (model.type) {
      case 'fixed':
        if (!model.base.fixedAmount || model.base.fixedAmount <= 0) {
          throw new BadRequestException('Fixed commission requires a positive fixedAmount');
        }
        break;

      case 'percentage':
      case 'hybrid':
        if (!model.base.percentage || model.base.percentage <= 0 || model.base.percentage > 100) {
          throw new BadRequestException('Percentage must be between 0 and 100');
        }
        if (model.type === 'hybrid' && (!model.base.fixedAmount || model.base.fixedAmount <= 0)) {
          throw new BadRequestException('Hybrid commission requires both percentage and fixedAmount');
        }
        break;

      case 'recurring':
        if (!model.base.percentage || model.base.percentage <= 0 || model.base.percentage > 100) {
          throw new BadRequestException('Recurring commission requires a valid percentage');
        }
        if (!model.recurring || !model.recurring.interval) {
          throw new BadRequestException('Recurring commission requires interval configuration');
        }
        break;

      case 'tiered':
        if (!model.tiers || model.tiers.length === 0) {
          throw new BadRequestException('Tiered commission requires at least one tier');
        }
        break;

      case 'revenue_share':
        if (!model.base.percentage || model.base.percentage <= 0 || model.base.percentage > 100) {
          throw new BadRequestException('Revenue share requires a valid percentage');
        }
        if (!model.base.basis) {
          throw new BadRequestException('Revenue share requires basis (gross or net)');
        }
        break;

      default:
        throw new BadRequestException(`Unknown commission type: ${model.type}`);
    }
  }

  private mapSortField(sortBy?: string): string {
    const fieldMap: Record<string, string> = {
      rating: 'campaign.rating',
      activeAffiliates: 'campaign.activeAffiliates',
      name: 'campaign.name',
      createdAt: 'campaign.createdAt'
    };

    return fieldMap[sortBy || 'rating'] || 'campaign.rating';
  }
}
