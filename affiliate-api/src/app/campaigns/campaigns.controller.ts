import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam
} from '@nestjs/swagger';
import { CampaignsService } from './services';
import {
  CreateCampaignDto,
  UpdateCampaignDto,
  PromoteCampaignDto,
  CampaignQueryDto,
  CampaignResponseDto,
  CampaignsListResponseDto,
  PromotionResponseDto
} from './dto';

@Controller('campaigns')
@ApiTags('Campaigns')
export class CampaignsController {
  constructor(private readonly campaignsService: CampaignsService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all campaigns',
    description: 'Retrieve all available campaigns with optional filtering by status, topic, and minimum rating'
  })
  @ApiResponse({ status: 200, type: CampaignsListResponseDto, description: 'List of campaigns with pagination' })
  async getCampaigns(@Query() query: CampaignQueryDto): Promise<CampaignsListResponseDto> {
    return this.campaignsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get specific campaign by ID',
    description: 'Retrieve detailed information about a specific campaign'
  })
  @ApiParam({ name: 'id', type: Number, description: 'Campaign ID' })
  @ApiResponse({ status: 200, type: CampaignResponseDto, description: 'Campaign details' })
  @ApiResponse({ status: 404, description: 'Campaign not found' })
  async getCampaign(@Param('id', ParseIntPipe) id: number): Promise<CampaignResponseDto> {
    return this.campaignsService.findOne(id);
  }

  @Post(':id/promote')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Promote an active campaign',
    description: 'Register that an affiliate is promoting a campaign. Only active campaigns can be promoted.'
  })
  @ApiParam({ name: 'id', type: Number, description: 'Campaign ID' })
  @ApiResponse({ status: 200, type: PromotionResponseDto, description: 'Promotion registered successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Authentication required' })
  @ApiResponse({ status: 403, description: 'Campaign is not active' })
  @ApiResponse({ status: 404, description: 'Campaign not found' })
  async promoteCampaign(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: PromoteCampaignDto,
    @Request() req: any
  ): Promise<PromotionResponseDto> {
    // Extract affiliateId from authenticated user
    // Assuming JWT strategy populates req.user with { id, affiliateId, ... }
    const affiliateId = req.user?.affiliateId || req.user?.id;
    return this.campaignsService.promoteCampaign(id, affiliateId, dto);
  }

  @Post()
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create new campaign (Admin only)',
    description: 'Create a new campaign with commission model configuration. Requires admin role.'
  })
  @ApiResponse({ status: 201, type: CampaignResponseDto, description: 'Campaign created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid data or slug already exists' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Authentication required' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  async createCampaign(
    @Body() dto: CreateCampaignDto,
    @Request() req: any
  ): Promise<CampaignResponseDto> {
    const userId = req.user.id;
    return this.campaignsService.create(dto, userId);
  }

  @Put(':id')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update campaign (Admin only)',
    description: 'Update an existing campaign. Requires admin role.'
  })
  @ApiParam({ name: 'id', type: Number, description: 'Campaign ID' })
  @ApiResponse({ status: 200, type: CampaignResponseDto, description: 'Campaign updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid data or slug already exists' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Authentication required' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  @ApiResponse({ status: 404, description: 'Campaign not found' })
  async updateCampaign(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCampaignDto,
    @Request() req: any
  ): Promise<CampaignResponseDto> {
    const userId = req.user.id;
    return this.campaignsService.update(id, dto, userId);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Delete campaign (Admin only)',
    description: 'Permanently delete a campaign. Requires admin role.'
  })
  @ApiParam({ name: 'id', type: Number, description: 'Campaign ID' })
  @ApiResponse({ status: 200, description: 'Campaign deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Authentication required' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  @ApiResponse({ status: 404, description: 'Campaign not found' })
  async deleteCampaign(@Param('id', ParseIntPipe) id: number): Promise<{ message: string }> {
    await this.campaignsService.delete(id);
    return { message: 'Campaign deleted successfully' };
  }
}
