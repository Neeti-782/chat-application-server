import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { WebsocketModule } from './websocket/websocket.module';
import { RoomModule } from './room/room.module';
import { MessageModule } from './message/message.module';
import { MediasoupModule } from './mediasoup/mediasoup.module';
import { VideoGateway } from './video/video.gateway';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    WebsocketModule,
    RoomModule,
    MessageModule,
    MediasoupModule,
  ],
  controllers: [AppController],
  providers: [AppService, VideoGateway],
})
export class AppModule {}
