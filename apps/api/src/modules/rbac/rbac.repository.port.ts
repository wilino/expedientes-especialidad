import { Prisma, Rol, Permiso } from '@prisma/client';

export const RBAC_REPOSITORY = Symbol('RBAC_REPOSITORY');

export type RolWithPermisos = Prisma.RolGetPayload<{
  include: {
    permisos: {
      include: {
        permiso: true;
      };
    };
  };
}>;

export type RolListItem = Prisma.RolGetPayload<{
  include: {
    permisos: {
      include: {
        permiso: true;
      };
    };
    _count: {
      select: {
        usuarios: true;
      };
    };
  };
}>;

export interface RbacRepositoryPort {
  createRol(data: Prisma.RolCreateInput): Promise<Rol>;
  findRolById(id: string): Promise<RolWithPermisos | null>;
  findRolByNombre(nombre: string): Promise<Rol | null>;
  findAllRoles(): Promise<RolListItem[]>;
  createPermiso(data: Prisma.PermisoCreateInput): Promise<Permiso>;
  findPermisoByCodigo(codigo: string): Promise<Permiso | null>;
  findAllPermisos(): Promise<Permiso[]>;
  setPermisosToRol(rolId: string, permisoIds: string[]): Promise<void>;
  findPermisosByUsuarioId(usuarioId: string): Promise<string[]>;
}
