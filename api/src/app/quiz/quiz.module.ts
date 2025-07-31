import { Module } from '@nestjs/common';
import { QuizService } from './quiz.service';
import { QuizController } from './quiz.controller';
import { FileUploadModule } from '../../core/file-upload/file-upload.module';

@Module({
  imports: [FileUploadModule], 
  controllers: [QuizController],
  providers: [QuizService],
  exports: [QuizService],
})
export class QuizModule {}
