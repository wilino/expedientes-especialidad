import {
  Injectable,
  NotFoundException,
  ConflictException,
  Inject,
} from '@nestjs/common';
import { CreateUserDto, UserAdminResponseDto, UpdateUserDto } from './dto';
import * as bcrypt from 'bcrypt';
import { USERS_REPOSITORY, UsersRepositoryPort } from './users.repository.port';
import { UsersPresenter } from './users.presenter';

const SALT_ROUNDS = 12;

@Injectable()
export class UsersService {
  constructor(
    @Inject(USERS_REPOSITORY)
    private readonly usersRepository: UsersRepositoryPort,
    private readonly usersPresenter: UsersPresenter,
  ) {}

  async create(dto: CreateUserDto): Promise<UserAdminResponseDto> {
    const existing = await this.usersRepository.findByCorreo(dto.correo);
    if (existing) {
      throw new ConflictException('El correo ya está registrado');
    }

    const hashedPassword = await bcrypt.hash(dto.password, SALT_ROUNDS);

    const created = await this.usersRepository.create({
      nombre: dto.nombre,
      correo: dto.correo,
      password: hashedPassword,
    });

    return this.findByIdAdmin(created.id);
  }

  async findAll(skip = 0, take = 20) {
    const [users, total] = await Promise.all([
      this.usersRepository.findAll({ skip, take }),
      this.usersRepository.count(),
    ]);

    return {
      data: users.map((item) => this.usersPresenter.toAdminUser(item)),
      total,
    };
  }

  async findById(id: string) {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`Usuario con id "${id}" no encontrado`);
    }
    return user;
  }

  async findByIdAdmin(id: string): Promise<UserAdminResponseDto> {
    const user = await this.findByIdWithRoles(id);
    return this.usersPresenter.toAdminUserWithPermisos(user);
  }

  async findByIdWithRolesAdmin(id: string): Promise<UserAdminResponseDto> {
    return this.findByIdAdmin(id);
  }

  async findByIdWithRoles(id: string) {
    const user = await this.usersRepository.findByIdWithRoles(id);
    if (!user) {
      throw new NotFoundException(`Usuario con id "${id}" no encontrado`);
    }
    return user;
  }

  async findByIdWithRolesOrNull(id: string) {
    return this.usersRepository.findByIdWithRoles(id);
  }

  async findByCorreoWithRoles(correo: string) {
    return this.usersRepository.findByCorreoWithRoles(correo);
  }

  async update(id: string, dto: UpdateUserDto): Promise<UserAdminResponseDto> {
    await this.findById(id);

    const data: Record<string, unknown> = { ...dto };
    if (dto.password) {
      data.password = await bcrypt.hash(dto.password, SALT_ROUNDS);
    }

    await this.usersRepository.update(id, data);
    return this.findByIdAdmin(id);
  }

  async toggleEstado(id: string): Promise<UserAdminResponseDto> {
    const user = await this.findById(id);
    await this.usersRepository.update(id, { estado: !user.estado });
    return this.findByIdAdmin(id);
  }

  async assignRole(usuarioId: string, rolId: string) {
    await this.findById(usuarioId);
    return this.usersRepository.assignRole(usuarioId, rolId);
  }

  async removeRole(usuarioId: string, rolId: string) {
    return this.usersRepository.removeRole(usuarioId, rolId);
  }

  async invalidateSessions(id: string) {
    await this.findById(id);
    return this.usersRepository.incrementTokenVersion(id);
  }
}
