import { Injectable } from '@nestjs/common';
import { HelpRequestService } from '../help/help-request.service';
import { UserLocationService } from '../user/user-location.service';
import { DispatchGateway } from './dispatch.gateway';
import { HelpStatus } from '../help/enums/help-status.enum';
import { HelpType } from '../help/enums/help-type.enum';
import { Role } from '../../common/enums/role.enum';

@Injectable()
export class DispatchService {
  constructor(
    private readonly helpRequestService: HelpRequestService,
    private readonly userLocationService: UserLocationService,
    private readonly dispatchGateway: DispatchGateway,
  ) {}

  async createDispatchRequest(
    studentId: number,
    description: string,
    initialLocation: {
      latitude: number;
      longitude: number;
      address?: string;
      accuracy?: number;
    },
  ) {
    // Salvar localização inicial do estudante
    await this.userLocationService.updateLocation(studentId, initialLocation);

    // Criar solicitação de ajuda do tipo dispatch
    const help = await this.helpRequestService.createHelpRequest(
      studentId,
      HelpType.DISPATCH,
      description,
    );

    return help;
  }

  async acceptDispatchRequest(helpId: number, helperId: number) {
    // Aceitar a ajuda normalmente
    const help = await this.helpRequestService.acceptHelpRequest(
      helpId,
      helperId,
    );

    // Notificar ambos os participantes sobre o início do dispatch
    this.dispatchGateway.server
      .to(`dispatch_${helpId}`)
      .emit('dispatchStarted', {
        helpId,
        studentId: help.student.id,
        helperId: help.helper.id,
      });

    return help;
  }

  async updateUserLocation(
    userId: number,
    location: {
      latitude: number;
      longitude: number;
      address?: string;
      accuracy?: number;
    },
  ) {
    // Atualizar localização do usuário
    await this.userLocationService.updateLocation(userId, location);

    // Verificar se o usuário está em alguma ajuda de dispatch ativa
    const activeDispatch = await this.findActiveDispatchByUserId(userId);
    if (activeDispatch) {
      // Verificar se os usuários estão próximos
      await this.checkUsersProximity(activeDispatch.id);
    }
  }

  async cancelDispatchRequest(helpId: number, reason: string) {
    // Cancelar a ajuda
    const help = await this.helpRequestService.cancelHelpRequest(
      helpId,
      reason,
    );

    // Notificar cancelamento via WebSocket
    this.dispatchGateway.notifyHelpCancelled(helpId, reason);

    return help;
  }

  async completeDispatchRequest(
    helpId: number,
    userId: number,
    userRole: Role,
  ) {
    // Completar a ajuda
    const help = await this.helpRequestService.completeHelp(
      helpId,
      userId,
      userRole,
    );

    // Notificar finalização via WebSocket
    this.dispatchGateway.notifyHelpCompleted(helpId);

    return help;
  }

  async checkUsersProximity(helpId: number) {
    const help = await this.helpRequestService.findOne(helpId);
    if (!help || help.help_type !== HelpType.DISPATCH || !help.helper) {
      return;
    }

    // Verificar se os usuários estão próximos
    await this.dispatchGateway.notifyUsersNearby(
      helpId,
      help.student.id,
      help.helper.id,
    );
  }

  private async findActiveDispatchByUserId(userId: number) {
    // Buscar ajuda de dispatch ativa onde o usuário é estudante ou helper
    // Esta implementação pode ser melhorada com uma consulta mais específica
    const helps = await this.helpRequestService.findAll();

    return helps.find(
      (help) =>
        help.help_type === HelpType.DISPATCH &&
        help.status === HelpStatus.IN_PROGRESS &&
        (help.student.id === userId || help.helper?.id === userId),
    );
  }
}
