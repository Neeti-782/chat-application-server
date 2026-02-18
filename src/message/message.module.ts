import { Module } from '@nestjs/common';
import { MessageService } from './message.service';
import { MessageController } from './message.controller';
import { MessageGateway } from './message.gateway';

@Module({
  providers: [MessageService, MessageGateway],
  controllers: [MessageController],
})
export class MessageModule {}
