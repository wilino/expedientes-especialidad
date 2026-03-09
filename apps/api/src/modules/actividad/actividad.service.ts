import { Inject, Injectable } from '@nestjs/common';
import {
  ACTIVIDAD_REPOSITORY,
  ActividadRepositoryPort,
} from './actividad.repository.port';

@Injectable()
export class ActividadService {
  constructor(
    @Inject(ACTIVIDAD_REPOSITORY)
    private readonly actividadRepository: ActividadRepositoryPort,
  ) {}

  async findRecent(limit = 10) {
    const safeLimit = Math.min(25, Math.max(1, Math.floor(limit)));
    const data = await this.actividadRepository.findRecent(safeLimit);

    return {
      data: data.map((item) => ({
        ...item,
        timestamp: item.timestamp.toISOString(),
      })),
    };
  }
}
