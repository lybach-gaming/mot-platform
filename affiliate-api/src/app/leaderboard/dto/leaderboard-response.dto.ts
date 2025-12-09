import { ApiProperty } from '@nestjs/swagger';
import { LeaderboardEntryDto } from './leaderboard-entry.dto';

export class LeaderboardMetaDto {
  @ApiProperty({
    description: 'Current page number',
    example: 1,
    type: Number
  })
  currentPage: number;

  @ApiProperty({
    description: 'Entries per page',
    example: 100,
    type: Number
  })
  limit: number;

  @ApiProperty({
    description: 'Total number of pages',
    example: 5,
    type: Number
  })
  totalPages: number;

  @ApiProperty({
    description: 'Total number of entries',
    example: 456,
    type: Number
  })
  total: number;

  @ApiProperty({
    description: 'Whether there is a next page',
    example: true,
    type: Boolean
  })
  hasNextPage: boolean;

  @ApiProperty({
    description: 'Whether there is a previous page',
    example: false,
    type: Boolean
  })
  hasPrevPage: boolean;

  @ApiProperty({
    description: 'Next page number',
    example: 2,
    type: Number,
    nullable: true
  })
  nextPage: number | null;

  @ApiProperty({
    description: 'Previous page number',
    example: null,
    type: Number,
    nullable: true
  })
  prevPage: number | null;

  @ApiProperty({
    description: 'Period type (monthly or all-time)',
    example: 'monthly',
    enum: ['monthly', 'all-time'],
    type: String
  })
  period: 'monthly' | 'all-time';

  @ApiProperty({
    description: 'Year for monthly leaderboard',
    example: 2025,
    type: Number,
    nullable: true
  })
  year?: number | null;

  @ApiProperty({
    description: 'Month for monthly leaderboard (1-12)',
    example: 11,
    type: Number,
    nullable: true
  })
  month?: number | null;
}

export class LeaderboardResponseDto {
  @ApiProperty({
    description: 'Array of leaderboard entries',
    type: [LeaderboardEntryDto]
  })
  data: LeaderboardEntryDto[];

  @ApiProperty({
    description: 'Pagination and period metadata',
    type: LeaderboardMetaDto
  })
  meta: LeaderboardMetaDto;
}
