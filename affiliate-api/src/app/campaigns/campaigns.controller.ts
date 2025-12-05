import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam
} from '@nestjs/swagger';
import { OffersService } from './services';
import {
  CreateOfferDto,
  UpdateOfferDto,
  PromoteOfferDto,
  OfferQueryDto,
  OfferResponseDto,
  OffersListResponseDto,
  PromotionResponseDto
} from './dto';

@Controller('offers')
@ApiTags('Offers')
export class OffersController {
  constructor(private readonly offersService: OffersService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all offers',
    description: 'Retrieve all available offers with optional filtering by status, topic, and minimum rating'
  })
  @ApiResponse({ status: 200, type: OffersListResponseDto, description: 'List of offers with pagination' })
  async getOffers(@Query() query: OfferQueryDto): Promise<OffersListResponseDto> {
    return this.offersService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get specific offer by ID',
    description: 'Retrieve detailed information about a specific offer'
  })
  @ApiParam({ name: 'id', type: Number, description: 'Offer ID' })
  @ApiResponse({ status: 200, type: OfferResponseDto, description: 'Offer details' })
  @ApiResponse({ status: 404, description: 'Offer not found' })
  async getOffer(@Param('id', ParseIntPipe) id: number): Promise<OfferResponseDto> {
    return this.offersService.findOne(id);
  }

  @Post(':id/promote')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Promote an active offer',
    description: 'Register that an affiliate is promoting an offer. Only active offers can be promoted.'
  })
  @ApiParam({ name: 'id', type: Number, description: 'Offer ID' })
  @ApiResponse({ status: 200, type: PromotionResponseDto, description: 'Promotion registered successfully' })
  @ApiResponse({ status: 403, description: 'Offer is not active' })
  @ApiResponse({ status: 404, description: 'Offer not found' })
  async promoteOffer(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: PromoteOfferDto
  ): Promise<PromotionResponseDto> {
    // TODO: Get affiliateId from authenticated user
    // For now, using a placeholder - this will be replaced with actual auth
    const affiliateId = 1;
    return this.offersService.promoteOffer(id, affiliateId, dto);
  }

  @Post()
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create new offer (Admin only)',
    description: 'Create a new offer with commission model configuration. Requires admin role.'
  })
  @ApiResponse({ status: 201, type: OfferResponseDto, description: 'Offer created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid data or slug already exists' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  async createOffer(@Body() dto: CreateOfferDto): Promise<OfferResponseDto> {
    // TODO: Get userId from authenticated user
    // For now, using a placeholder - this will be replaced with actual auth
    const userId = 1;
    return this.offersService.create(dto, userId);
  }

  @Put(':id')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update offer (Admin only)',
    description: 'Update an existing offer. Requires admin role.'
  })
  @ApiParam({ name: 'id', type: Number, description: 'Offer ID' })
  @ApiResponse({ status: 200, type: OfferResponseDto, description: 'Offer updated successfully' })
  @ApiResponse({ status: 404, description: 'Offer not found' })
  @ApiResponse({ status: 400, description: 'Invalid data or slug already exists' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  async updateOffer(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateOfferDto
  ): Promise<OfferResponseDto> {
    // TODO: Get userId from authenticated user
    // For now, using a placeholder - this will be replaced with actual auth
    const userId = 1;
    return this.offersService.update(id, dto, userId);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Delete offer (Admin only)',
    description: 'Permanently delete an offer. Requires admin role.'
  })
  @ApiParam({ name: 'id', type: Number, description: 'Offer ID' })
  @ApiResponse({ status: 200, description: 'Offer deleted successfully' })
  @ApiResponse({ status: 404, description: 'Offer not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  async deleteOffer(@Param('id', ParseIntPipe) id: number): Promise<{ message: string }> {
    await this.offersService.delete(id);
    return { message: 'Offer deleted successfully' };
  }
}
