import { Injectable, OnModuleInit, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Help } from './entities/help.entity';
import { HelpType } from './enums/help-type.enum';
import { HelperService } from '../helper/helper.service';
import { RedisService } from '../../redis/redis.service';
import { HelpStatus } from './enums/help-status.enum';
import { FirebaseService } from '../../firebase/firebase.service';
import { User } from '../user/entities/user.entity';
import { Role } from '../../common/enums/role.enum';

@Injectable()
export class HelpRequestService implements OnModuleInit {
  private readonly REQUEST_TIMEOUT = 300; // 5 minutos em segundos
  private readonly REQUEST_PREFIX = 'help_request:';

  constructor(
    @InjectRepository(Help)
    private readonly helpRepository: Repository<Help>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly helperService: HelperService,
    private readonly redisService: RedisService,
    private readonly firebaseService: FirebaseService,
  ) {}

  async onModuleInit() {
    // Limpar todas as solicitações pendentes ao iniciar
    const keys = await this.redisService.keys(`${this.REQUEST_PREFIX}*`);
    if (keys.length > 0) {
      await this.redisService.del(keys);
    }

    // Verificar ajudas canceladas pendentes
    await this.checkCancelledHelps();

    // Verificar ajudas aceitas pendentes
    await this.checkAcceptedHelps();
  }

  private async checkCancelledHelps(): Promise<void> {
    // Buscar todas as ajudas pendentes
    const pendingHelps = await this.helpRepository.find({
      where: { status: HelpStatus.PENDING },
    });

    for (const help of pendingHelps) {
      const cancelledReason = await this.helperService.getCancelledHelpReason(
        help.id,
      );
      if (cancelledReason) {
        await this.cancelHelpRequest(help.id, cancelledReason);
      }
    }
  }

  async processCancelledHelps(): Promise<number> {
    let processed = 0;

    // Buscar todas as ajudas pendentes
    const pendingHelps = await this.helpRepository.find({
      where: { status: HelpStatus.PENDING },
    });

    for (const help of pendingHelps) {
      const cancelledReason = await this.helperService.getCancelledHelpReason(
        help.id,
      );
      if (cancelledReason) {
        await this.cancelHelpRequest(help.id, cancelledReason);
        processed++;
      }
    }

    return processed;
  }

  async isHelpPending(helpId: number): Promise<boolean> {
    const pendingHelpKey = `pending_help:${helpId}`;
    const isPending = await this.redisService.get(pendingHelpKey);
    return !!isPending;
  }

  async getCancelledReason(helpId: number): Promise<string | null> {
    return await this.helperService.getCancelledHelpReason(helpId);
  }

  async getAcceptedHelperId(helpId: number): Promise<number | null> {
    return await this.helperService.getAcceptedHelpHelperId(helpId);
  }

  private async checkAcceptedHelps(): Promise<void> {
    // Buscar todas as ajudas pendentes
    const pendingHelps = await this.helpRepository.find({
      where: { status: HelpStatus.PENDING },
    });

    for (const help of pendingHelps) {
      const helperId = await this.helperService.getAcceptedHelpHelperId(
        help.id,
      );
      if (helperId) {
        await this.acceptHelpRequest(help.id, helperId);
      }
    }
  }

  private getRequestKey(helpId: number): string {
    return `${this.REQUEST_PREFIX}${helpId}`;
  }

  private addLog(
    help: Help,
    action: string,
    details?: Record<string, any>,
  ): void {
    if (!help.log) {
      help.log = [];
    }
    help.log.push({
      action,
      timestamp: new Date(),
      details,
    });
  }

  async findAll(): Promise<Help[]> {
    return await this.helpRepository.find({
      relations: ['student', 'helper'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(helpId: number): Promise<Help | null> {
    return await this.helpRepository.findOne({
      where: { id: helpId },
      relations: ['student', 'helper'],
    });
  }

  async findHelpsByStudent(studentId: number): Promise<Help[]> {
    return await this.helpRepository.find({
      where: { student: { id: studentId } },
      relations: ['student', 'helper'],
      order: { createdAt: 'DESC' },
    });
  }

  async findHelpsByHelper(helperId: number): Promise<Help[]> {
    return await this.helpRepository.find({
      where: { helper: { id: helperId } },
      relations: ['student', 'helper'],
      order: { createdAt: 'DESC' },
    });
  }

  async updateStatus(
    helpId: number,
    status: HelpStatus,
    helper?: { id: number },
  ): Promise<Help> {
    const help = await this.helpRepository.findOne({
      where: { id: helpId },
      relations: ['student', 'helper'],
    });

    if (!help) {
      throw new Error('Solicitação de ajuda não encontrada');
    }

    const wasInProgress = help.status === HelpStatus.IN_PROGRESS;

    help.status = status;
    this.addLog(help, 'status_updated', { status, helperId: helper?.id });

    if (helper) {
      const helperUser = await this.userRepository.findOne({
        where: { id: helper.id },
      });
      if (!helperUser) {
        throw new Error('Helper não encontrado');
      }
      help.helper = helperUser;
      help.startedAt = new Date();
    }

    if (status === HelpStatus.COMPLETED) {
      help.completedAt = new Date();
    }

    await this.helpRepository.save(help);

    // Se a ajuda foi concluída ou cancelada, e tinha um helper,
    // coloca o helper de volta na fila de disponíveis.
    if (
      wasInProgress &&
      (status === HelpStatus.COMPLETED || status === HelpStatus.CANCELLED) &&
      help.helper
    ) {
      await this.helperService.setAvailability(
        help.helper.id,
        help.help_type,
        true,
      );
    }

    // Remover timeout se a solicitação foi finalizada
    if (status === HelpStatus.COMPLETED || status === HelpStatus.CANCELLED) {
      const requestKey = this.getRequestKey(helpId);
      await this.redisService.del(requestKey);
    }

    // Notificar estudante
    if (help.student?.fcm_token) {
      let title = '';
      let body = '';

      switch (status) {
        case HelpStatus.IN_PROGRESS:
          title = 'Solicitação aceita';
          body = 'Sua solicitação de ajuda foi aceita';
          break;
        case HelpStatus.COMPLETED:
          title = 'Solicitação finalizada';
          body = 'Sua solicitação de ajuda foi finalizada';
          break;
        case HelpStatus.CANCELLED:
          title = 'Solicitação cancelada';
          body = 'Sua solicitação de ajuda foi cancelada';
          break;
      }

      await this.firebaseService.sendNotification({
        token: help.student.fcm_token,
        title,
        body,
        data: {
          helpId: help.id.toString(),
          helpType: help.help_type,
          action: `help_${status.toLowerCase()}`,
        },
      });
    }

    return help;
  }

  async createHelpRequest(
    studentId: number,
    helpType: HelpType,
    description: string,
  ): Promise<Help> {
    // Verificar se existem helpers disponíveis
    const availableHelpers =
      await this.helperService.getAvailableHelpers(helpType);
    if (availableHelpers.length === 0) {
      throw new BadRequestException(
        'Não há helpers disponíveis para este tipo de ajuda',
      );
    }

    const student = await this.userRepository.findOne({
      where: { id: studentId },
    });

    if (!student) {
      throw new Error('Estudante não encontrado');
    }

    // Criar solicitação no banco
    const help = await this.helpRepository.save({
      student,
      help_type: helpType,
      description,
      status: HelpStatus.PENDING,
      log: [
        {
          action: 'created',
          timestamp: new Date(),
          details: { helpType, description },
        },
      ],
    });

    // Configurar timeout de 5 minutos
    const requestKey = this.getRequestKey(help.id);
    await this.redisService.set(requestKey, '1', 'EX', this.REQUEST_TIMEOUT);

    // Iniciar processo de notificação usando o novo sistema de fila
    await this.helperService.processHelpRequest(help.id, helpType);

    return help;
  }

  private async notifyNextHelper(help: Help): Promise<void> {
    const helper = await this.helperService.getNextHelper(help.help_type);

    if (!helper) {
      // Se não houver helpers disponíveis, marcar como cancelado
      await this.cancelHelpRequest(help.id, 'Nenhum helper disponível');
      return;
    }

    // Notificar helper
    const wasNotified = await this.helperService.notifyHelper(
      helper.id,
      help.help_type,
    );

    if (!wasNotified) {
      // Se o helper não puder ser notificado, tentar o próximo
      await this.notifyNextHelper(help);
      return;
    }

    // Adicionar log
    this.addLog(help, 'notified_helper', { helperId: helper.id });

    // Enviar notificação push apenas se o helper tiver um token FCM
    if (helper.fcm_token) {
      try {
        await this.firebaseService.sendNotification({
          token: helper.fcm_token,
          title: 'Nova solicitação de ajuda',
          body: `Nova solicitação de ${help.help_type} recebida`,
          data: {
            helpId: help.id.toString(),
            helpType: help.help_type,
            action: 'accept_help',
          },
        });
      } catch (error) {
        console.error('Erro ao enviar notificação:', error);
        // Não interrompe o fluxo se a notificação falhar
      }
    }
  }

  async acceptHelpRequest(helpId: number, helperId: number): Promise<Help> {
    const help = await this.helpRepository.findOne({
      where: { id: helpId },
      relations: ['student', 'helper'],
    });

    if (!help) {
      throw new Error('Solicitação de ajuda não encontrada');
    }

    if (help.status !== HelpStatus.PENDING) {
      throw new Error('Esta solicitação já foi aceita ou está em outro estado');
    }

    const helper = await this.userRepository.findOne({
      where: { id: helperId },
    });

    if (!helper) {
      throw new Error('Helper não encontrado');
    }

    // Atualizar status e atribuir ajudante
    help.status = HelpStatus.IN_PROGRESS;
    help.helper = helper;
    help.startedAt = new Date();

    this.addLog(help, 'accepted_by_helper', { helperId: helper.id });

    await this.helpRepository.save(help);

    // Remover timeout da solicitação
    const requestKey = this.getRequestKey(helpId);
    await this.redisService.del(requestKey);

    // Notificar estudante
    if (help.student?.fcm_token) {
      try {
        await this.firebaseService.sendNotification({
          token: help.student.fcm_token,
          title: 'Solicitação aceita!',
          body: `Sua solicitação de ${help.help_type} foi aceita por ${helper.firstName} ${helper.lastName}`,
          data: {
            helpId: help.id.toString(),
            helpType: help.help_type,
            action: 'help_accepted',
            helperId: helper.id.toString(),
          },
        });
      } catch (error) {
        console.error('Erro ao notificar estudante:', error);
      }
    }

    return help;
  }

  async cancelHelpRequest(helpId: number, reason: string): Promise<Help> {
    const help = await this.helpRepository.findOne({
      where: { id: helpId, status: HelpStatus.PENDING },
      relations: ['student', 'helper'],
    });

    if (!help) {
      throw new Error('Solicitação não encontrada ou já finalizada');
    }

    help.status = HelpStatus.CANCELLED;
    help.cancellation_reason = reason;
    help.cancelledAt = new Date();
    this.addLog(help, 'cancelled', { reason });

    await this.helpRepository.save(help);

    // Remover timeout
    const requestKey = this.getRequestKey(helpId);
    await this.redisService.del(requestKey);

    // Notificar estudante
    if (help.student?.fcm_token) {
      await this.firebaseService.sendNotification({
        token: help.student.fcm_token,
        title: 'Solicitação cancelada',
        body: reason,
        data: {
          helpId: help.id.toString(),
          helpType: help.help_type,
          action: 'help_cancelled',
        },
      });
    }

    return help;
  }

  async completeHelp(
    helpId: number,
    userId: number,
    userRole: Role,
  ): Promise<Help> {
    const help = await this.findOne(helpId);

    if (!help) {
      throw new BadRequestException('Solicitação de ajuda não encontrada.');
    }

    // Apenas o helper que aceitou ou um admin pode concluir
    const isOwner = help.helper && help.helper.id === userId;
    const isAdmin = userRole === Role.ADMIN;

    if (!isOwner && !isAdmin) {
      throw new BadRequestException(
        'Você não tem permissão para concluir esta ajuda.',
      );
    }

    return this.updateStatus(helpId, HelpStatus.COMPLETED);
  }
}
