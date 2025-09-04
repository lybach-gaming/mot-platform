import { Module } from '@nestjs/common';
import { SubcategoryController } from './subcategory.controller';
import { SubcategoryService } from './subcategory.service';
// import FAQ and  WebSEO module
import { FaqModule } from '../faq/faq.module';
import { WebSeoModule } from '../web-seo/web-seo.module';

@Module({
  imports: [WebSeoModule, FaqModule],
  controllers: [SubcategoryController],
  providers: [SubcategoryService],
  exports: [SubcategoryService],
})
export class SubcategoryModule {}
