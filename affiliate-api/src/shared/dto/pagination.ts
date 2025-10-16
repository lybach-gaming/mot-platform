import { ApiProperty } from '@nestjs/swagger';
import { PaginationMetadataDto } from './pagination-metadata';

export class PaginationDto<T> {
  @ApiProperty({ isArray: true, type: () => Object }) 
  data: T[];  

  @ApiProperty({ type: PaginationMetadataDto })
  meta: PaginationMetadataDto;

  constructor(data: T[], total: number, currentPage: number, limit: number) {
    const totalPages = Math.ceil(total / limit);
    
    // Determine if next/previous pages exist
    const hasNextPage = currentPage < totalPages;
    const hasPrevPage = currentPage > 1;
    
    this.data = data;
    
    // Meta information
    this.meta = {
      currentPage,
      limit,
      totalPages,
      total,
      hasNextPage,
      hasPrevPage,
      nextPage: hasNextPage ? currentPage + 1 : null,
      prevPage: hasPrevPage ? currentPage - 1 : null,
    };
  }
}
