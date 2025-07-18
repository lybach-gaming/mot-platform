import { SubcategoryLevelModule } from './subcategory-level/subcategory-level.module';
import { MiddlewareConsumer, Module } from '@nestjs/common';
import { AttachUserMiddleware } from '../common/middlewares/attach-user.middleware';
import { DatabaseModule } from '../core/database/database.module';
import { RedisModule } from '../core/redis/redis.module';
import { AccountModule } from './account/account.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SettingModule } from './setting/setting.module';

@Module({
  imports: [DatabaseModule, RedisModule, SettingModule, AccountModule, SubcategoryLevelModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AttachUserMiddleware).forRoutes('*');
  }
}
