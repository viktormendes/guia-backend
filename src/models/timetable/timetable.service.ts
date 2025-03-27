import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateTimetableDto } from './dto/create-timetable.dto';
import { UpdateTimetableDto } from './dto/update-timetable.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Educator } from '../educator/entities/educator.entity';
import { Repository } from 'typeorm';
import { Discipline } from '../discipline/entities/discipline.entity';
import { Timetable } from './entities/timetable.entity';
import { Room } from '../room/entities/room.entity';

@Injectable()
export class TimetableService {
  constructor(
    @InjectRepository(Discipline)
    private readonly disciplineRepository: Repository<Discipline>,
    @InjectRepository(Educator)
    private readonly educatorRepository: Repository<Educator>,
    @InjectRepository(Timetable)
    private readonly timetableRepository: Repository<Timetable>,
    @InjectRepository(Room)
    private readonly roomRepository: Repository<Room>,
  ) {}

  async create(createTimetableDto: CreateTimetableDto) {
    const { disciplineId, educatorId, roomId, days, hours } =
      createTimetableDto;

    const discipline = await this.disciplineRepository.findOne({
      where: { id: disciplineId },
    });

    if (!discipline) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Disciplina não encontrada.',
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

    let room: Room | null = null;
    if (roomId) {
      room = await this.roomRepository.findOne({
        where: { id: roomId },
      });

      if (!room) {
        throw new HttpException(
          {
            statusCode: HttpStatus.NOT_FOUND,
            message: 'Sala não encontrada.',
          },
          HttpStatus.NOT_FOUND,
        );
      }
    }

    const timetable = this.timetableRepository.create({
      discipline,
      educator: educator ?? undefined,
      room: room ?? undefined,
      days,
      hours,
    });

    return this.timetableRepository.save(timetable);
  }

  async findAll(): Promise<
    {
      id: number;
      disciplineId: number;
      days: string;
      hours: string;
      educator: any;
      room: any;
    }[]
  > {
    const timetables = await this.timetableRepository.find({
      relations: ['discipline', 'educator', 'room'],
    });

    return timetables.map((timetable) => ({
      id: timetable.id,
      disciplineId: timetable.discipline.id,
      days: timetable.days,
      hours: timetable.hours,
      educator: timetable.educator,
      room: timetable.room,
    }));
  }

  async findAllByDisciplineId(
    disciplineId: number,
  ): Promise<{ days: string; hours: string; room: any }[]> {
    const timetables = await this.timetableRepository.find({
      where: { discipline: { id: disciplineId } },
      relations: ['discipline', 'educator', 'room'],
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
      room: timetable.room,
    }));
  }

  async findOne(id: number): Promise<Timetable> {
    const timetable = await this.timetableRepository.findOne({
      where: { id },
      relations: ['discipline', 'educator', 'room'],
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
    const { disciplineId, educatorId, roomId, days, hours } =
      updateTimetableDto;

    const timetable = await this.findOne(id);

    if (disciplineId) {
      const discipline = await this.disciplineRepository.findOne({
        where: { id: disciplineId },
      });

      if (!discipline) {
        throw new HttpException(
          {
            statusCode: HttpStatus.NOT_FOUND,
            message: 'Disciplina não encontrada.',
          },
          HttpStatus.NOT_FOUND,
        );
      }

      timetable.discipline = discipline;
    }

    if (educatorId) {
      const educator = await this.educatorRepository.findOne({
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

      timetable.educator = educator;
    }

    if (roomId) {
      const room = await this.roomRepository.findOne({
        where: { id: roomId },
      });

      if (!room) {
        throw new HttpException(
          {
            statusCode: HttpStatus.NOT_FOUND,
            message: 'Sala não encontrada.',
          },
          HttpStatus.NOT_FOUND,
        );
      }

      timetable.room = room;
    }

    if (days) {
      timetable.days = days;
    }

    if (hours) {
      timetable.hours = hours;
    }

    return this.timetableRepository.save(timetable);
  }

  async remove(id: number): Promise<void> {
    const result = await this.timetableRepository.delete(id);
    if (result.affected === 0) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Horário não encontrado.',
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }
}
