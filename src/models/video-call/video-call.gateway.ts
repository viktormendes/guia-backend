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

interface JoinRoomPayload {
  helpId: string;
  userId: number;
}

interface OfferPayload {
  helpId: string;
  sdp: RTCSessionDescriptionInit;
}

interface AnswerPayload {
  helpId: string;
  sdp: RTCSessionDescriptionInit;
}

interface IceCandidatePayload {
  helpId: string;
  candidate: RTCIceCandidateInit;
}

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  namespace: 'video-call',
  transports: ['websocket'],
})
export class VideoCallGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  // Map<helpId, Set<clientId>>
  private rooms = new Map<string, Set<string>>();
  // Map<clientId, helpId>
  private clientRoom = new Map<string, string>();

  handleConnection() {
    // Nada especial ao conectar
  }

  handleDisconnect(client: Socket) {
    const helpId = this.clientRoom.get(client.id);
    if (helpId) {
      this.leaveRoom(client, helpId);
    }
  }

  /**
   * Evento para entrar em uma sala de videochamada (helpId)
   * payload: { helpId, userId }
   */
  @SubscribeMessage('join-room')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: JoinRoomPayload,
  ) {
    const { helpId } = payload;
    let room = this.rooms.get(helpId);
    if (!room) {
      room = new Set();
      this.rooms.set(helpId, room);
    }
    if (room.size >= 2) {
      client.emit('room-full', { helpId });
      return { success: false, message: 'Sala cheia' };
    }
    room.add(client.id);
    this.clientRoom.set(client.id, helpId);
    client.join(helpId);
    client.emit('joined-room', { helpId });
    // Notificar o outro participante que alguém entrou (se já houver)
    if (room.size === 2) {
      client.to(helpId).emit('peer-joined', { helpId });
    }
    return { success: true };
  }

  /**
   * Evento para enviar uma offer SDP
   * payload: { helpId, sdp }
   */
  @SubscribeMessage('offer')
  handleOffer(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: OfferPayload,
  ) {
    const { helpId, sdp } = payload;
    client.to(helpId).emit('offer', { helpId, sdp });
  }

  /**
   * Evento para enviar uma answer SDP
   * payload: { helpId, sdp }
   */
  @SubscribeMessage('answer')
  handleAnswer(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: AnswerPayload,
  ) {
    const { helpId, sdp } = payload;
    client.to(helpId).emit('answer', { helpId, sdp });
  }

  /**
   * Evento para enviar um ICE candidate
   * payload: { helpId, candidate }
   */
  @SubscribeMessage('ice-candidate')
  handleIceCandidate(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: IceCandidatePayload,
  ) {
    const { helpId, candidate } = payload;
    client.to(helpId).emit('ice-candidate', { helpId, candidate });
  }

  /**
   * Evento para sair da sala
   * payload: { helpId }
   */
  @SubscribeMessage('leave-room')
  handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { helpId: string },
  ) {
    this.leaveRoom(client, payload.helpId);
  }

  private leaveRoom(client: Socket, helpId: string) {
    const room = this.rooms.get(helpId);
    if (room) {
      room.delete(client.id);
      if (room.size === 0) {
        this.rooms.delete(helpId);
      }
    }
    this.clientRoom.delete(client.id);
    client.leave(helpId);
    // Notificar o outro participante
    client.to(helpId).emit('peer-left', { helpId });
  }
}
