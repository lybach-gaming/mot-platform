import { CreateLanguageDto } from './create-language.dto';
import { PartialType } from '@nestjs/swagger';

// Just change the status of the language
export class EditLanguageDto extends PartialType(CreateLanguageDto) {}
