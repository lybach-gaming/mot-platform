import { ApiProperty } from '@nestjs/swagger';

export class LanguageDetailDto {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  language!: string;

  @ApiProperty()
  code!: string;

  @ApiProperty()
  status!: number; // 0=disable, 1=enable - If you want to able to use this language, set it to 1

  @ApiProperty()
  type!: number; // 0=deactive, 1=active - If you want to see this language on the website, set it to 1
}
