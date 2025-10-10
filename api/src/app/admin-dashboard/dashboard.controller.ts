import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';

@Controller('v2')
@ApiTags('Admin Dashboard')
@ApiBearerAuth()
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  // [Admin] Endpoint to get dashboard entity counts
  @Get('/admin/dashboard/counts')
  @ApiOperation({ summary: 'Get dashboard entity counts' })
  @ApiQuery({
    name: 'syncNow',
    type: Boolean,
    required: false,
    description: 'Force sync data',
  })
  async getDashboardCounts(@Query('syncNow') syncNow?: boolean) {
    return await this.dashboardService.getDashboardCounts(syncNow);
  }

  // [Admin] Endpoint to get user registration statistics
  @Get('/admin/dashboard/user-statistics')
  @ApiOperation({ summary: 'Get user registration statistics' })
  @ApiQuery({
    name: 'filterType',
    enum: ['day', 'week', 'month'],
    required: true,
    description: 'Filter type for data aggregation',
  })
  @ApiQuery({
    name: 'syncNow',
    type: Boolean,
    required: false,
    description: 'Force sync data',
  })
  async getUserStatistics(
    @Query('filterType') filterType: 'day' | 'week' | 'month',
    @Query('syncNow') syncNow?: boolean
  ) {
    return await this.dashboardService.getUserStatistics(filterType, syncNow);
  }
}
