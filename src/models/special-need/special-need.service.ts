import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SpecialNeed } from './entities/special-need.entity';
import { SpecialNeedListDto } from './dto/special-need-list.dto';
import { SpecialNeedPaginationDto } from './dto/special-need-pagination.dto';
import { PaginationService } from '../../common/services/pagination.service';
import { QueryBuilderService } from '../../common/services/query-builder.service';
import {
  PaginatedResponseDto,
  SortOrder,
} from '../../models/helper/dto/pagination.dto';

@Injectable()
export class SpecialNeedService {
  constructor(
    @InjectRepository(SpecialNeed)
    private readonly specialNeedRepository: Repository<SpecialNeed>,
    private readonly paginationService: PaginationService,
    private readonly queryBuilderService: QueryBuilderService,
  ) {}

  async getAllSpecialNeeds(
    paginationDto: SpecialNeedPaginationDto,
  ): Promise<PaginatedResponseDto<SpecialNeedListDto>> {
    // Usar find com relations em vez de query builder
    const [data, total] = await this.specialNeedRepository.findAndCount({
      skip: ((paginationDto.page || 1) - 1) * (paginationDto.limit || 10),
      take: paginationDto.limit || 10,
      order: this.buildOrderBy(paginationDto.sortBy, paginationDto.sortOrder),
    });

    // Filtrar por pesquisa se necessário
    let filteredData = data;
    if (paginationDto.search) {
      const searchTerm = paginationDto.search.toLowerCase();
      filteredData = data.filter(
        (item) =>
          item.name.toLowerCase().includes(searchTerm) ||
          (item.description &&
            item.description.toLowerCase().includes(searchTerm)),
      );
    }

    // Transformar os dados para o formato esperado
    const transformedData: SpecialNeedListDto[] = filteredData.map((item) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }));

    const page = paginationDto.page || 1;
    const limit = paginationDto.limit || 10;
    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return {
      data: transformedData,
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

  private buildOrderBy(
    sortBy?: string,
    sortOrder?: SortOrder,
  ): Record<string, SortOrder> {
    const order: Record<string, SortOrder> = {};

    if (sortBy) {
      // Mapear campos de ordenação
      const fieldMapping: Record<string, string> = {
        id: 'id',
        name: 'name',
        description: 'description',
        createdAt: 'createdAt',
        updatedAt: 'updatedAt',
      };

      const field = fieldMapping[sortBy] || 'name';
      order[field] = sortOrder || SortOrder.ASC;
    } else {
      // Ordenação padrão
      order.name = SortOrder.ASC;
    }

    return order;
  }

  async getSpecialNeedById(id: number): Promise<SpecialNeed> {
    const specialNeed = await this.specialNeedRepository.findOne({
      where: { id },
    });

    if (!specialNeed) {
      throw new Error('Necessidade especial não encontrada');
    }

    return specialNeed;
  }
}
