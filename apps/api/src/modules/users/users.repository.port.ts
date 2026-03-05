import { Prisma, Usuario } from '@prisma/client';

export const USERS_REPOSITORY = Symbol('USERS_REPOSITORY');

export interface FindUsersParams {
  skip?: number;
  take?: number;
  where?: Prisma.UsuarioWhereInput;
}

export type UserWithRoles = Prisma.UsuarioGetPayload<{
  include: {
    roles: {
      include: {
        rol: {
          include: {
            permisos: {
              include: {
                permiso: true;
              };
            };
          };
        };
      };
    };
  };
}>;

export type UserListItem = Prisma.UsuarioGetPayload<{
  include: {
    roles: {
      include: {
        rol: true;
      };
    };
  };
}>;

export interface UsersRepositoryPort {
  create(data: Prisma.UsuarioCreateInput): Promise<Usuario>;
  findById(id: string): Promise<Usuario | null>;
  findByCorreo(correo: string): Promise<Usuario | null>;
  findByIdWithRoles(id: string): Promise<UserWithRoles | null>;
  findByCorreoWithRoles(correo: string): Promise<UserWithRoles | null>;
  findAll(params?: FindUsersParams): Promise<UserListItem[]>;
  update(id: string, data: Prisma.UsuarioUpdateInput): Promise<Usuario>;
  incrementTokenVersion(id: string): Promise<Usuario>;
  count(where?: Prisma.UsuarioWhereInput): Promise<number>;
  assignRole(usuarioId: string, rolId: string): Promise<void>;
  removeRole(usuarioId: string, rolId: string): Promise<void>;
}
