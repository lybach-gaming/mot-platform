import { Module } from '@nestjs/common';
import { SettingService } from './setting.service';
import { SettingController } from './setitng.controller';

@Module({
  controllers: [SettingController],
  providers: [SettingService],
  exports: [SettingService],
})
export class SettingModule {}
