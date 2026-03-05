import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ActuacionesService } from './actuaciones.service';
import { CreateActuacionDto } from './dto/create-actuacion.dto';
import { PaginationDto } from '../../shared/dto/pagination.dto';

@ApiTags('Actuaciones')
@ApiBearerAuth()
@Controller('expedientes/:expedienteId/actuaciones')
export class ActuacionesController {
  constructor(private readonly actuacionesService: ActuacionesService) {}

  @Post()
  @ApiOperation({ summary: 'Registrar actuación en un expediente' })
  @ApiParam({ name: 'expedienteId', type: String })
  create(
    @Param('expedienteId', ParseUUIDPipe) expedienteId: string,
    @Body() dto: CreateActuacionDto,
  ) {
    // TODO: obtener usuarioId del JWT cuando auth esté implementado
    const usuarioId = 'temp-user-id';
    return this.actuacionesService.create(expedienteId, usuarioId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar actuaciones de un expediente' })
  @ApiParam({ name: 'expedienteId', type: String })
  findByExpedienteId(
    @Param('expedienteId', ParseUUIDPipe) expedienteId: string,
    @Query() pagination: PaginationDto,
  ) {
    return this.actuacionesService.findByExpedienteId(
      expedienteId,
      pagination.skip,
      pagination.take,
    );
  }
}
