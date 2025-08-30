import { ApiProperty } from '@nestjs/swagger';

export class SettingsDto {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  type!: string;

  @ApiProperty()
  message!: string;
}
