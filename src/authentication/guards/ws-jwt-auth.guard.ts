import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { UserService } from '../../models/user/user.service';

@Injectable()
export class WsJwtAuthGuard implements CanActivate {
  constructor(private readonly userService: UserService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const client: Socket = context.switchToWs().getClient();
      const token = client.handshake.auth.token;

      if (!token) {
        throw new WsException('Token não fornecido');
      }

      const user = await this.userService.validateToken(token);
      if (!user) {
        throw new WsException('Token inválido');
      }

      // Adiciona o usuário ao objeto da requisição
      client.data.user = user;
      return true;
    } catch (error) {
      throw new WsException('Não autorizado');
    }
  }
}
