import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateLanguageDto {
  @ApiProperty({ description: 'The name of the language' })
  @IsString()
  @IsNotEmpty()
  language!: string;

  @ApiProperty({ description: 'The code of the language, e.g., en, fr' })
  @IsString()
  @IsNotEmpty()
  code!: string;

  @ApiProperty({
    description: 'The status of the language (0=disable, 1=enable)',
    example: 'If you want to able to use this language, set it to 1',
    default: 0,
  })
  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  status!: number;

  @ApiProperty({
    description: 'The type of the language (0=deactive, 1=active)',
    example: 'If you want to see this language on the website, set it to 1',
    default: 0,
  })
  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  type!: number;
}
