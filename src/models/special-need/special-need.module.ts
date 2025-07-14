import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SpecialNeed } from './entities/special-need.entity';
import { SpecialNeedSubcategory } from './entities/special-need-subcategory.entity';
import { SpecialNeedService } from './special-need.service';
import { SpecialNeedSubcategoryService } from './special-need-subcategory.service';
import { SpecialNeedController } from './special-need.controller';
import { SpecialNeedSubcategoryController } from './special-need-subcategory.controller';
import { PaginationService } from '../../common/services/pagination.service';
import { QueryBuilderService } from '../../common/services/query-builder.service';

@Module({
  imports: [TypeOrmModule.forFeature([SpecialNeed, SpecialNeedSubcategory])],
  controllers: [SpecialNeedController, SpecialNeedSubcategoryController],
  providers: [
    SpecialNeedService,
    SpecialNeedSubcategoryService,
    PaginationService,
    QueryBuilderService,
  ],
  exports: [SpecialNeedService, SpecialNeedSubcategoryService],
})
export class SpecialNeedModule {}
