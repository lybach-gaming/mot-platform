import { CreateLanguageDto } from './create-language.dto';
import { PartialType } from '@nestjs/swagger';

// All fields from CreateLanguageDto are optional for editing
export class EditLanguageDto extends PartialType(CreateLanguageDto) {}
