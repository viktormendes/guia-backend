import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SpecialNeedSubcategory } from './entities/special-need-subcategory.entity';
import { SpecialNeedSubcategoryListDto } from './dto/special-need-subcategory-list.dto';
import { SpecialNeedSubcategoryPaginationDto } from './dto/special-need-subcategory-pagination.dto';
import { PaginationService } from '../../common/services/pagination.service';
import { QueryBuilderService } from '../../common/services/query-builder.service';
import {
  PaginatedResponseDto,
  SortOrder,
} from '../../models/helper/dto/pagination.dto';

@Injectable()
export class SpecialNeedSubcategoryService {
  constructor(
    @InjectRepository(SpecialNeedSubcategory)
    private readonly subcategoryRepository: Repository<SpecialNeedSubcategory>,
    private readonly paginationService: PaginationService,
    private readonly queryBuilderService: QueryBuilderService,
  ) {}

  async getAllSubcategories(
    paginationDto: SpecialNeedSubcategoryPaginationDto,
  ): Promise<PaginatedResponseDto<SpecialNeedSubcategoryListDto>> {
    // Preparar filtros
    const where: Record<string, any> = {};
    if (paginationDto.specialNeedId) {
      where.specialNeed = { id: paginationDto.specialNeedId };
    }

    // Usar find com relations em vez de query builder
    const [data, total] = await this.subcategoryRepository.findAndCount({
      where,
      relations: ['specialNeed'],
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
            item.description.toLowerCase().includes(searchTerm)) ||
          (item.specialNeed &&
            item.specialNeed.name.toLowerCase().includes(searchTerm)),
      );
    }

    // Transformar os dados para o formato esperado
    const transformedData: SpecialNeedSubcategoryListDto[] = filteredData.map(
      (item) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        specialNeedId: item.specialNeed?.id,
        specialNeedName: item.specialNeed?.name,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      }),
    );

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
        specialNeedName: 'specialNeed.name',
      };

      const field = fieldMapping[sortBy] || 'name';
      order[field] = sortOrder || SortOrder.ASC;
    } else {
      // Ordenação padrão
      order.name = SortOrder.ASC;
    }

    return order;
  }

  async getSubcategoryById(id: number): Promise<SpecialNeedSubcategory> {
    const subcategory = await this.subcategoryRepository.findOne({
      where: { id },
      relations: ['specialNeed'],
    });

    if (!subcategory) {
      throw new Error('Subcategoria não encontrada');
    }

    return subcategory;
  }
}
