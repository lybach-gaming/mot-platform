import { Controller, Get, Post, Query, Body } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiBody,
  ApiTags,
} from '@nestjs/swagger';
import { SettingService } from './setting.service';

interface SettingsParams {
  type?: string;
}

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

  /**
   * Get settings based on type.
   * Supports both GET and POST methods.
   * @param type - Optional type of settings to retrieve.
   * @returns settings data.
   */
  @Get('get_settings')
  @ApiOperation({ summary: 'Get settings (GET)' })
  @ApiQuery({ name: 'type', required: false })
  async getSettingGet(@Query('type') type?: string) {
    return this.handleSettingRequest({ type: type });
  }

  @Post('get_settings')
  @ApiOperation({ summary: 'Get settings (POST)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        type: { type: 'string', required: false },
      },
    },
  })
  async getSettingPost(@Body() params: SettingsParams) {
    return this.handleSettingRequest(params);
  }

  private async handleSettingRequest(params: SettingsParams) {
    const publicSetting = await this.settingService.getSetting({
      type: params.type ? params.type : undefined,
    });

    return {
      error: false,
      data: publicSetting,
    };
  }
}
