import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { EstadoExpediente } from '@prisma/client';
import { ExpedientesService } from './expedientes.service';
import { CreateExpedienteDto } from './dto/create-expediente.dto';
import { UpdateExpedienteDto } from './dto/update-expediente.dto';
import { CambiarEstadoDto } from './dto/cambiar-estado.dto';
import { PaginationDto } from '../../shared/dto/pagination.dto';

@ApiTags('Expedientes')
@ApiBearerAuth()
@Controller('expedientes')
export class ExpedientesController {
  constructor(private readonly expedientesService: ExpedientesService) {}

  @Post()
  @ApiOperation({ summary: 'Crear expediente' })
  create(@Body() dto: CreateExpedienteDto) {
    // TODO: obtener creadorId del JWT cuando auth esté implementado
    const creadorId = 'temp-user-id';
    return this.expedientesService.create(dto, creadorId);
  }

  @Get()
  @ApiOperation({ summary: 'Listar expedientes con filtros' })
  @ApiQuery({ name: 'estado', enum: EstadoExpediente, required: false })
  @ApiQuery({ name: 'q', required: false, description: 'Búsqueda por código o carátula' })
  @ApiQuery({ name: 'desde', required: false, type: String, description: 'Fecha inicio (ISO)' })
  @ApiQuery({ name: 'hasta', required: false, type: String, description: 'Fecha fin (ISO)' })
  findAll(
    @Query() pagination: PaginationDto,
    @Query('estado') estado?: EstadoExpediente,
    @Query('q') q?: string,
    @Query('desde') desde?: string,
    @Query('hasta') hasta?: string,
  ) {
    return this.expedientesService.findAll({
      skip: pagination.skip,
      take: pagination.take,
      estado,
      q,
      desde: desde ? new Date(desde) : undefined,
      hasta: hasta ? new Date(hasta) : undefined,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener expediente por ID' })
  @ApiParam({ name: 'id', type: String })
  findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.expedientesService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar expediente' })
  @ApiParam({ name: 'id', type: String })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateExpedienteDto,
  ) {
    return this.expedientesService.update(id, dto);
  }

  @Patch(':id/estado')
  @ApiOperation({ summary: 'Cambiar estado del expediente' })
  @ApiParam({ name: 'id', type: String })
  cambiarEstado(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CambiarEstadoDto,
  ) {
    return this.expedientesService.cambiarEstado(id, dto.estado);
  }
}
