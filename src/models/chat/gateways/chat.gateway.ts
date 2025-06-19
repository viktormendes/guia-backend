/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards, UnauthorizedException } from '@nestjs/common';
import { WsJwtAuthGuard } from '../../../authentication/guards/ws-jwt-auth.guard';
import { ChatService } from '../chat.service';
import { HelpRequestService } from '../../help/help-request.service';
import { UserService } from '../../user/user.service';
import { HelpStatus } from '../../help/enums/help-status.enum';
import { Role } from 'src/common/enums/role.enum';

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:3000',
    credentials: true,
  },
  namespace: 'chat',
  transports: ['websocket'],
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedClients: Map<string, { userId: number; role: Role }> =
    new Map();

  constructor(
    private readonly chatService: ChatService,
    private readonly helpRequestService: HelpRequestService,
    private readonly userService: UserService,
  ) {}

  async handleConnection(client: Socket): Promise<void> {
    try {
      // Verificar token antes de permitir conexão
      const token = client.handshake.auth.token;
      if (!token) {
        throw new UnauthorizedException('Token não fornecido');
      }

      // Validar token e obter usuário
      const user = await this.userService.validateToken(token);
      if (!user) {
        throw new UnauthorizedException('Token inválido');
      }

      // Armazenar informações do cliente
      this.connectedClients.set(client.id, {
        userId: user.id,
        role: user.role,
      });

      console.log(`Cliente autenticado conectado: ${client.id} (${user.role})`);
    } catch (error) {
      console.error('Erro na conexão:', error);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket): void {
    const clientInfo = this.connectedClients.get(client.id);
    if (clientInfo) {
      console.log(`Cliente desconectado: ${client.id} (${clientInfo.role})`);
      this.connectedClients.delete(client.id);
    }
  }

  @UseGuards(WsJwtAuthGuard)
  @SubscribeMessage('joinChat')
  async handleJoinChat(
    @ConnectedSocket() client: Socket,
    @MessageBody() helpId: number,
  ) {
    try {
      const clientInfo = this.connectedClients.get(client.id);
      if (!clientInfo) {
        throw new UnauthorizedException('Cliente não autenticado');
      }

      const help = await this.helpRequestService.findOne(helpId);
      if (!help) {
        throw new Error('Solicitação de ajuda não encontrada');
      }

      // Verificar permissões
      if (clientInfo.role === Role.ADMIN) {
        // Admin pode entrar em qualquer chat
      } else if (clientInfo.role === Role.HELPER) {
        // Ajudante só pode entrar se for o ajudante designado ou se a ajuda estiver pendente
        if (
          help.helper?.id !== clientInfo.userId &&
          help.status !== HelpStatus.PENDING
        ) {
          throw new UnauthorizedException(
            'Sem permissão para acessar este chat',
          );
        }
      } else if (clientInfo.role === Role.STUDENT) {
        // Estudante só pode entrar se for o autor da ajuda
        if (help.student.id !== clientInfo.userId) {
          throw new UnauthorizedException(
            'Sem permissão para acessar este chat',
          );
        }
      } else {
        throw new UnauthorizedException('Sem permissão para acessar este chat');
      }

      const room = `help_${helpId}`;
      await client.join(room);

      // Buscar mensagens anteriores
      const messages = await this.chatService.findMessagesByHelpId(helpId);
      client.emit('previousMessages', { messages });

      // Notificar outros usuários
      client.to(room).emit('userJoined', {
        userId: clientInfo.userId,
        role: clientInfo.role,
        helpId,
      });

      return { success: true, room };
    } catch (error) {
      console.error('Erro ao entrar no chat:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      };
    }
  }

  @UseGuards(WsJwtAuthGuard)
  @SubscribeMessage('sendMessage')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { helpId: number; content: string },
  ) {
    try {
      const clientInfo = this.connectedClients.get(client.id);
      if (!clientInfo) {
        throw new UnauthorizedException('Cliente não autenticado');
      }

      const help = await this.helpRequestService.findOne(data.helpId);
      if (!help) {
        throw new Error('Solicitação de ajuda não encontrada');
      }

      // Verificar se o chat está ativo
      if (help.status !== HelpStatus.IN_PROGRESS) {
        throw new Error('Chat não está ativo');
      }

      // Verificar permissões
      if (clientInfo.role === Role.ADMIN) {
        // Admin pode enviar mensagens em qualquer chat ativo
      } else if (clientInfo.role === Role.HELPER) {
        // Ajudante só pode enviar mensagens se for o ajudante designado
        if (help.helper?.id !== clientInfo.userId) {
          throw new UnauthorizedException(
            'Sem permissão para enviar mensagens',
          );
        }
      } else if (clientInfo.role === Role.STUDENT) {
        // Estudante só pode enviar mensagens se for o autor da ajuda
        if (help.student.id !== clientInfo.userId) {
          throw new UnauthorizedException(
            'Sem permissão para enviar mensagens',
          );
        }
      } else {
        throw new UnauthorizedException('Sem permissão para enviar mensagens');
      }

      const room = `help_${data.helpId}`;
      const message = await this.chatService.createMessage({
        helpId: data.helpId,
        senderId: clientInfo.userId,
        content: data.content,
      });

      // Enviar mensagem para todos na sala
      this.server.in(room).emit('newMessage', { message });

      return { success: true, message };
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      };
    }
  }

  @UseGuards(WsJwtAuthGuard)
  @SubscribeMessage('acceptHelp')
  async handleAcceptHelp(
    @ConnectedSocket() client: Socket,
    @MessageBody() helpId: number,
  ) {
    try {
      const clientInfo = this.connectedClients.get(client.id);
      if (!clientInfo) {
        throw new UnauthorizedException('Cliente não autenticado');
      }

      // Verificar se é um ajudante ou admin
      if (clientInfo.role !== Role.HELPER && clientInfo.role !== Role.ADMIN) {
        throw new UnauthorizedException(
          'Apenas ajudantes podem aceitar solicitações',
        );
      }

      const help = await this.helpRequestService.findOne(helpId);
      if (!help) {
        throw new Error('Solicitação de ajuda não encontrada');
      }

      // Verificar se a ajuda já não foi aceita
      if (help.status !== HelpStatus.PENDING) {
        throw new Error(
          'Esta solicitação já foi aceita ou está em outro estado',
        );
      }

      // Atualizar status e atribuir ajudante
      await this.helpRequestService.updateStatus(
        helpId,
        HelpStatus.IN_PROGRESS,
        {
          id: clientInfo.userId,
        } as any,
      );

      // Notificar todos os usuários conectados
      this.server.emit('helpStatusChanged', {
        helpId,
        status: HelpStatus.IN_PROGRESS,
        helperId: clientInfo.userId,
      });

      return { success: true };
    } catch (error) {
      console.error('Erro ao aceitar ajuda:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      };
    }
  }

  @UseGuards(WsJwtAuthGuard)
  @SubscribeMessage('endHelp')
  async handleEndHelp(
    @ConnectedSocket() client: Socket,
    @MessageBody() helpId: number,
  ) {
    try {
      const clientInfo = this.connectedClients.get(client.id);
      if (!clientInfo) {
        throw new UnauthorizedException('Cliente não autenticado');
      }

      const help = await this.helpRequestService.findOne(helpId);
      if (!help) {
        throw new Error('Solicitação de ajuda não encontrada');
      }

      // Verificar permissões
      if (clientInfo.role === Role.ADMIN) {
        // Admin pode encerrar qualquer chat
      } else if (clientInfo.role === Role.HELPER) {
        // Ajudante só pode encerrar se for o ajudante designado
        if (help.helper?.id !== clientInfo.userId) {
          throw new UnauthorizedException('Sem permissão para encerrar o chat');
        }
      } else if (clientInfo.role === Role.STUDENT) {
        // Estudante só pode encerrar se for o autor da ajuda
        if (help.student.id !== clientInfo.userId) {
          throw new UnauthorizedException('Sem permissão para encerrar o chat');
        }
      } else {
        throw new UnauthorizedException('Sem permissão para encerrar o chat');
      }

      // Atualizar status
      await this.helpRequestService.updateStatus(helpId, HelpStatus.COMPLETED);

      // Notificar todos os usuários conectados
      this.server.emit('helpStatusChanged', {
        helpId,
        status: HelpStatus.COMPLETED,
      });

      return { success: true };
    } catch (error) {
      console.error('Erro ao encerrar ajuda:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      };
    }
  }
}
