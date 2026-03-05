import {
  Injectable,
  NotFoundException,
  ConflictException,
  Inject,
} from '@nestjs/common';
import { EstadoExpediente } from '@prisma/client';
import { CreateExpedienteDto } from './dto/create-expediente.dto';
import { UpdateExpedienteDto } from './dto/update-expediente.dto';
import { validarTransicion } from './domain/estado-transicion';
import {
  EXPEDIENTES_REPOSITORY,
  ExpedientesRepositoryPort,
  FindExpedientesParams,
} from './expedientes.repository.port';
import { ExpedientesLookupPort } from './expedientes-lookup.port';

@Injectable()
export class ExpedientesService implements ExpedientesLookupPort {
  constructor(
    @Inject(EXPEDIENTES_REPOSITORY)
    private readonly expedientesRepo: ExpedientesRepositoryPort,
  ) {}

  async create(dto: CreateExpedienteDto, creadorId: string) {
    const duplicado = await this.expedientesRepo.findByCodigo(dto.codigo);
    if (duplicado) {
      throw new ConflictException(`El código "${dto.codigo}" ya existe`);
    }

    return this.expedientesRepo.create({
      codigo: dto.codigo,
      caratula: dto.caratula,
      creadorId,
    });
  }

  async findAll(params: FindExpedientesParams) {
    return this.expedientesRepo.findAll(params);
  }

  async findById(id: string) {
    return this.findByIdOrThrow(id);
  }

  async findByIdOrThrow(id: string) {
    const expediente = await this.expedientesRepo.findById(id);
    if (!expediente) {
      throw new NotFoundException(`Expediente con id "${id}" no encontrado`);
    }
    return expediente;
  }

  async update(id: string, dto: UpdateExpedienteDto) {
    await this.findById(id);
    return this.expedientesRepo.update(id, dto);
  }

  async cambiarEstado(id: string, nuevoEstado: EstadoExpediente) {
    const expediente = await this.findById(id);
    validarTransicion(expediente.estado, nuevoEstado);
    return this.expedientesRepo.updateEstado(id, nuevoEstado);
  }
}
