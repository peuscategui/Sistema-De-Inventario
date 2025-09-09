import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [DashboardController],
  providers: [PrismaService],
})
export class DashboardModule {} 