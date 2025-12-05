import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ForbiddenException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OfferEntity, OfferPromotionEntity } from '../entities';
import { OfferStatus } from '../types';
import {
  CreateOfferDto,
  UpdateOfferDto,
  PromoteOfferDto,
  OfferQueryDto,
  OfferResponseDto,
  OffersListResponseDto,
  PromotionResponseDto
} from '../dto';

@Injectable()
export class OffersService {
  private readonly logger = new Logger(OffersService.name);

  constructor(
    @InjectRepository(OfferEntity)
    private offerRepo: Repository<OfferEntity>,
    @InjectRepository(OfferPromotionEntity)
    private promotionRepo: Repository<OfferPromotionEntity>
  ) {}

  async findAll(query: OfferQueryDto): Promise<OffersListResponseDto> {
    const queryBuilder = this.offerRepo.createQueryBuilder('offer');

    // Apply filters
    if (query.status) {
      queryBuilder.andWhere('offer.status = :status', { status: query.status });
    }

    if (query.topic) {
      queryBuilder.andWhere('offer.topic = :topic', { topic: query.topic });
    }

    if (query.minRating) {
      queryBuilder.andWhere('offer.rating >= :minRating', { minRating: query.minRating });
    }

    // Get total count before pagination
    const totalItems = await queryBuilder.getCount();

    // Apply sorting
    const sortField = this.mapSortField(query.sortBy);
    queryBuilder.orderBy(sortField, query.sortOrder);

    // Apply pagination
    queryBuilder.skip((query.page - 1) * query.limit).take(query.limit);

    const offers = await queryBuilder.getMany();

    const totalPages = Math.ceil(totalItems / query.limit);

    return {
      offers,
      page: query.page,
      limit: query.limit,
      totalItems,
      totalPages,
      hasNextPage: query.page < totalPages,
      hasPreviousPage: query.page > 1
    };
  }

  async findOne(id: number): Promise<OfferResponseDto> {
    const offer = await this.offerRepo.findOne({ where: { id } });

    if (!offer) {
      throw new NotFoundException(`Offer with ID ${id} not found`);
    }

    return offer;
  }

  async create(dto: CreateOfferDto, userId: number): Promise<OfferResponseDto> {
    // Check slug uniqueness
    const existing = await this.offerRepo.findOne({ where: { slug: dto.slug } });
    if (existing) {
      throw new BadRequestException(`Offer with slug "${dto.slug}" already exists`);
    }

    // Validate commission model structure
    this.validateCommissionModel(dto.commissionModel);

    const offer = this.offerRepo.create({
      ...dto,
      createdBy: userId,
      updatedBy: userId,
      activeAffiliates: 0
    });

    const saved = await this.offerRepo.save(offer);
    this.logger.log(`Offer ${saved.id} "${saved.name}" created by user ${userId}`);

    return saved;
  }

  async update(id: number, dto: UpdateOfferDto, userId: number): Promise<OfferResponseDto> {
    const offer = await this.findOne(id);

    // Check slug uniqueness if changed
    if (dto.slug && dto.slug !== offer.slug) {
      const existing = await this.offerRepo.findOne({ where: { slug: dto.slug } });
      if (existing) {
        throw new BadRequestException(`Offer with slug "${dto.slug}" already exists`);
      }
    }

    // Validate commission model if provided
    if (dto.commissionModel) {
      this.validateCommissionModel(dto.commissionModel);
    }

    Object.assign(offer, dto);
    offer.updatedBy = userId;

    const saved = await this.offerRepo.save(offer);
    this.logger.log(`Offer ${id} "${saved.name}" updated by user ${userId}`);

    return saved;
  }

  async delete(id: number): Promise<void> {
    const offer = await this.findOne(id);
    await this.offerRepo.remove(offer);
    this.logger.log(`Offer ${id} "${offer.name}" deleted`);
  }

  async promoteOffer(
    offerId: number,
    affiliateId: number,
    dto: PromoteOfferDto
  ): Promise<PromotionResponseDto> {
    const offer = await this.findOne(offerId);

    // Validate offer is active
    if (offer.status !== OfferStatus.ACTIVE) {
      throw new ForbiddenException(
        `Cannot promote offer "${offer.name}" - status is ${offer.status}. Only active offers can be promoted.`
      );
    }

    // Check if already promoting
    const existing = await this.promotionRepo.findOne({
      where: { offerId, affiliateId }
    });

    if (existing) {
      // Update promotion record
      existing.promotedAt = new Date();
      existing.channel = dto.channel;
      existing.metadata = dto.metadata;
      await this.promotionRepo.save(existing);

      this.logger.log(`Affiliate ${affiliateId} re-promoted offer ${offerId} "${offer.name}"`);
    } else {
      // Create new promotion record
      const promotion = this.promotionRepo.create({
        offerId,
        affiliateId,
        channel: dto.channel,
        metadata: dto.metadata
      });
      await this.promotionRepo.save(promotion);

      // Increment active affiliates counter
      await this.offerRepo.increment({ id: offerId }, 'activeAffiliates', 1);

      this.logger.log(`Affiliate ${affiliateId} started promoting offer ${offerId} "${offer.name}"`);
    }

    return {
      success: true,
      message: 'Offer promotion registered successfully',
      offerId: offer.id,
      offerName: offer.name,
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
      rating: 'offer.rating',
      activeAffiliates: 'offer.activeAffiliates',
      name: 'offer.name',
      createdAt: 'offer.createdAt'
    };

    return fieldMap[sortBy || 'rating'] || 'offer.rating';
  }
}
