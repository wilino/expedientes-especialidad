export interface ListUsersParams {
  skip?: number;
  take?: number;
}

export interface CreateUserInput {
  nombre: string;
  correo: string;
  password: string;
}

export interface CreateRoleInput {
  nombre: string;
  descripcion?: string;
}

export interface SetRolePermissionsInput {
  roleId: string;
  permissionIds: string[];
}
