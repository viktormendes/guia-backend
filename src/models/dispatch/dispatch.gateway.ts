import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { WsJwtAuthGuard } from '../../authentication/guards/ws-jwt-auth.guard';
import {
  UserLocationService,
  LocationData,
} from '../user/user-location.service';
import { HelpRequestService } from '../help/help-request.service';
import { HelpType } from '../help/enums/help-type.enum';
import { Role } from '../../common/enums/role.enum';
import { UserService } from '../user/user.service';

interface ConnectedClient {
  userId: number;
  role: Role;
  helpId?: number;
}

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  namespace: 'dispatch',
  transports: ['websocket'],
})
export class DispatchGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private connectedClients = new Map<string, ConnectedClient>();

  constructor(
    private readonly userLocationService: UserLocationService,
    private readonly helpRequestService: HelpRequestService,
    private readonly userService: UserService,
  ) {}

  async handleConnection(client: Socket): Promise<void> {
    try {
      // Verificar token antes de permitir conexão
      const token = client.handshake.auth.token as string;
      if (!token) {
        throw new Error('Token não fornecido');
      }

      // Validar token e obter usuário
      const user = await this.userService.validateToken(token);
      if (!user) {
        throw new Error('Token inválido');
      }

      // Armazenar informações do cliente
      this.connectedClients.set(client.id, {
        userId: user.id,
        role: user.role,
      });

      // Entrar na sala do usuário
      await client.join(`user_${user.id}`);

      console.log(`Cliente de dispatch conectado: ${client.id} (${user.role})`);
    } catch (error) {
      console.error('Erro na conexão do dispatch:', error);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket): void {
    this.connectedClients.delete(client.id);
    console.log(`Cliente de dispatch desconectado: ${client.id}`);
  }

  @UseGuards(WsJwtAuthGuard)
  @SubscribeMessage('updateLocation')
  async handleUpdateLocation(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: LocationData,
  ): Promise<{ success: boolean; message?: string }> {
    try {
      const clientInfo = this.connectedClients.get(client.id);
      if (!clientInfo) {
        throw new Error('Cliente não autenticado');
      }

      // Atualizar localização do usuário
      await this.userLocationService.updateLocation(clientInfo.userId, data);

      // Se o usuário está em uma ajuda de dispatch, notificar o outro participante
      if (clientInfo.helpId) {
        await this.notifyLocationUpdate(
          clientInfo.helpId,
          clientInfo.userId,
          data,
        );
      }

      return { success: true };
    } catch (error) {
      console.error('Erro ao atualizar localização:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Erro desconhecido',
      };
    }
  }

  @UseGuards(WsJwtAuthGuard)
  @SubscribeMessage('joinDispatch')
  async handleJoinDispatch(
    @ConnectedSocket() client: Socket,
    @MessageBody() helpId: number,
  ): Promise<{ success: boolean; message?: string }> {
    try {
      const clientInfo = this.connectedClients.get(client.id);
      if (!clientInfo) {
        throw new Error('Cliente não autenticado');
      }

      // Verificar se a ajuda existe e é do tipo dispatch
      const help = await this.helpRequestService.findOne(helpId);
      if (!help) {
        throw new Error('Ajuda não encontrada');
      }

      if (help.help_type !== HelpType.DISPATCH) {
        throw new Error('Esta não é uma ajuda de dispatch');
      }

      // Verificar permissões
      const isStudent = help.student.id === clientInfo.userId;
      const isHelper = help.helper?.id === clientInfo.userId;
      const isAdmin = clientInfo.role === Role.ADMIN;

      if (!isStudent && !isHelper && !isAdmin) {
        throw new Error('Sem permissão para acessar este dispatch');
      }

      // Atualizar cliente com o helpId
      clientInfo.helpId = helpId;
      this.connectedClients.set(client.id, clientInfo);

      // Entrar na sala do dispatch
      await client.join(`dispatch_${helpId}`);

      // Enviar localizações atuais dos participantes
      await this.sendCurrentLocations(client, helpId);

      return { success: true };
    } catch (error) {
      console.error('Erro ao entrar no dispatch:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Erro desconhecido',
      };
    }
  }

  @UseGuards(WsJwtAuthGuard)
  @SubscribeMessage('leaveDispatch')
  async handleLeaveDispatch(
    @ConnectedSocket() client: Socket,
    @MessageBody() helpId: number,
  ): Promise<{ success: boolean; message?: string }> {
    try {
      const clientInfo = this.connectedClients.get(client.id);
      if (!clientInfo) {
        throw new Error('Cliente não autenticado');
      }

      // Sair da sala do dispatch
      await client.leave(`dispatch_${helpId}`);

      // Remover helpId do cliente
      delete clientInfo.helpId;
      this.connectedClients.set(client.id, clientInfo);

      return { success: true };
    } catch (error) {
      console.error('Erro ao sair do dispatch:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Erro desconhecido',
      };
    }
  }

  private async notifyLocationUpdate(
    helpId: number,
    userId: number,
    location: LocationData,
  ): Promise<void> {
    const help = await this.helpRequestService.findOne(helpId);
    if (!help) return;

    // Determinar o outro participante
    const otherUserId =
      help.student.id === userId ? help.helper?.id : help.student.id;
    if (!otherUserId) return;

    // Enviar atualização de localização para o outro participante
    this.server.to(`dispatch_${helpId}`).emit('locationUpdated', {
      userId,
      location,
      helpId,
    });
  }

  private async sendCurrentLocations(
    client: Socket,
    helpId: number,
  ): Promise<void> {
    const help = await this.helpRequestService.findOne(helpId);
    if (!help) return;

    const userIds = [help.student.id];
    if (help.helper) {
      userIds.push(help.helper.id);
    }

    const locations = await this.userLocationService.getLocations(userIds);

    client.emit('currentLocations', {
      helpId,
      dispatch: help,
      locations: locations.map((loc) => ({
        userId: loc.userId,
        latitude: loc.latitude,
        longitude: loc.longitude,
        address: loc.address,
        accuracy: loc.accuracy,
        updatedAt: loc.updatedAt,
      })),
    });
  }

  // Método público para notificar quando usuários estão próximos
  async notifyUsersNearby(
    helpId: number,
    studentId: number,
    helperId: number,
  ): Promise<void> {
    const studentLocation =
      await this.userLocationService.getLocation(studentId);
    const helperLocation = await this.userLocationService.getLocation(helperId);

    if (!studentLocation || !helperLocation) return;

    const areNearby = this.userLocationService.areUsersNearby(
      studentLocation.latitude,
      studentLocation.longitude,
      helperLocation.latitude,
      helperLocation.longitude,
    );

    if (areNearby) {
      this.server.to(`dispatch_${helpId}`).emit('usersNearby', {
        helpId,
        message: 'Vocês estão próximos um do outro!',
      });
    }
  }

  // Método público para notificar cancelamento de ajuda
  notifyHelpCancelled(helpId: number, reason: string): void {
    this.server.to(`dispatch_${helpId}`).emit('helpCancelled', {
      helpId,
      reason,
    });
  }

  // Método público para notificar finalização de ajuda
  notifyHelpCompleted(helpId: number): void {
    this.server.to(`dispatch_${helpId}`).emit('helpCompleted', {
      helpId,
    });
  }
}
