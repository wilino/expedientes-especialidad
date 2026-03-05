import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { EXPEDIENTES_LOOKUP, ExpedientesLookupPort } from '../expedientes';
import { CreateActuacionDto } from './dto/create-actuacion.dto';
import { UpdateActuacionDto } from './dto/update-actuacion.dto';
import {
  ACTUACIONES_REPOSITORY,
  ActuacionesRepositoryPort,
} from './actuaciones.repository.port';

@Injectable()
export class ActuacionesService {
  constructor(
    @Inject(ACTUACIONES_REPOSITORY)
    private readonly actuacionesRepo: ActuacionesRepositoryPort,
    @Inject(EXPEDIENTES_LOOKUP)
    private readonly expedientesLookup: ExpedientesLookupPort,
  ) {}

  async create(
    expedienteId: string,
    usuarioId: string,
    dto: CreateActuacionDto,
  ) {
    // Verifica que el expediente exista (lanza 404 si no)
    await this.expedientesLookup.findByIdOrThrow(expedienteId);

    return this.actuacionesRepo.create({
      expedienteId,
      usuarioId,
      tipo: dto.tipo,
      descripcion: dto.descripcion,
      resultado: dto.resultado,
    });
  }

  async findByExpedienteId(expedienteId: string, skip?: number, take?: number) {
    await this.expedientesLookup.findByIdOrThrow(expedienteId);
    return this.actuacionesRepo.findByExpedienteId(expedienteId, {
      skip,
      take,
    });
  }

  async update(expedienteId: string, id: string, dto: UpdateActuacionDto) {
    await this.expedientesLookup.findByIdOrThrow(expedienteId);

    const actuacion = await this.actuacionesRepo.findByIdAndExpediente(
      id,
      expedienteId,
    );
    if (!actuacion) {
      throw new NotFoundException(`Actuación con id "${id}" no encontrada`);
    }

    return this.actuacionesRepo.update(id, {
      tipo: dto.tipo,
      descripcion: dto.descripcion,
      resultado: dto.resultado,
    });
  }

  async remove(expedienteId: string, id: string) {
    await this.expedientesLookup.findByIdOrThrow(expedienteId);

    const actuacion = await this.actuacionesRepo.findByIdAndExpediente(
      id,
      expedienteId,
    );
    if (!actuacion) {
      throw new NotFoundException(`Actuación con id "${id}" no encontrada`);
    }

    await this.actuacionesRepo.remove(id);
  }
}
