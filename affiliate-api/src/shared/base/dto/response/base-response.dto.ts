import { ApiProperty } from '@nestjs/swagger';

export class BaseResponseDto {
  @ApiProperty({
    example: true,
    description: 'Indicates if the request was successful'
  })
  success: boolean;

  @ApiProperty({
    example: 'Operation completed successfully',
    description: 'Additional message about the operation result',
    required: false
  })
  message?: string;
}