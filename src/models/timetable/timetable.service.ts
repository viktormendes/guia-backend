import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateTimetableDto } from './dto/create-timetable.dto';
import { UpdateTimetableDto } from './dto/update-timetable.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Educator } from '../educator/entities/educator.entity';
import { Repository } from 'typeorm';
import { Discipline } from '../discipline/entities/discipline.entity';
import { Timetable } from './entities/timetable.entity';

@Injectable()
export class TimetableService {
  constructor(
    @InjectRepository(Discipline)
    private readonly disciplineRepository: Repository<Discipline>,
    @InjectRepository(Educator)
    private readonly educatorRepository: Repository<Educator>,
    @InjectRepository(Timetable)
    private readonly timetableRepository: Repository<Timetable>,
  ) {}
  async create(createTimetableDto: CreateTimetableDto) {
    const { disciplineId, educatorId, days, hours } = createTimetableDto;

    const discipline = await this.disciplineRepository.findOne({
      where: { id: disciplineId },
    });

    if (!discipline) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Timetable não encontrada.',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    let educator: Educator | null = null;
    if (educatorId) {
      educator = await this.educatorRepository.findOne({
        where: { id: educatorId },
      });

      if (!educator) {
        throw new HttpException(
          {
            statusCode: HttpStatus.NOT_FOUND,
            message: 'Educador não encontrado.',
          },
          HttpStatus.NOT_FOUND,
        );
      }
    }

    const timetable = this.timetableRepository.create({
      discipline,
      educator: educator ?? undefined,
      days,
      hours,
    });

    return this.timetableRepository.save(timetable);
  }

  async findAll(): Promise<Timetable[]> {
    return this.timetableRepository.find({
      relations: ['discipline', 'educator'],
    });
  }

  async findAllByDisciplineId(
    disciplineId: number,
  ): Promise<{ days: string; hours: string }[]> {
    const timetables = await this.timetableRepository.find({
      where: { discipline: { id: disciplineId } },
      relations: ['discipline', 'educator'],
    });

    if (!timetables || timetables.length === 0) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Nenhum horário encontrado para esta disciplina.',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    return timetables.map((timetable) => ({
      days: timetable.days,
      hours: timetable.hours,
    }));
  }

  async findOne(id: number): Promise<Timetable> {
    const timetable = await this.timetableRepository.findOne({
      where: { id },
      relations: ['discipline', 'educator'],
    });

    if (!timetable) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Horário não encontrado.',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    return timetable;
  }

  async update(
    id: number,
    updateTimetableDto: UpdateTimetableDto,
  ): Promise<Timetable> {
    const timetable = await this.findOne(id);

    if (updateTimetableDto.disciplineId) {
      const discipline = await this.disciplineRepository.findOne({
        where: { id: updateTimetableDto.disciplineId },
      });

      if (!discipline) {
        throw new HttpException(
          {
            statusCode: HttpStatus.NOT_FOUND,
            message: 'Timetable não encontrada.',
          },
          HttpStatus.NOT_FOUND,
        );
      }

      timetable.discipline = discipline;
    }

    if (updateTimetableDto.educatorId !== undefined) {
      if (updateTimetableDto.educatorId === null) {
        timetable.educator = null;
      } else {
        const educator = await this.educatorRepository.findOne({
          where: { id: updateTimetableDto.educatorId },
        });

        if (!educator) {
          throw new HttpException(
            {
              statusCode: HttpStatus.NOT_FOUND,
              message: 'Educador não encontrado.',
            },
            HttpStatus.NOT_FOUND,
          );
        }

        timetable.educator = educator;
      }
    }

    timetable.days = updateTimetableDto.days ?? timetable.days;
    timetable.hours = updateTimetableDto.hours ?? timetable.hours;

    return this.timetableRepository.save(timetable);
  }

  async remove(id: number): Promise<void> {
    const timetable = await this.findOne(id);
    await this.timetableRepository.remove(timetable);
  }
}
