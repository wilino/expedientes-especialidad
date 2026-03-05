import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

const SALT_ROUNDS = 12;

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async create(dto: CreateUserDto) {
    const existing = await this.usersRepository.findByCorreo(dto.correo);
    if (existing) {
      throw new ConflictException('El correo ya está registrado');
    }

    const hashedPassword = await bcrypt.hash(dto.password, SALT_ROUNDS);

    return this.usersRepository.create({
      nombre: dto.nombre,
      correo: dto.correo,
      password: hashedPassword,
    });
  }

  async findAll(skip = 0, take = 20) {
    return this.usersRepository.findAll({ skip, take });
  }

  async findById(id: string) {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`Usuario con id "${id}" no encontrado`);
    }
    return user;
  }

  async findByIdWithRoles(id: string) {
    const user = await this.usersRepository.findByIdWithRoles(id);
    if (!user) {
      throw new NotFoundException(`Usuario con id "${id}" no encontrado`);
    }
    return user;
  }

  async findByCorreoWithRoles(correo: string) {
    return this.usersRepository.findByCorreoWithRoles(correo);
  }

  async update(id: string, dto: UpdateUserDto) {
    await this.findById(id);

    const data: Record<string, unknown> = { ...dto };
    if (dto.password) {
      data.password = await bcrypt.hash(dto.password, SALT_ROUNDS);
    }

    return this.usersRepository.update(id, data);
  }

  async toggleEstado(id: string) {
    const user = await this.findById(id);
    return this.usersRepository.update(id, { estado: !user.estado });
  }

  async assignRole(usuarioId: string, rolId: string) {
    await this.findById(usuarioId);
    return this.usersRepository.assignRole(usuarioId, rolId);
  }

  async removeRole(usuarioId: string, rolId: string) {
    return this.usersRepository.removeRole(usuarioId, rolId);
  }
}
