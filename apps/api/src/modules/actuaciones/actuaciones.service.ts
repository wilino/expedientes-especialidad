import { Injectable } from '@nestjs/common';
import { ActuacionesRepository } from './actuaciones.repository';
import { ExpedientesService } from '../expedientes';
import { CreateActuacionDto } from './dto/create-actuacion.dto';

@Injectable()
export class ActuacionesService {
  constructor(
    private readonly actuacionesRepo: ActuacionesRepository,
    private readonly expedientesService: ExpedientesService,
  ) {}

  async create(expedienteId: string, usuarioId: string, dto: CreateActuacionDto) {
    // Verifica que el expediente exista (lanza 404 si no)
    await this.expedientesService.findById(expedienteId);

    return this.actuacionesRepo.create({
      expedienteId,
      usuarioId,
      tipo: dto.tipo,
      descripcion: dto.descripcion,
      resultado: dto.resultado,
    });
  }

  async findByExpedienteId(
    expedienteId: string,
    skip?: number,
    take?: number,
  ) {
    await this.expedientesService.findById(expedienteId);
    return this.actuacionesRepo.findByExpedienteId(expedienteId, { skip, take });
  }
}
