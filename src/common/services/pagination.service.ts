import { Injectable } from '@nestjs/common';
import {
  Repository,
  SelectQueryBuilder,
  ObjectLiteral,
  FindOptionsWhere,
  FindOptionsOrder,
} from 'typeorm';
import {
  PaginationDto,
  PaginatedResponseDto,
} from '../../models/helper/dto/pagination.dto';

@Injectable()
export class PaginationService {
  async paginate<T extends ObjectLiteral>(
    queryBuilder: SelectQueryBuilder<T>,
    paginationDto: PaginationDto,
  ): Promise<PaginatedResponseDto<T>> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    // Clone the query builder to avoid modifying the original
    const countQueryBuilder = queryBuilder.clone();
    const dataQueryBuilder = queryBuilder.clone();

    // Get total count
    const total = await countQueryBuilder.getCount();

    // Get paginated data
    const data = await dataQueryBuilder.skip(skip).take(limit).getMany();

    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext,
        hasPrev,
      },
    };
  }

  async paginateRepository<T extends ObjectLiteral>(
    repository: Repository<T>,
    paginationDto: PaginationDto,
    where?: FindOptionsWhere<T>,
    relations?: string[],
    order?: FindOptionsOrder<T>,
  ): Promise<PaginatedResponseDto<T>> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    // Get total count
    const total = await repository.count({ where });

    // Get paginated data
    const data = await repository.find({
      where,
      relations,
      order,
      skip,
      take: limit,
    });

    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext,
        hasPrev,
      },
    };
  }
}
