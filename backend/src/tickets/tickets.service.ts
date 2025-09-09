import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateTicketDto } from './dto/create-ticket.dto';

@Injectable()
export class TicketsService {
  constructor(private prisma: PrismaService) {}

  async create(createTicketDto: CreateTicketDto) {
    return this.prisma.tickets.create({
      data: createTicketDto,
    });
  }

  async findAll() {
    return this.prisma.tickets.findMany();
  }

  async findOne(id: number) {
    return this.prisma.tickets.findUnique({
      where: { id },
    });
  }

  async update(id: number, updateTicketDto: Partial<CreateTicketDto>) {
    return this.prisma.tickets.update({
      where: { id },
      data: updateTicketDto,
    });
  }

  async remove(id: number) {
    return this.prisma.tickets.delete({
      where: { id },
    });
  }
}
