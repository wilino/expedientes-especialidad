import { Inject, Injectable } from '@nestjs/common';
import {
  REPORTES_REPOSITORY,
  ReporteActividadParams,
  ReportesRepositoryPort,
} from './reportes.repository.port';

@Injectable()
export class ReportesService {
  constructor(
    @Inject(REPORTES_REPOSITORY)
    private readonly reportesRepository: ReportesRepositoryPort,
  ) {}

  async getReporteEstados() {
    return this.reportesRepository.getEstados();
  }

  async getReporteActividad(params: ReporteActividadParams) {
    return this.reportesRepository.getActividad(params);
  }
}
