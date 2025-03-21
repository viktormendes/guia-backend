import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Discipline } from 'src/models/discipline/entities/discipline.entity';
import { Prerequisite } from './entities/prerequisite.entity';
import { CreatePrerequisiteDto } from './dto/create-prerequisite.dto';

@Injectable()
export class PrerequisiteService {
  constructor(
    @InjectRepository(Prerequisite)
    private readonly prerequisiteRepository: Repository<Prerequisite>,
    @InjectRepository(Discipline)
    private readonly disciplineRepository: Repository<Discipline>,
  ) {}

  /**
   * Cria um pré-requisito associando uma disciplina a outra.
   */
  async create(
    createPrerequisiteDto: CreatePrerequisiteDto,
  ): Promise<Prerequisite> {
    const { disciplineId, prerequisiteId } = createPrerequisiteDto;

    const discipline = await this.disciplineRepository.findOne({
      where: { id: disciplineId },
    });

    if (!discipline) {
      throw new NotFoundException('Disciplina não encontrada.');
    }

    const prerequisite = await this.disciplineRepository.findOne({
      where: { id: prerequisiteId },
    });

    if (!prerequisite) {
      throw new NotFoundException('Pré-requisito não encontrado.');
    }

    const prerequisiteEntity = this.prerequisiteRepository.create({
      discipline,
      prerequisite,
    });

    return this.prerequisiteRepository.save(prerequisiteEntity);
  }

  async findAll(): Promise<any[]> {
    const prerequisites = await this.prerequisiteRepository.find({
      relations: ['discipline', 'prerequisite'],
    });

    return prerequisites.map((prerequisite) => ({
      id: prerequisite.id,
      disciplineId: prerequisite.discipline.id,
      prerequisiteId: prerequisite.prerequisite.id,
    }));
  }

  /**
   * Busca os pré-requisitos de uma disciplina específica.
   */
  async findByDiscipline(disciplineId: number): Promise<any[]> {
    const prerequisites = await this.prerequisiteRepository.find({
      where: { discipline: { id: disciplineId } },
      relations: ['prerequisite'],
    });

    return prerequisites.map((prerequisite) => ({
      id: prerequisite.prerequisite.id,
      name: prerequisite.prerequisite.name,
      semester: prerequisite.prerequisite.semester,
      workload: prerequisite.prerequisite.workload,
      type: prerequisite.prerequisite.type,
      code: prerequisite.prerequisite.code,
    }));
  }

  /**
   * Remove um pré-requisito pelo ID.
   */
  async remove(id: number): Promise<void> {
    const result = await this.prerequisiteRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Pré-requisito não encontrado.');
    }
  }
}
