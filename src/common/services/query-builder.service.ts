import { Injectable } from '@nestjs/common';
import { SelectQueryBuilder, ObjectLiteral } from 'typeorm';
import { SortOrder } from '../../models/helper/dto/pagination.dto';

export interface SearchFilterOptions {
  searchFields?: string[];
  filterFields?: Record<string, string>;
  sortableFields?: string[];
  defaultSort?: { field: string; order: SortOrder };
}

@Injectable()
export class QueryBuilderService {
  applySearchAndFilters<T extends ObjectLiteral>(
    queryBuilder: SelectQueryBuilder<T>,
    search?: string,
    filters?: Record<string, unknown>,
    options: SearchFilterOptions = {},
  ): SelectQueryBuilder<T> {
    const { searchFields = [], filterFields = {} } = options;

    // Apply search
    if (search && searchFields.length > 0) {
      const searchConditions = searchFields.map((field) => {
        return `${queryBuilder.alias}.${field} ILIKE :search`;
      });

      queryBuilder.andWhere(`(${searchConditions.join(' OR ')})`, {
        search: `%${search}%`,
      });
    }

    // Apply filters
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          const fieldName = filterFields[key] || key;
          queryBuilder.andWhere(
            `${queryBuilder.alias}.${fieldName} = :${key}`,
            {
              [key]: value,
            },
          );
        }
      });
    }

    return queryBuilder;
  }

  applySorting<T extends ObjectLiteral>(
    queryBuilder: SelectQueryBuilder<T>,
    sortBy?: string,
    sortOrder?: SortOrder,
    options: SearchFilterOptions = {},
  ): SelectQueryBuilder<T> {
    const { sortableFields = [], defaultSort } = options;

    // Se não há campos ordenáveis definidos, permitir ordenação por qualquer campo
    const allowedFields = sortableFields.length > 0 ? sortableFields : null;

    // Validar se o campo de ordenação é permitido
    if (sortBy && allowedFields && !allowedFields.includes(sortBy)) {
      console.warn(
        `Campo de ordenação '${sortBy}' não é permitido. Campos permitidos: ${allowedFields.join(', ')}`,
      );
      sortBy = undefined;
    }

    // Se não há campo de ordenação especificado, usar o padrão
    if (!sortBy && defaultSort) {
      sortBy = defaultSort.field;
      sortOrder = defaultSort.order;
    }

    // Aplicar ordenação
    if (sortBy) {
      queryBuilder.orderBy(
        `${queryBuilder.alias}.${sortBy}`,
        sortOrder || SortOrder.DESC,
      );
    }

    return queryBuilder;
  }

  applySearchFiltersAndSorting<T extends ObjectLiteral>(
    queryBuilder: SelectQueryBuilder<T>,
    search?: string,
    filters?: Record<string, unknown>,
    sortBy?: string,
    sortOrder?: SortOrder,
    options: SearchFilterOptions = {},
  ): SelectQueryBuilder<T> {
    // 1. Aplicar pesquisa e filtros primeiro
    this.applySearchAndFilters(queryBuilder, search, filters, options);

    // 2. Aplicar ordenação depois (ANTES da paginação)
    this.applySorting(queryBuilder, sortBy, sortOrder, options);

    return queryBuilder;
  }

  applySearch<T extends ObjectLiteral>(
    queryBuilder: SelectQueryBuilder<T>,
    search?: string,
    searchFields: string[] = [],
  ): SelectQueryBuilder<T> {
    if (search && searchFields.length > 0) {
      const searchConditions = searchFields.map((field) => {
        return `${queryBuilder.alias}.${field} ILIKE :search`;
      });

      queryBuilder.andWhere(`(${searchConditions.join(' OR ')})`, {
        search: `%${search}%`,
      });
    }

    return queryBuilder;
  }

  applyFilters<T extends ObjectLiteral>(
    queryBuilder: SelectQueryBuilder<T>,
    filters?: Record<string, unknown>,
    filterFields: Record<string, string> = {},
  ): SelectQueryBuilder<T> {
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          const fieldName = filterFields[key] || key;
          queryBuilder.andWhere(
            `${queryBuilder.alias}.${fieldName} = :${key}`,
            {
              [key]: value,
            },
          );
        }
      });
    }

    return queryBuilder;
  }
}
