import {
  Controller,
  Get,
  Query,
  UseGuards,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { SpecialNeedSubcategoryService } from './special-need-subcategory.service';
import { SpecialNeedSubcategoryPaginationDto } from './dto/special-need-subcategory-pagination.dto';
import { SpecialNeedSubcategoryListDto } from './dto/special-need-subcategory-list.dto';
import { PaginatedResponseDto } from '../../models/helper/dto/pagination.dto';
import { RolesGuard } from '../../authentication/guards/roles/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';

@ApiTags('Subcategorias de Necessidades Especiais')
@Controller('special-need-subcategories')
@UseGuards(RolesGuard)
export class SpecialNeedSubcategoryController {
  constructor(
    private readonly subcategoryService: SpecialNeedSubcategoryService,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @Roles(Role.ADMIN, Role.EDITOR)
  @ApiOperation({
    summary: 'Listar subcategorias de necessidades especiais',
    description:
      'Retorna uma lista paginada de subcategorias com pesquisa, filtros e ordenação configurável',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Número da página (padrão: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Itens por página (padrão: 10)',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description:
      'Termo de pesquisa para nome, descrição e nome da necessidade especial',
  })
  @ApiQuery({
    name: 'specialNeedId',
    required: false,
    description: 'Filtrar por ID da necessidade especial',
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    description:
      'Campo para ordenação (id, name, description, createdAt, updatedAt, specialNeedName)',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    description: 'Ordem de classificação (ASC ou DESC)',
    enum: ['ASC', 'DESC'],
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de subcategorias retornada com sucesso',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number' },
              name: { type: 'string' },
              description: { type: 'string' },
              specialNeedId: { type: 'number' },
              specialNeedName: { type: 'string' },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
            },
          },
        },
        pagination: {
          type: 'object',
          properties: {
            page: { type: 'number' },
            limit: { type: 'number' },
            total: { type: 'number' },
            totalPages: { type: 'number' },
            hasNext: { type: 'boolean' },
            hasPrev: { type: 'boolean' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Usuário não autenticado',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Usuário sem permissão',
  })
  async getAllSubcategories(
    @Query() paginationDto: SpecialNeedSubcategoryPaginationDto,
  ): Promise<PaginatedResponseDto<SpecialNeedSubcategoryListDto>> {
    return this.subcategoryService.getAllSubcategories(paginationDto);
  }
}
