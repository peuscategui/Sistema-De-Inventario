import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    // Verificar si el usuario ya existe
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [
          { username: createUserDto.username },
          { email: createUserDto.email }
        ]
      }
    });

    if (existingUser) {
      throw new ConflictException('Usuario o email ya existe');
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    return this.prisma.user.create({
      data: {
        ...createUserDto,
        password: hashedPassword,
      },
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        isActive: true,
        isAdmin: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findAll() {
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        isActive: true,
        isAdmin: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Obtener roles para cada usuario usando raw query
    const usersWithRoles = await Promise.all(
      users.map(async (user) => {
        const userRoles = await this.prisma.$queryRaw<any[]>`
          SELECT r.nombre
          FROM user_roles ur
          JOIN roles r ON ur.role_id = r.id
          WHERE ur.user_id = ${user.id}
        `;

        return {
          ...user,
          roles: userRoles.map((ur: any) => ur.nombre),
        };
      })
    );

    return usersWithRoles;
  }

  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        isActive: true,
        isAdmin: true,
        createdAt: true,
        updatedAt: true,
        userPermissions: {
          include: {
            permission: {
              include: {
                resource: true
              }
            }
          }
        }
      },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const dataToUpdate = { ...updateUserDto };
    
    // Si se proporciona una nueva contraseña, hashearla
    if (updateUserDto.password) {
      dataToUpdate.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    return this.prisma.user.update({
      where: { id },
      data: dataToUpdate,
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        isActive: true,
        isAdmin: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async remove(id: number) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return this.prisma.user.delete({
      where: { id },
      select: {
        id: true,
        username: true,
        email: true,
      },
    });
  }
} 