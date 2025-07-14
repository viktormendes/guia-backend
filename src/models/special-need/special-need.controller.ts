import {
  Controller,
  Get,
  Query,
  UseGuards,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { SpecialNeedService } from './special-need.service';
import { SpecialNeedPaginationDto } from './dto/special-need-pagination.dto';
import { SpecialNeedListDto } from './dto/special-need-list.dto';
import { PaginatedResponseDto } from '../../models/helper/dto/pagination.dto';
import { RolesGuard } from '../../authentication/guards/roles/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';

@ApiTags('Necessidades Especiais')
@Controller('special-needs')
@UseGuards(RolesGuard)
export class SpecialNeedController {
  constructor(private readonly specialNeedService: SpecialNeedService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @Roles(Role.ADMIN, Role.EDITOR)
  @ApiOperation({
    summary: 'Listar necessidades especiais',
    description:
      'Retorna uma lista paginada de necessidades especiais com pesquisa, filtros e ordenação configurável',
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
    description: 'Termo de pesquisa para nome e descrição',
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    description:
      'Campo para ordenação (id, name, description, createdAt, updatedAt)',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    description: 'Ordem de classificação (ASC ou DESC)',
    enum: ['ASC', 'DESC'],
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de necessidades especiais retornada com sucesso',
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
  async getAllSpecialNeeds(
    @Query() paginationDto: SpecialNeedPaginationDto,
  ): Promise<PaginatedResponseDto<SpecialNeedListDto>> {
    return this.specialNeedService.getAllSpecialNeeds(paginationDto);
  }
}
