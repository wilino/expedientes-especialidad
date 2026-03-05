import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma';
import { Prisma, Rol, Permiso } from '@prisma/client';
import { RbacRepositoryPort } from './rbac.repository.port';

@Injectable()
export class RbacRepository implements RbacRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  // ── Roles ─────────────────────────────────────────────

  async createRol(data: Prisma.RolCreateInput): Promise<Rol> {
    return this.prisma.rol.create({ data });
  }

  async findRolById(id: string) {
    return this.prisma.rol.findUnique({
      where: { id },
      include: {
        permisos: { include: { permiso: true } },
      },
    });
  }

  async findRolByNombre(nombre: string): Promise<Rol | null> {
    return this.prisma.rol.findUnique({ where: { nombre } });
  }

  async findAllRoles() {
    return this.prisma.rol.findMany({
      include: {
        permisos: { include: { permiso: true } },
        _count: { select: { usuarios: true } },
      },
      orderBy: { nombre: 'asc' },
    });
  }

  // ── Permisos ──────────────────────────────────────────

  async createPermiso(data: Prisma.PermisoCreateInput): Promise<Permiso> {
    return this.prisma.permiso.create({ data });
  }

  async findPermisoByCodigo(codigo: string): Promise<Permiso | null> {
    return this.prisma.permiso.findUnique({ where: { codigo } });
  }

  async findAllPermisos(): Promise<Permiso[]> {
    return this.prisma.permiso.findMany({ orderBy: { codigo: 'asc' } });
  }

  // ── Asignación rol ↔ permiso ──────────────────────────

  async setPermisosToRol(rolId: string, permisoIds: string[]): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.rolPermiso.deleteMany({ where: { rolId } }),
      this.prisma.rolPermiso.createMany({
        data: permisoIds.map((permisoId) => ({ rolId, permisoId })),
      }),
    ]);
  }

  async findPermisosByUsuarioId(usuarioId: string): Promise<string[]> {
    const rows = await this.prisma.rolPermiso.findMany({
      where: {
        rol: {
          usuarios: { some: { usuarioId } },
        },
      },
      select: { permiso: { select: { codigo: true } } },
    });

    const codigos = [...new Set(rows.map((r) => r.permiso.codigo))];
    return codigos;
  }
}
