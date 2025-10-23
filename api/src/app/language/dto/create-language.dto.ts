import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateLanguageDto {
  @ApiProperty({
    description: 'The name of the language',
    example: 'English',
    type: String,
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  language!: string;

  @ApiProperty({
    description: 'The code of the language',
    example: 'en',
    type: String,
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  code!: string;

  @ApiProperty({
    description: 'The status of the language',
    example: 1,
    enum: [0, 1],
    type: Number,
    required: false,
    default: 0,
  })
  @IsNumber()
  @IsIn([0, 1])
  @Type(() => Number)
  status!: number;

  @ApiProperty({
    description: 'The type of the language',
    example: 1,
    enum: [0, 1],
    type: Number,
    required: false,
    default: 0,
  })
  @IsNumber()
  @IsIn([0, 1])
  @Type(() => Number)
  type!: number;
}
