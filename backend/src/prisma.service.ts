import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '../generated/prisma';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    super({
      datasources: {
        db: {
          url: 'postgresql://postgres:postgres@192.168.40.129:5432/postgres'
        }
      }
    });
  }

  async onModuleInit() {
    await this.$connect();
  }
} 