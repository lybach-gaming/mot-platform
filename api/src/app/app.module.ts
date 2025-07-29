import { MiddlewareConsumer, Module } from '@nestjs/common';
import { AttachUserMiddleware } from '../common/middlewares/attach-user.middleware';
import { DatabaseModule } from '../core/database/database.module';
import { RedisModule } from '../core/redis/redis.module';
import { AccountModule } from './account/account.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CategoryModule } from './category/category.module';
import { QuestionModule } from './question/question.module';
import { QuizModule } from './quiz/quiz.module';
import { SettingModule } from './setting/setting.module';
import { SubcategoryLevelModule } from './subcategory-level/subcategory-level.module';
import { SubcategoryModule } from './subcategory/subcategory.module';
import { WebSeoModule } from './web-seo/web-seo.module';
import { AdminGuardMiddleware } from '../common/middlewares/admin-guard.middleware';

@Module({
  imports: [
    DatabaseModule,
    RedisModule,
    SettingModule,
    AccountModule,
    CategoryModule,
    SubcategoryModule,
    SubcategoryLevelModule,
    QuizModule,
    WebSeoModule,
    QuestionModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AttachUserMiddleware).forRoutes('*');
    consumer.apply(AdminGuardMiddleware).forRoutes('*');
  }
}
