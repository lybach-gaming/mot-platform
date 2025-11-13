
import { ApiProperty } from '@nestjs/swagger';
import { GetUserByIdDto } from './get-user-by-id.dto';

export class GetUserByIdResponseDto {
  @ApiProperty()
  error: boolean;

  @ApiProperty({ type: GetUserByIdDto })
  data: GetUserByIdDto;
}

export class UpdateUserPreferencesResponseDto {
  @ApiProperty()
  error: boolean;

  @ApiProperty()
  message: string;
}
