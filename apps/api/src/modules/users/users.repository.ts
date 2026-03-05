import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma';
import { Prisma, Usuario } from '@prisma/client';
import {
  FindUsersParams,
  UserListItem,
  UsersRepositoryPort,
  UserWithRoles,
} from './users.repository.port';

@Injectable()
export class UsersRepository implements UsersRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.UsuarioCreateInput): Promise<Usuario> {
    return this.prisma.usuario.create({ data });
  }

  async findById(id: string): Promise<Usuario | null> {
    return this.prisma.usuario.findUnique({ where: { id } });
  }

  async findByCorreo(correo: string): Promise<Usuario | null> {
    return this.prisma.usuario.findUnique({ where: { correo } });
  }

  async findByIdWithRoles(id: string): Promise<UserWithRoles | null> {
    return this.prisma.usuario.findUnique({
      where: { id },
      include: {
        roles: {
          include: {
            rol: {
              include: {
                permisos: {
                  include: { permiso: true },
                },
              },
            },
          },
        },
      },
    });
  }

  async findByCorreoWithRoles(correo: string): Promise<UserWithRoles | null> {
    return this.prisma.usuario.findUnique({
      where: { correo },
      include: {
        roles: {
          include: {
            rol: {
              include: {
                permisos: {
                  include: { permiso: true },
                },
              },
            },
          },
        },
      },
    });
  }

  async findAll(params?: FindUsersParams): Promise<UserListItem[]> {
    return this.prisma.usuario.findMany({
      ...params,
      include: {
        roles: {
          include: { rol: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(id: string, data: Prisma.UsuarioUpdateInput): Promise<Usuario> {
    return this.prisma.usuario.update({ where: { id }, data });
  }

  async incrementTokenVersion(id: string): Promise<Usuario> {
    const current = await this.prisma.usuario.findUnique({
      where: { id },
      select: { tokenVersion: true },
    });

    return this.prisma.usuario.update({
      where: { id },
      data: { tokenVersion: (current?.tokenVersion ?? 0) + 1 },
    });
  }

  async count(where?: Prisma.UsuarioWhereInput): Promise<number> {
    return this.prisma.usuario.count({ where });
  }

  async assignRole(usuarioId: string, rolId: string): Promise<void> {
    await this.prisma.usuarioRol.upsert({
      where: { usuarioId_rolId: { usuarioId, rolId } },
      create: { usuarioId, rolId },
      update: {},
    });
  }

  async removeRole(usuarioId: string, rolId: string): Promise<void> {
    await this.prisma.usuarioRol.deleteMany({
      where: { usuarioId, rolId },
    });
  }
}
