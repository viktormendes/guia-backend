import { Module } from '@nestjs/common';
import { PaginationService } from './services/pagination.service';
import { QueryBuilderService } from './services/query-builder.service';

@Module({
  providers: [PaginationService, QueryBuilderService],
  exports: [PaginationService, QueryBuilderService],
})
export class CommonModule {}
