import { CreateSubcategoryDto } from './create-subcategory.dto';
import { PartialType, ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsArray, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class EditSubcategoryDto extends PartialType(CreateSubcategoryDto) {
  @ApiProperty({
    description: 'Array of FAQ IDs to edit',
    type: [Number],
    required: false,
  })
  @IsOptional()
  @IsArray()
  edit_faq_ids?: number[];

  @ApiProperty({
    description: '0=keep image, 1=remove image',
    enum: [0, 1],
    default: 0,
  })
  @IsOptional()
  @Type(() => Number) // form-data string -> number
  @IsIn([0, 1])
  remove_image?: number; // 1 = remove image, 0 = keep image
}
