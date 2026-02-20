import { Injectable, OnModuleInit } from '@nestjs/common';
import * as mediasoup from 'mediasoup';
import { mediaCodecs } from './mediasoup.config';

@Injectable()
export class MediasoupService implements OnModuleInit {
  worker: mediasoup.types.Worker;
  router: mediasoup.types.Router;

  rooms = new Map();

  async onModuleInit() {
    await this.createWorker();
  }

  async createWorker() {
    this.worker = await mediasoup.createWorker({
      rtcMinPort: 40000,
      rtcMaxPort: 49999,
    });

    this.router = await this.worker.createRouter({
      mediaCodecs,
    });

    console.log('Mediasoup Worker Created');
  }

  createRoom(roomId: string) {
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, {
        peers: new Map(),
      });
    }
  }

  getRoom(roomId: string) {
    return this.rooms.get(roomId);
  }

  async createWebRtcTransport() {
    return await this.router.createWebRtcTransport({
      listenIps: [
        {
          ip: '0.0.0.0',
          announcedIp: undefined,
        },
      ],
      enableUdp: true,
      enableTcp: true,
      preferUdp: true,
    });
  }
}
