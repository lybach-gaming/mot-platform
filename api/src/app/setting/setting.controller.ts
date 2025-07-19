import { Controller, Get, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SettingService } from './setting.service';

@Controller('v2')
@ApiTags('Settings')
@ApiBearerAuth()
export class SettingController {
  constructor(private readonly settingService: SettingService) {}

  @Get('get_web_settings')
  @ApiOperation({ summary: 'Get web settings (GET)' })
  async getWebSettingGet() {
    return this.handleWebSettingRequest();
  }

  @Post('get_web_settings')
  @ApiOperation({ summary: 'Get web settings (POST)' })
  async getWebSettingPost() {
    return this.handleWebSettingRequest();
  }

  private async handleWebSettingRequest() {
    const publicWebSetting = await this.settingService.getPublicWebSetting();

    return {
      error: false,
      data: publicWebSetting,
    };
  }
}
