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

  private connectedHelpers: Map<string, { userId: number; role: Role }> =
    new Map();

  constructor(private readonly userService: UserService) {}

  async handleConnection(client: Socket): Promise<void> {
    try {
      const token = client.handshake.auth.token;
      if (!token) {
        client.disconnect();
        return;
      }
      const user = await this.userService.validateToken(token);
      if (!user || user.role !== Role.HELPER) {
        client.disconnect();
        return;
      }
      this.connectedHelpers.set(client.id, {
        userId: user.id,
        role: user.role,
      });
      client.join(`helper_${user.id}`);
      console.log(`Helper conectado: ${user.id}`);
    } catch (e) {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket): void {
    const info = this.connectedHelpers.get(client.id);
    if (info) {
      console.log(`Helper desconectado: ${info.userId}`);
      this.connectedHelpers.delete(client.id);
    }
  }

  // Método utilitário para enviar notificação de nova ajuda
  sendNewHelpRequest(helperId: number, payload: any) {
    this.server.to(`helper_${helperId}`).emit('new_help_request', payload);
  }

  // Método utilitário para remover card de ajuda
  removeHelpRequest(helperId: number, helpId: number) {
    this.server.to(`helper_${helperId}`).emit('remove_help_request', helpId);
  }
}
