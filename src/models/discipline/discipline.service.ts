import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateDisciplineDto } from './dto/create-discipline.dto';
import { UpdateDisciplineDto } from './dto/update-discipline.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Discipline } from './entities/discipline.entity';

@Injectable()
export class DisciplineService {
  constructor(
    @InjectRepository(Discipline)
    private readonly disciplineRepository: Repository<Discipline>,
  ) {}

  async create(createDisciplineDto: CreateDisciplineDto) {
    const existingDiscipline = await this.disciplineRepository.findOne({
      where: { code: createDisciplineDto.code },
    });

    if (existingDiscipline) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Já existe uma disciplina com o mesmo código.',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const discipline = this.disciplineRepository.create(createDisciplineDto);

    await this.disciplineRepository.save(discipline);

    return {
      statusCode: 200,
      message: 'Disciplina criada com sucesso',
    };
  }

  async findAll(query: {
    name?: string;
    code?: string;
    type?: string;
  }): Promise<Discipline[]> {
    const qb = this.disciplineRepository.createQueryBuilder('discipline');

    if (query.name) {
      qb.andWhere('unaccent(discipline.name) ILIKE :name', {
        name: `%${query.name}%`,
      });
    }

    if (query.code) {
      qb.andWhere('discipline.code ILIKE :code', { code: `${query.code}%` });
    }

    if (query.type) {
      qb.andWhere('discipline.type = :type', { type: query.type });
    }

    const disciplines = await qb.getMany();

    if (disciplines.length === 0) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Nenhuma disciplina encontrada com os filtros fornecidos.',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    return disciplines;
  }

  async findOne(id: number): Promise<Discipline> {
    const discipline = await this.disciplineRepository.findOne({
      where: { id },
    });
    if (!discipline) {
      throw new NotFoundException(`Disciplina com ID ${id} não encontrada`);
    }
    return discipline;
  }

  async update(id: number, updateDisciplineDto: UpdateDisciplineDto) {
    const discipline = await this.findOne(id);
    Object.assign(discipline, updateDisciplineDto);
    await this.disciplineRepository.save(discipline);
    return {
      statusCode: 200,
      message: 'Disciplina atualizada com sucesso',
    };
  }

  async remove(id: number) {
    const discipline = await this.findOne(id);
    await this.disciplineRepository.remove(discipline);
    return {
      statusCode: 200,
      message: 'Disciplina removida com sucesso',
    };
  }
}
