import { Injectable } from '@nestjs/common';
import { UserAdminResponseDto } from './dto';
import { UserListItem, UserWithRoles } from './users.repository.port';

@Injectable()
export class UsersPresenter {
  toAdminUser(item: UserListItem): UserAdminResponseDto {
    return {
      id: item.id,
      nombre: item.nombre,
      correo: item.correo,
      estado: item.estado,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      roles: item.roles.map((roleLink) => ({
        id: roleLink.rol.id,
        nombre: roleLink.rol.nombre,
        descripcion: roleLink.rol.descripcion,
      })),
    };
  }

  toAdminUserWithPermisos(item: UserWithRoles): UserAdminResponseDto {
    const base = this.toAdminUser(item);
    const permisos = [
      ...new Set(
        item.roles.flatMap((roleLink) =>
          roleLink.rol.permisos.map(
            (permissionLink) => permissionLink.permiso.codigo,
          ),
        ),
      ),
    ];

    return {
      ...base,
      permisos,
    };
  }
}
