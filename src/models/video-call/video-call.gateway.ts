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

  handleConnection(client: Socket) {
    console.log(`[BACKEND] Cliente conectado: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    const helpId = this.clientRoom.get(client.id);
    if (helpId) {
      this.leaveRoom(client, helpId);
    }
    console.log(`[BACKEND] Cliente desconectado: ${client.id}`);
  }

  @SubscribeMessage('join-room')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: JoinRoomPayload,
  ) {
    const { helpId, userId } = payload;
    let room = this.rooms.get(helpId);
    if (!room) {
      room = new Set();
      this.rooms.set(helpId, room);
    }
    if (room.size >= 2) {
      client.emit('room-full', { helpId });
      console.log(
        `[BACKEND] Sala cheia (${helpId}), cliente ${client.id} recusado.`,
      );
      return { success: false, message: 'Sala cheia' };
    }
    room.add(client.id);
    this.clientRoom.set(client.id, helpId);
    client.join(helpId);
    client.emit('joined-room', { helpId });
    console.log(
      `[BACKEND] Cliente ${client.id} (userId: ${userId}) entrou na sala ${helpId}. Total na sala: ${room.size}`,
    );
    // Notificar o outro participante que alguém entrou (se já houver)
    if (room.size === 2) {
      client.to(helpId).emit('peer-joined', { helpId });
      console.log(`[BACKEND] peer-joined emitido para sala ${helpId}`);
    }
    return { success: true };
  }

  @SubscribeMessage('offer')
  handleOffer(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: OfferPayload,
  ) {
    const { helpId, sdp } = payload;
    client.to(helpId).emit('offer', { helpId, sdp });
    console.log(`[BACKEND] Offer recebida de ${client.id} para sala ${helpId}`);
  }

  @SubscribeMessage('answer')
  handleAnswer(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: AnswerPayload,
  ) {
    const { helpId, sdp } = payload;
    client.to(helpId).emit('answer', { helpId, sdp });
    console.log(
      `[BACKEND] Answer recebida de ${client.id} para sala ${helpId}`,
    );
  }

  @SubscribeMessage('ice-candidate')
  handleIceCandidate(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: IceCandidatePayload,
  ) {
    const { helpId, candidate } = payload;
    client.to(helpId).emit('ice-candidate', { helpId, candidate });
    console.log(`[BACKEND] ICE candidate de ${client.id} para sala ${helpId}`);
  }

  @SubscribeMessage('leave-room')
  handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { helpId: string },
  ) {
    this.leaveRoom(client, payload.helpId);
    console.log(
      `[BACKEND] Cliente ${client.id} saiu da sala ${payload.helpId}`,
    );
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
    console.log(`[BACKEND] peer-left emitido para sala ${helpId}`);
  }
}
