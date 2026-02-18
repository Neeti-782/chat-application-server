import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class RoomService {
  constructor(private prismaService: PrismaService) {}

  prisma = new PrismaClient().$extends({
    result: {
      user: {
        password: {
          needs: {},
          compute() {
            return undefined;
          },
        },
      },
    },
  });

  async getUserRoom(userId: string) {
    return this.prismaService.room.findMany({
      where: {
        members: {
          some: {
            userId: userId,
          },
        },
      },
      include: {
        members: {
          include: {
            user: true,
          },
        },
      },
    });
  }

  async checkAdmin(roomId: string, userId: string) {
    const member = await this.prismaService.roomMember.findUnique({
      where: {
        userId_roomId: {
          userId,
          roomId,
        },
      },
    });

    if (!member) {
      throw new ForbiddenException('You are not a member of this room');
    }

    if (member.role !== 'ADMIN') {
      throw new ForbiddenException('Only ADMIN can perform this action');
    }

    return member;
  }

  async getUsers() {
    return this.prismaService.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        isOnline: true,
        lastSeen: true,
        createdAt: true,
      },
    });
  }

  async createRoom(data: CreateRoomDto, creatorId: string) {
    const room = await this.prismaService.room.create({
      data: {
        name: data.name,
        isGroup: data.isGroup,
        createdBy: creatorId,
      },
    });

    await this.prismaService.roomMember.create({
      data: {
        roomId: room.id,
        userId: creatorId,
        role: 'ADMIN',
      },
    });

    return room;
  }

  async updateRoom(updateDto: UpdateRoomDto, id: string) {
    return this.prismaService.room.update({
      where: { id },
      data: updateDto,
    });
  }

  async leaveRoom(roomId: string, userId: string) {
    const member = await this.prismaService.roomMember.findUnique({
      where: {
        userId_roomId: {
          userId,
          roomId,
        },
      },
    });

    if (!member) {
      throw new Error('You are not a member of this room');
    }

    await this.prismaService.roomMember.delete({
      where: {
        userId_roomId: {
          userId,
          roomId,
        },
      },
    });

    const remaining = await this.prismaService.roomMember.count({
      where: { userId },
    });

    if (remaining === 0) {
      await this.prismaService.room.delete({
        where: { id: userId },
      });

      return { message: 'Room deleted (no members left)' };
    }

    return { message: 'Left room successfully' };
  }

  async addRoomMember(userId: string, roomId: string, newUserId: string) {
    await this.checkAdmin(roomId, userId);

    return this.prismaService.roomMember.create({
      data: {
        roomId,
        userId: newUserId,
      },
    });
  }

  async removeMember(
    roomId: string,
    targetUserId: string,
    currentUserId: string,
  ) {
    await this.checkAdmin(roomId, currentUserId);

    return this.prismaService.roomMember.delete({
      where: {
        userId_roomId: {
          userId: targetUserId,
          roomId,
        },
      },
    });
  }

  async deleteRoom(roomId: string, currentUserId: string) {
    await this.checkAdmin(roomId, currentUserId);

    return this.prismaService.room.delete({
      where: { id: roomId },
    });
  }
}
