import { Module } from '@nestjs/common';
import { QuizService } from './quiz.service';
import { QuizController } from './quiz.controller';
import { FaqModule } from '../faq/faq.module';
import { WebSeoModule } from './../web-seo/web-seo.module';

@Module({
  imports: [FaqModule, WebSeoModule],
  controllers: [QuizController],
  providers: [QuizService],
  exports: [QuizService],
})
export class QuizModule {}
