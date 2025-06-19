import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Help } from './entities/help.entity';
import { CreateHelpDto } from './dto/create-help.dto';
import { User } from '../user/entities/user.entity';
import { HelpStatus } from './enums/help-status.enum';

@Injectable()
export class HelpService {
  constructor(
    @InjectRepository(Help)
    private helpRepository: Repository<Help>,
  ) {}

  async create(createHelpDto: CreateHelpDto, student: User): Promise<Help> {
    const help = this.helpRepository.create({
      ...createHelpDto,
      student,
      status: HelpStatus.PENDING,
      log: [
        {
          action: 'created',
          timestamp: new Date(),
        },
      ],
    });

    return this.helpRepository.save(help);
  }

  async findAll(): Promise<Help[]> {
    return this.helpRepository.find({
      relations: ['student', 'helper'],
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findOne(id: number): Promise<Help | null> {
    return this.helpRepository.findOne({
      where: { id },
      relations: ['student', 'helper'],
    });
  }

  async updateStatus(
    id: number,
    status: HelpStatus,
    helper?: User,
  ): Promise<Help> {
    const help = await this.findOne(id);

    if (!help) {
      throw new NotFoundException('Help not found');
    }

    help.status = status;
    if (helper) {
      help.helper = helper;
    }

    const timestamp = new Date();
    switch (status) {
      case HelpStatus.IN_PROGRESS:
        help.startedAt = timestamp;
        break;
      case HelpStatus.COMPLETED:
        help.completedAt = timestamp;
        break;
      case HelpStatus.CANCELLED:
        help.cancelledAt = timestamp;
        break;
    }

    help.log.push({
      action: `status_changed_to_${status}`,
      timestamp,
      details: helper ? { helperId: helper.id } : undefined,
    });

    return this.helpRepository.save(help);
  }

  async findHelpsByStudent(studentId: number): Promise<Help[]> {
    return this.helpRepository.find({
      where: { student: { id: studentId } },
      relations: ['student', 'helper'],
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findHelpsByHelper(helperId: number): Promise<Help[]> {
    return this.helpRepository.find({
      where: { helper: { id: helperId } },
      relations: ['student', 'helper'],
      order: {
        createdAt: 'DESC',
      },
    });
  }
}
