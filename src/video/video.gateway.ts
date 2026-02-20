import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MediasoupService } from '../mediasoup/mediasoup.service';

@WebSocketGateway({ cors: true })
export class VideoGateway {
  @WebSocketServer()
  server: Server;

  constructor(private mediaService: MediasoupService) {}

  // 1 Join Room
  @SubscribeMessage('join-video-room')
  async joinRoom(@MessageBody() { roomId }, @ConnectedSocket() socket: Socket) {
    socket.join(roomId);

    this.mediaService.createRoom(roomId);
    const room = this.mediaService.getRoom(roomId);

    room.peers.set(socket.id, {
      transports: [],
      producers: [],
      consumers: [],
    });

    return { joined: true };
  }

  // 2 Get Router RTP Capabilities
  @SubscribeMessage('get-rtp-capabilities')
  async getRtpCapabilities() {
    return this.mediaService.router.rtpCapabilities;
  }

  // 3 Create WebRTC Transport
  @SubscribeMessage('create-transport')
  async createTransport(
    @MessageBody() { roomId },
    @ConnectedSocket() socket: Socket,
  ) {
    const transport = await this.mediaService.createWebRtcTransport();

    const room = this.mediaService.getRoom(roomId);
    room.peers.get(socket.id).transports.push(transport);

    return {
      id: transport.id,
      iceParameters: transport.iceParameters,
      iceCandidates: transport.iceCandidates,
      dtlsParameters: transport.dtlsParameters,
    };
  }

  // 4 Connect Transport
  @SubscribeMessage('connect-transport')
  async connectTransport(
    @MessageBody() { roomId, transportId, dtlsParameters },
    @ConnectedSocket() socket: Socket,
  ) {
    const room = this.mediaService.getRoom(roomId);
    const transport = room.peers
      .get(socket.id)
      .transports.find((t) => t.id === transportId);

    await transport.connect({ dtlsParameters });
  }

  // 5 Produce (Send Video)
  @SubscribeMessage('produce')
  async produce(
    @MessageBody() { roomId, transportId, kind, rtpParameters },
    @ConnectedSocket() socket: Socket,
  ) {
    const room = this.mediaService.getRoom(roomId);

    const transport = room.peers
      .get(socket.id)
      .transports.find((t) => t.id === transportId);

    const producer = await transport.produce({
      kind,
      rtpParameters,
    });

    room.peers.get(socket.id).producers.push(producer);

    socket.to(roomId).emit('new-producer', {
      producerId: producer.id,
    });

    return { id: producer.id };
  }

  // 6 Consume (Receive Video)
  @SubscribeMessage('consume')
  async consume(
    @MessageBody() { roomId, producerId, rtpCapabilities },
    @ConnectedSocket() socket: Socket,
  ) {
    const room = this.mediaService.getRoom(roomId);

    const transport = room.peers.get(socket.id).transports[0];

    const consumer = await transport.consume({
      producerId,
      rtpCapabilities,
      paused: false,
    });

    room.peers.get(socket.id).consumers.push(consumer);

    return {
      id: consumer.id,
      producerId,
      kind: consumer.kind,
      rtpParameters: consumer.rtpParameters,
    };
  }

  // 7 Cleanup on Disconnect
  handleDisconnect(socket: Socket) {
    this.mediaService.rooms.forEach((room) => {
      if (room.peers.has(socket.id)) {
        room.peers.delete(socket.id);
      }
    });
  }
}
