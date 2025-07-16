import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { SettingService } from './setting.service';

@Controller('/v2')
@ApiBearerAuth()
export class SettingController {
  constructor(private readonly settingService: SettingService) {}

  @Get('/get_web_settings')
  async getWebSetting() {
    const publicWebSetting = await this.settingService.getPublicWebSetting();

    return {
      error: false,
      data: publicWebSetting,
    };
  }
}
