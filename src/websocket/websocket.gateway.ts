import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessageService } from 'src/message/message.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
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

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @MessageBody()
    data: {
      content: string;
      senderId: string;
      roomId: string;
    },
  ) {
    const message = await this.messageService.createMessage(
      data.content,
      data.senderId,
      data.roomId,
    );

    this.server.to(data.roomId).emit('receiveMessage', message);

    return message;
  }
}
