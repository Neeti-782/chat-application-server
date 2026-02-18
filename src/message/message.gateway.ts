import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { MessageService } from './message.service';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: { origin: '*' },
})
export class MessageGateway {
  @WebSocketServer()
  server: Server;

  constructor(private messageService: MessageService) {}
  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @MessageBody() roomId: string,
    @ConnectedSocket() socket: Socket,
  ) {
    socket.join(roomId);
  }

  @SubscribeMessage('sendmessage')
  async handleSendMessage(
    @MessageBody() data: { content: string; senderId: string; roomId: string },
  ) {
    const message = await this.messageService.createMessage(
      data.content,
      data.senderId,
      data.roomId,
    );
    console.log('Received message:', data);

    this.server.to(data.roomId).emit('receiveMessage', message);

    return;
  }
}
