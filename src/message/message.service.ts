import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class MessageService {
  constructor(private prisma: PrismaService) {}

  async createMessage(content: string, senderId: string, roomId: string) {
    return this.prisma.message.create({
      data: {
        content,
        senderId,
        roomId,
      },
      include: {
        sender: true,
      },
    });
  }

  async getRoomMessage(roomId: string) {
    return this.prisma.message.findMany({
      where: { roomId },
      include: { sender: true },
      orderBy: { createdAt: 'asc' },
    });
  }
}
