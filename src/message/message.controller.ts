import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { MessageService } from './message.service';
import { CreateMessageDto } from './dto/createMessage.dto';

@Controller('message')
export class MessageController {
  constructor(private messageServive: MessageService) {}

  @Get(':roomId')
  getRoomMessage(@Param('roomId') roomId: string) {
    return this.messageServive.getRoomMessage(roomId);
  }

  @Post()
  createMessage(@Body() createMessageDto: CreateMessageDto) {
    const { content, senderId, roomId } = createMessageDto;

    return this.messageServive.createMessage(content, senderId, roomId);
  }
}
