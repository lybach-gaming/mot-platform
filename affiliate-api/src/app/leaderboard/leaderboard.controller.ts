import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery
} from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { LeaderboardService } from './leaderboard.service';
import {
  DashboardResponseDto,
  LeaderboardQueryDto,
  LeaderboardResponseDto
} from './dto';

@Controller('leaderboard')
@ApiBearerAuth()
@ApiTags('Leaderboard')
export class LeaderboardController {
  constructor(private readonly leaderboardService: LeaderboardService) {}

  /**
   * Get user's personal dashboard with rank, referrals, conversions, and earnings
   */
  @Get('dashboard')
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Get user dashboard',
    description: `
      Retrieves the authenticated user's affiliate dashboard including:
      - Current rank and percentile position
      - Total referrals with weekly change
      - Total conversions with conversion rate
      - Total earnings with monthly change

      All data is cached for 60 seconds for optimal performance.
    `
  })
  @ApiResponse({
    status: 200,
    description: 'Dashboard data retrieved successfully',
    type: DashboardResponseDto
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing authentication token'
  })
  @ApiResponse({
    status: 404,
    description: 'User not found'
  })
  async getDashboard(
    @CurrentUser() user: { id: number; projectId: number }
  ): Promise<DashboardResponseDto> {
    return this.leaderboardService.getUserDashboard(user.id, user.projectId);
  }

  /**
   * Get monthly leaderboard (top 100 affiliates by month performance)
   */
  @Get('monthly')
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Get monthly leaderboard',
    description: `
      Retrieves the monthly leaderboard showing top affiliates ranked by performance for a specific month.

      Features:
      - Returns up to 100 entries per page
      - Ranks affiliates by earnings, conversions, then referrals
      - Filters data by specified year and month (defaults to current month)
      - Includes pagination metadata
      - Cached for 60 seconds for optimal performance

      Ranking criteria (in order of priority):
      1. Total earnings (USD)
      2. Total conversions
      3. Total referrals
    `
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (1-based)',
    example: 1
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Entries per page (max 100)',
    example: 100
  })
  @ApiQuery({
    name: 'year',
    required: false,
    type: Number,
    description: 'Year for leaderboard (defaults to current year)',
    example: 2025
  })
  @ApiQuery({
    name: 'month',
    required: false,
    type: Number,
    description: 'Month for leaderboard (1-12, defaults to current month)',
    example: 11
  })
  @ApiResponse({
    status: 200,
    description: 'Monthly leaderboard retrieved successfully',
    type: LeaderboardResponseDto
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing authentication token'
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid query parameters'
  })
  async getMonthlyLeaderboard(
    @CurrentUser() user: { projectId: number },
    @Query() query: LeaderboardQueryDto
  ): Promise<LeaderboardResponseDto> {
    return this.leaderboardService.getMonthlyLeaderboard(user.projectId, query);
  }

  /**
   * Get all-time leaderboard (top 100 affiliates by lifetime performance)
   */
  @Get('all-time')
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Get all-time leaderboard',
    description: `
      Retrieves the all-time leaderboard showing top affiliates ranked by lifetime performance.

      Features:
      - Returns up to 100 entries per page
      - Ranks affiliates by total earnings, conversions, then referrals
      - Includes all-time statistics since account creation
      - Includes pagination metadata
      - Cached for 120 seconds for optimal performance

      Ranking criteria (in order of priority):
      1. Total lifetime earnings (USD)
      2. Total lifetime conversions
      3. Total lifetime referrals
    `
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (1-based)',
    example: 1
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Entries per page (max 100)',
    example: 100
  })
  @ApiResponse({
    status: 200,
    description: 'All-time leaderboard retrieved successfully',
    type: LeaderboardResponseDto
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing authentication token'
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid query parameters'
  })
  async getAllTimeLeaderboard(
    @CurrentUser() user: { projectId: number },
    @Query() query: LeaderboardQueryDto
  ): Promise<LeaderboardResponseDto> {
    return this.leaderboardService.getAllTimeLeaderboard(user.projectId, query);
  }
}
