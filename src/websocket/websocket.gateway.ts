import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessageService } from 'src/message/message.service';
import { PrismaService } from 'src/prisma/prisma.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class MessageGateway {
  @WebSocketServer()
  server: Server;

  constructor(
    private messageService: MessageService,
    private prisma: PrismaService,
  ) {}

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

  // async handleConnection(socket: Socket) {
  //   const userId = socket.handshake.query.userId as string;

  //   if (!userId) return;

  //   socket.data.userId = userId;

  //   await this.prisma.user.update({
  //     where: { id: userId },
  //     data: { isOnline: true },
  //   });

  //   this.server.emit('userStatusChanged', {
  //     userId,
  //     isOnline: true,
  //   });

  //   console.log('User connected:', userId);
  // }

  // async handleDisconnect(socket: Socket) {
  //   const userId = socket.data.userId as string;

  //   if (!userId) return;

  //   await this.prisma.user.update({
  //     where: { id: userId },
  //     data: {
  //       isOnline: false,
  //       lastSeen: new Date(),
  //     },
  //   });

  //   this.server.emit('userStatusChanged', {
  //     userId,
  //     isOnline: false,
  //   });

  //   console.log('User disconnected:', userId);
  // }
}
