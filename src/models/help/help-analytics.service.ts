import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual } from 'typeorm';
import { Help } from './entities/help.entity';
import {
  HelpDashboardDto,
  HelpDashboardActiveHelpersDto,
} from './dto/help-dashboard.dto';
import { HelpType } from './enums/help-type.enum';
import { HelpStatus } from './enums/help-status.enum';

@Injectable()
export class HelpAnalyticsService {
  constructor(
    @InjectRepository(Help)
    private helpRepository: Repository<Help>,
  ) {}

  async getDashboard(): Promise<HelpDashboardDto> {
    const now = new Date();
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );
    const endOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1,
    );
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // 1. Requests totals and by type
    const [total, chat, video, presential] = await Promise.all([
      this.helpRepository.count(),
      this.helpRepository.count({ where: { help_type: HelpType.CHAT } }),
      this.helpRepository.count({ where: { help_type: HelpType.VIDEO_CALL } }),
      this.helpRepository.count({ where: { help_type: HelpType.DISPATCH } }),
    ]);

    // 2. Requests by hour today (by type, 7h to 22h)
    const helpsToday = await this.helpRepository.find({
      where: { createdAt: Between(startOfToday, endOfToday) },
      relations: ['student'],
    });
    const byHour: {
      [hour: string]: { presential: number; chat: number; video: number };
    } = {};
    for (let h = 7; h <= 22; h++) {
      byHour[h.toString()] = { presential: 0, chat: 0, video: 0 };
    }
    helpsToday.forEach((h) => {
      const hour = h.createdAt.getHours();
      if (hour >= 7 && hour <= 22) {
        if (h.help_type === HelpType.DISPATCH)
          byHour[hour.toString()].presential++;
        if (h.help_type === HelpType.CHAT) byHour[hour.toString()].chat++;
        if (h.help_type === HelpType.VIDEO_CALL)
          byHour[hour.toString()].video++;
      }
    });

    // 3. Growth percent this month vs last month
    const totalCurrentMonth = await this.helpRepository.count({
      where: { createdAt: MoreThanOrEqual(startOfMonth) },
    });
    const totalLastMonth = await this.helpRepository.count({
      where: { createdAt: Between(startOfLastMonth, endOfLastMonth) },
    });
    const growthPercent =
      totalLastMonth === 0
        ? 100
        : Math.round(
            ((totalCurrentMonth - totalLastMonth) / totalLastMonth) * 100,
          );

    // 4. Active helpers by month/type (all months of current year)
    const activeHelpers: HelpDashboardActiveHelpersDto[] = [];
    const year = now.getFullYear();
    const monthNames = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    for (let m = 0; m < 12; m++) {
      if (m > now.getMonth()) {
        // Future months: zeroed
        activeHelpers.push({
          month: monthNames[m],
          presential: 0,
          chat: 0,
          video: 0,
        });
        continue;
      }
      const start = new Date(year, m, 1);
      const end = new Date(year, m + 1, 1);
      const [presentialCount, chatCount, videoCount] = await Promise.all([
        this.helpRepository
          .createQueryBuilder('help')
          .select('DISTINCT help.helper')
          .where('help.help_type = :type', { type: HelpType.DISPATCH })
          .andWhere('help.helper IS NOT NULL')
          .andWhere('help.createdAt >= :start AND help.createdAt < :end', {
            start,
            end,
          })
          .getCount(),
        this.helpRepository
          .createQueryBuilder('help')
          .select('DISTINCT help.helper')
          .where('help.help_type = :type', { type: HelpType.CHAT })
          .andWhere('help.helper IS NOT NULL')
          .andWhere('help.createdAt >= :start AND help.createdAt < :end', {
            start,
            end,
          })
          .getCount(),
        this.helpRepository
          .createQueryBuilder('help')
          .select('DISTINCT help.helper')
          .where('help.help_type = :type', { type: HelpType.VIDEO_CALL })
          .andWhere('help.helper IS NOT NULL')
          .andWhere('help.createdAt >= :start AND help.createdAt < :end', {
            start,
            end,
          })
          .getCount(),
      ]);
      activeHelpers.push({
        month: monthNames[m],
        presential: presentialCount,
        chat: chatCount,
        video: videoCount,
      });
    }

    // 5. Today requesters (datatable)
    const requestersMap = new Map<
      number,
      {
        name: string;
        username: string;
        status: string;
        requests: number;
        firstRequestTime: string;
        lastRequestTime: string;
        typesRequested: string[];
        averageIntervalMinutes: number;
        totalCompleted: number;
        totalCancelled: number;
      }
    >();
    // Agrupar helpsToday por estudante
    const helpsByStudent: { [studentId: number]: Help[] } = {};
    helpsToday.forEach((h) => {
      if (!h.student) return;
      if (!helpsByStudent[h.student.id]) helpsByStudent[h.student.id] = [];
      helpsByStudent[h.student.id].push(h);
    });
    for (const [studentIdStr, helps] of Object.entries(helpsByStudent)) {
      const studentId = Number(studentIdStr);
      const name = helps[0].student.firstName + ' ' + helps[0].student.lastName;
      const username = helps[0].student.email;
      const status =
        helps[helps.length - 1].status.charAt(0).toUpperCase() +
        helps[helps.length - 1].status.slice(1);
      const requests = helps.length;
      // Ordenar por horário
      const sortedHelps = helps
        .slice()
        .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
      const firstRequestTime = sortedHelps[0].createdAt
        .toTimeString()
        .slice(0, 5);
      const lastRequestTime = sortedHelps[sortedHelps.length - 1].createdAt
        .toTimeString()
        .slice(0, 5);
      const typesRequested = Array.from(new Set(helps.map((h) => h.help_type)));
      // Intervalo médio
      let averageIntervalMinutes = 0;
      if (helps.length > 1) {
        let totalInterval = 0;
        for (let i = 1; i < sortedHelps.length; i++) {
          totalInterval +=
            (sortedHelps[i].createdAt.getTime() -
              sortedHelps[i - 1].createdAt.getTime()) /
            60000;
        }
        averageIntervalMinutes = Math.round(
          totalInterval / (sortedHelps.length - 1),
        );
      }
      // Totais históricos
      const totalCompleted = await this.helpRepository.count({
        where: { student: { id: studentId }, status: HelpStatus.COMPLETED },
      });
      const totalCancelled = await this.helpRepository.count({
        where: { student: { id: studentId }, status: HelpStatus.CANCELLED },
      });
      requestersMap.set(studentId, {
        name,
        username,
        status,
        requests,
        firstRequestTime,
        lastRequestTime,
        typesRequested,
        averageIntervalMinutes,
        totalCompleted,
        totalCancelled,
      });
    }
    const todayRequesters = Array.from(requestersMap.values());

    return {
      requests: {
        total,
        byType: { presential, chat, video },
        growthPercent,
        byHour,
      },
      activeHelpers,
      todayRequesters,
    };
  }
}
