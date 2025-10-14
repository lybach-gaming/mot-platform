import { Controller, Post, Body } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiBody, ApiTags } from '@nestjs/swagger';
import { HelpersService } from './helpers.service';
import { CheckSlugDto } from './dto/check-slug.dto';

@Controller('v2')
@ApiTags('Helper')
@ApiBearerAuth()
export class HelpersController {
  constructor(private readonly helpersService: HelpersService) {}

  // [Admin] Endpoint to check unique slug
  @ApiOperation({ summary: '[Admin] Check unique slug' })
  @ApiBody({
    type: CheckSlugDto,
    description:
      'Check if the provided slug is unique globally, excluding an optional ID (Web SEO ID, Blog ID, Blog Category ID).',
  })
  @Post('/admin/check-slug')
  async checkUniqueSlug(@Body() body: { slug: string; excludeId?: number }) {
    try {
      // Validate format
      this.helpersService.assertValid(body.slug);

      // Check uniqueness
      const isUnique = await this.helpersService.isUniqueGlobal(
        body.slug,
        body.excludeId
      );

      return {
        error: false,
        unique: isUnique,
        message: isUnique ? 'Slug is available' : 'Slug already exists',
      };
    } catch (error) {
      return {
        error: true,
        unique: false,
        message: error instanceof Error ? error.message : 'Error checking slug',
      };
    }
  }
}
