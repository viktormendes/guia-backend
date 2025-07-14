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
    console.log(`[VideoCall] Cliente conectado: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`[VideoCall] Cliente desconectado: ${client.id}`);
    const helpId = this.clientRoom.get(client.id);
    if (helpId) {
      this.leaveRoom(client, helpId);
    }
  }

  @SubscribeMessage('join-room')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: JoinRoomPayload,
  ) {
    const { helpId, userId } = payload;
    console.log(
      `[VideoCall] join-room: client=${client.id}, userId=${userId}, helpId=${helpId}`,
    );
    let room = this.rooms.get(helpId);
    if (!room) {
      room = new Set();
      this.rooms.set(helpId, room);
    }
    if (room.size >= 2) {
      console.warn(`[VideoCall] Sala cheia para helpId=${helpId}`);
      client.emit('room-full', { helpId });
      return { success: false, message: 'Sala cheia' };
    }
    room.add(client.id);
    this.clientRoom.set(client.id, helpId);
    client.join(helpId);
    client.emit('joined-room', { helpId });
    console.log(
      `[VideoCall] Cliente ${client.id} entrou na sala ${helpId}. Total na sala: ${room.size}`,
    );
    if (room.size === 2) {
      console.log(
        `[VideoCall] Notificando peer-joined para helpId=${helpId} (para ambos)`,
      );
      this.server.to(helpId).emit('peer-joined', { helpId });
    }
    return { success: true };
  }

  @SubscribeMessage('offer')
  handleOffer(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: OfferPayload,
  ) {
    const { helpId, sdp } = payload;
    console.log(
      `[VideoCall] offer: client=${client.id}, helpId=${helpId}, sdp=${!!sdp}`,
    );
    client.to(helpId).emit('offer', { helpId, sdp });
  }

  @SubscribeMessage('answer')
  handleAnswer(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: AnswerPayload,
  ) {
    const { helpId, sdp } = payload;
    console.log(
      `[VideoCall] answer: client=${client.id}, helpId=${helpId}, sdp=${!!sdp}`,
    );
    client.to(helpId).emit('answer', { helpId, sdp });
  }

  @SubscribeMessage('ice-candidate')
  handleIceCandidate(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: IceCandidatePayload,
  ) {
    const { helpId, candidate } = payload;
    console.log(
      `[VideoCall] ice-candidate: client=${client.id}, helpId=${helpId}, candidate=${!!candidate}`,
    );
    client.to(helpId).emit('ice-candidate', { helpId, candidate });
  }

  @SubscribeMessage('leave-room')
  handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { helpId: string },
  ) {
    console.log(
      `[VideoCall] leave-room: client=${client.id}, helpId=${payload.helpId}`,
    );
    this.leaveRoom(client, payload.helpId);
  }

  public endCall(helpId: string) {
    console.log(`[VideoCall] call-ended emitido para helpId=${helpId}`);
    this.server.to(helpId).emit('call-ended', { helpId });
  }

  private leaveRoom(client: Socket, helpId: string) {
    const room = this.rooms.get(helpId);
    if (room) {
      room.delete(client.id);
      console.log(
        `[VideoCall] Cliente ${client.id} saiu da sala ${helpId}. Restantes: ${room.size}`,
      );
      if (room.size === 0) {
        this.rooms.delete(helpId);
        console.log(`[VideoCall] Sala ${helpId} removida (vazia)`);
      }
    }
    this.clientRoom.delete(client.id);
    client.leave(helpId);
    client.to(helpId).emit('peer-left', { helpId });
    console.log(`[VideoCall] peer-left emitido para helpId=${helpId}`);
  }
}
