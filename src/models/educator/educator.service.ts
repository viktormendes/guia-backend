import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateEducatorDto } from './dto/create-educator.dto';
import { UpdateEducatorDto } from './dto/update-educator.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Educator } from './entities/educator.entity';
import { Repository } from 'typeorm';

@Injectable()
export class EducatorService {
  constructor(
    @InjectRepository(Educator)
    private readonly educatorRepository: Repository<Educator>,
  ) {}

  async create(createEducatorDto: CreateEducatorDto) {
    await this.educatorRepository.save(createEducatorDto);
    return {
      statusCode: 200,
      message: 'Educador criada com sucesso',
    };
  }

  async findAll(query: { name?: string }): Promise<Educator[]> {
    const qb = this.educatorRepository.createQueryBuilder('educator');

    if (query.name) {
      qb.andWhere('unaccent(educator.name) ILIKE :name', {
        name: `%${query.name}%`,
      });
    }

    const educators = await qb.getMany();

    if (educators.length === 0) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Nenhum educador encontrada com os filtros fornecidos.',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    return educators;
  }

  async findOne(id: number): Promise<Educator> {
    const educator = await this.educatorRepository.findOne({
      where: { id },
    });
    if (!educator) {
      throw new NotFoundException(`Educador com ID ${id} não encontrada`);
    }
    return educator;
  }

  async update(id: number, updateEducatorDto: UpdateEducatorDto) {
    const educator = await this.findOne(id);
    Object.assign(educator, updateEducatorDto);
    await this.educatorRepository.save(educator);
    return {
      statusCode: 200,
      message: 'Educador atualizada com sucesso',
    };
  }

  async remove(id: number) {
    const timetable = await this.findOne(id);
    await this.educatorRepository.remove(timetable);
  }
}
