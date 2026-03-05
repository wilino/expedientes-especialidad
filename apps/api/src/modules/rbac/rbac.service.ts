import {
  Injectable,
  NotFoundException,
  ConflictException,
  Inject,
} from '@nestjs/common';
import { CreateRolDto } from './dto/create-rol.dto';
import { SetPermisosDto } from './dto/set-permisos.dto';
import { RBAC_REPOSITORY, RbacRepositoryPort } from './rbac.repository.port';

@Injectable()
export class RbacService {
  constructor(
    @Inject(RBAC_REPOSITORY)
    private readonly rbacRepository: RbacRepositoryPort,
  ) {}

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
