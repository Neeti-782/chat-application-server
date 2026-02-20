import {
  Body,
  Controller,
  Param,
  Patch,
  Post,
  Get,
  Delete,
  Req,
  UseGuards,
  Query,
} from '@nestjs/common';
import { RoomService } from './room.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('room')
export class RoomController {
  constructor(private roomService: RoomService) {}

  @Post()
  createRoom(@Body() dto: CreateRoomDto, @Req() req) {
    return this.roomService.createRoom(dto, req.user.id);
  }

  @Patch(':id')
  updateRoom(@Param('id') id: string, @Body() dto: UpdateRoomDto) {
    return this.roomService.updateRoom(dto, id);
  }

  @Post(':id/leave')
  leaveRoom(@Param('id') roomId: string, @Req() req) {
    return this.roomService.leaveRoom(roomId, req.user.id);
  }

  @Get('my-rooms')
  getUserRoom(@Req() req, @Query('search') search?: string) {
    return this.roomService.getUserRoom(req.user.id, search);
  }

  @Get('users')
  getUsers() {
    return this.roomService.getUsers();
  }

  @Post(':roomId/members')
  async addMember(
    @Param('roomId') roomId: string,
    @Body('newUserId') newUserId: string,
    @Req() req,
  ) {
    const userId = req.user.id;

    return this.roomService.addRoomMember(userId, roomId, newUserId);
  }

  @Delete(':roomId/remove-member/:targetUserId')
  async removeMember(
    @Param('roomId') roomId: string,
    @Param('targetUserId') targetUserId: string,
    @Req() req,
  ) {
    const currentUserId = req.user.id;

    return this.roomService.removeMember(roomId, targetUserId, currentUserId);
  }

  @Delete(':roomId/delete-room')
  async deleteRoom(@Param('roomId') roomId: string, @Req() req) {
    return this.roomService.deleteRoom(roomId, req.user.id);
  }
}
