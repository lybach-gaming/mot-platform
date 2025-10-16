import { ApiProperty } from "@nestjs/swagger";

export class PaginationMetadataDto {
    @ApiProperty()
    currentPage: number;
  
    @ApiProperty()
    limit: number;
  
    @ApiProperty()
    totalPages: number;
  
    @ApiProperty()
    total: number;

    @ApiProperty()
    hasNextPage: boolean;
    
    @ApiProperty()
    hasPrevPage: boolean;

    @ApiProperty()
    nextPage: number;

    @ApiProperty()
    prevPage: number;
}