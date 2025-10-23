import { Module } from '@nestjs/common';
import { QuizService } from './quiz.service';
import { QuizController } from './quiz.controller';
import { FaqModule } from '../faq/faq.module';
import { WebSeoModule } from './../web-seo/web-seo.module';
import { HelpersModule } from '../helpers/helpers.module';

@Module({
  imports: [FaqModule, WebSeoModule, HelpersModule],
  controllers: [QuizController],
  providers: [QuizService],
  exports: [QuizService],
})
export class QuizModule {}
