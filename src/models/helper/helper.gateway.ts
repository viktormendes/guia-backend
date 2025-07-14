/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UserService } from '../user/user.service';
import { Role } from 'src/common/enums/role.enum';

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  namespace: 'helper',
  transports: ['websocket'],
})
export class HelperGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  // Map de client.id para { userId, role }
  private connectedHelpers: Map<string, { userId: number; role: Role }> =
    new Map();

  constructor(private readonly userService: UserService) {}

  async handleConnection(client: Socket): Promise<void> {
    try {
      const token = client.handshake.auth.token;
      if (!token) {
        console.log('[SOCKET] Token não fornecido, desconectando helper');
        client.disconnect();
        return;
      }

      const user = await this.userService.validateToken(token);
      if (!user) {
        console.log(
          '[SOCKET] Token inválido ou usuário não é helper, desconectando',
        );
        client.disconnect();
        return;
      }

      this.connectedHelpers.set(client.id, {
        userId: user.id,
        role: user.role,
      });

      await client.join(`helper_${user.id}`);
      console.log(
        `[SOCKET] Helper conectado: userId=${user.id}, sala=helper_${user.id}`,
      );
    } catch (error) {
      console.error('[SOCKET] Erro na conexão do helper:', error);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket): void {
    const info = this.connectedHelpers.get(client.id);
    if (info) {
      console.log(
        `[SOCKET] Helper desconectado: userId=${info.userId}, sala=helper_${info.userId}`,
      );
      this.connectedHelpers.delete(client.id);
    }
  }

  // Emitir evento de nova ajuda para helper específico
  sendNewHelpRequest(helperId: number, payload: any) {
    console.log(
      `[SOCKET] Emitindo evento 'new_help_request' para helperId=${helperId}, sala=helper_${helperId}, payload=`,
      payload,
    );
    this.server.to(`helper_${helperId}`).emit('new_help_request', payload);
  }

  // Emitir evento para remover card de ajuda
  removeHelpRequest(helperId: number, helpId: number) {
    console.log(
      `[SOCKET] Emitindo evento 'remove_help_request' para helperId=${helperId}, sala=helper_${helperId}, helpId=${helpId}`,
    );
    this.server.to(`helper_${helperId}`).emit('remove_help_request', helpId);
  }
}
