import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AuthenticatedUser } from '../auth';
import { CreateRecordatorioDto, UpdateRecordatorioDto } from './dto';
import {
  RECORDATORIOS_REPOSITORY,
  RecordatoriosRepositoryPort,
} from './recordatorios.repository.port';

@Injectable()
export class RecordatoriosService {
  constructor(
    @Inject(RECORDATORIOS_REPOSITORY)
    private readonly recordatoriosRepository: RecordatoriosRepositoryPort,
  ) {}

  async findByUsuario(
    user: AuthenticatedUser,
    params: { from?: string; to?: string; take?: number },
  ) {
    const from = params.from ? new Date(params.from) : undefined;
    const to = params.to ? new Date(params.to) : undefined;

    if (from && Number.isNaN(from.getTime())) {
      throw new BadRequestException('Parámetro "from" inválido');
    }

    if (to && Number.isNaN(to.getTime())) {
      throw new BadRequestException('Parámetro "to" inválido');
    }

    if (from && to && from > to) {
      throw new BadRequestException(
        'El parámetro "from" no puede ser mayor a "to"',
      );
    }

    const rows = await this.recordatoriosRepository.findByUsuario({
      usuarioId: user.id,
      from,
      to,
      take: Math.min(100, Math.max(1, params.take ?? 50)),
    });

    return {
      data: rows.map((item) => this.toResponse(item)),
    };
  }

  async create(user: AuthenticatedUser, dto: CreateRecordatorioDto) {
    const fechaHora = new Date(dto.fechaHora);

    if (Number.isNaN(fechaHora.getTime())) {
      throw new BadRequestException('fechaHora inválida');
    }

    const result = await this.recordatoriosRepository.create({
      usuarioId: user.id,
      titulo: dto.titulo.trim(),
      descripcion: dto.descripcion?.trim(),
      fechaHora,
      prioridad: dto.prioridad,
    });

    return this.toResponse(result);
  }

  async update(
    user: AuthenticatedUser,
    id: string,
    dto: UpdateRecordatorioDto,
  ) {
    const fechaHora = dto.fechaHora ? new Date(dto.fechaHora) : undefined;

    if (fechaHora && Number.isNaN(fechaHora.getTime())) {
      throw new BadRequestException('fechaHora inválida');
    }

    const updated = await this.recordatoriosRepository.updateByIdForUsuario(
      id,
      user.id,
      {
        ...(dto.titulo !== undefined && { titulo: dto.titulo.trim() }),
        ...(dto.descripcion !== undefined && {
          descripcion: dto.descripcion.trim(),
        }),
        ...(fechaHora && { fechaHora }),
        ...(dto.prioridad !== undefined && { prioridad: dto.prioridad }),
        ...(dto.completado !== undefined && { completado: dto.completado }),
      },
    );

    if (!updated) {
      throw new NotFoundException(`Recordatorio con id "${id}" no encontrado`);
    }

    return this.toResponse(updated);
  }

  private toResponse(item: {
    id: string;
    titulo: string;
    descripcion: string | null;
    fechaHora: Date;
    prioridad: string;
    completado: boolean;
    recursoTipo: string | null;
    recursoId: string | null;
    createdAt: Date;
    updatedAt: Date;
  }) {
    return {
      id: item.id,
      titulo: item.titulo,
      descripcion: item.descripcion,
      fechaHora: item.fechaHora.toISOString(),
      prioridad: item.prioridad,
      completado: item.completado,
      recursoTipo: item.recursoTipo,
      recursoId: item.recursoId,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    };
  }
}
