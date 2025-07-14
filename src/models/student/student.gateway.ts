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
  namespace: 'student',
  transports: ['websocket'],
})
export class StudentGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  // Map de client.id para { userId, role }
  private connectedStudents: Map<string, { userId: number; role: Role }> =
    new Map();

  constructor(private readonly userService: UserService) {}

  async handleConnection(client: Socket): Promise<void> {
    try {
      const token = client.handshake.auth.token;
      if (!token) {
        console.log('[SOCKET] Token não fornecido, desconectando estudante');
        client.disconnect();
        return;
      }

      const user = await this.userService.validateToken(token);
      if (!user) {
        console.log(
          '[SOCKET] Token inválido ou usuário não é estudante, desconectando',
        );
        client.disconnect();
        return;
      }

      this.connectedStudents.set(client.id, {
        userId: user.id,
        role: user.role,
      });

      client.join(`student_${user.id}`);
      console.log(
        `[SOCKET] Estudante conectado: userId=${user.id}, sala=student_${user.id}`,
      );
    } catch (error) {
      console.error('[SOCKET] Erro na conexão do estudante:', error);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket): void {
    const info = this.connectedStudents.get(client.id);
    if (info) {
      console.log(
        `[SOCKET] Estudante desconectado: userId=${info.userId}, sala=student_${info.userId}`,
      );
      this.connectedStudents.delete(client.id);
    }
  }

  // Emitir evento quando ajuda for aceita
  sendHelpRequestAccepted(
    studentId: number,
    payload: { helpId: number; chatId: number; helpType: string },
  ) {
    console.log(
      `[SOCKET] Emitindo evento 'help_request_accepted' para studentId=${studentId}, sala=student_${studentId}, payload=`,
      payload,
    );
    this.server
      .to(`student_${studentId}`)
      .emit('help_request_accepted', payload);
  }

  // Emitir evento quando ajuda for rejeitada
  sendHelpRequestRejected(studentId: number, payload: { helpId: number }) {
    console.log(
      `[SOCKET] Emitindo evento 'help_request_rejected' para studentId=${studentId}, sala=student_${studentId}, payload=`,
      payload,
    );
    this.server
      .to(`student_${studentId}`)
      .emit('help_request_rejected', payload);
  }

  // Emitir evento quando ajuda expirar
  sendHelpRequestExpired(studentId: number, payload: { helpId: number }) {
    console.log(
      `[SOCKET] Emitindo evento 'help_request_expired' para studentId=${studentId}, sala=student_${studentId}, payload=`,
      payload,
    );
    this.server
      .to(`student_${studentId}`)
      .emit('help_request_expired', payload);
  }
}
