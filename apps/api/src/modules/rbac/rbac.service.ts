import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { RbacRepository } from './rbac.repository';
import { CreateRolDto } from './dto/create-rol.dto';
import { SetPermisosDto } from './dto/set-permisos.dto';

@Injectable()
export class RbacService {
  constructor(private readonly rbacRepository: RbacRepository) {}

  // ── Roles ─────────────────────────────────────────────

  async createRol(dto: CreateRolDto) {
    const existing = await this.rbacRepository.findRolByNombre(dto.nombre);
    if (existing) {
      throw new ConflictException(`El rol "${dto.nombre}" ya existe`);
    }
    return this.rbacRepository.createRol(dto);
  }

  async findAllRoles() {
    return this.rbacRepository.findAllRoles();
  }

  async findRolById(id: string) {
    const rol = await this.rbacRepository.findRolById(id);
    if (!rol) {
      throw new NotFoundException(`Rol con id "${id}" no encontrado`);
    }
    return rol;
  }

  // ── Permisos ──────────────────────────────────────────

  async findAllPermisos() {
    return this.rbacRepository.findAllPermisos();
  }

  // ── Asignación ────────────────────────────────────────

  async setPermisosToRol(rolId: string, dto: SetPermisosDto) {
    await this.findRolById(rolId);
    await this.rbacRepository.setPermisosToRol(rolId, dto.permisoIds);
  }

  async getPermisosByUsuarioId(usuarioId: string): Promise<string[]> {
    return this.rbacRepository.findPermisosByUsuarioId(usuarioId);
  }
}
