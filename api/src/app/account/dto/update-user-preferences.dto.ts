import { IsOptional, IsString } from 'class-validator';

export class UpdateUserPreferencesDto {
  @IsOptional()
  @IsString()
  locale?: string;

  @IsOptional()
  @IsString()
  timezone?: string;
}

