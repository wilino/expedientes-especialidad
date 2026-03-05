import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuditoriaService } from './auditoria.service';
import { PaginationDto } from '../../shared/dto/pagination.dto';

@ApiTags('Auditoría')
@ApiBearerAuth()
@Controller('auditoria')
export class AuditoriaController {
  constructor(private readonly auditoriaService: AuditoriaService) {}

  @Get()
  @ApiOperation({ summary: 'Consultar logs de auditoría' })
  @ApiQuery({ name: 'usuarioId', required: false })
  @ApiQuery({ name: 'expedienteId', required: false })
  @ApiQuery({ name: 'accion', required: false })
  @ApiQuery({ name: 'resultado', required: false, enum: ['EXITO', 'DENEGADO', 'ERROR'] })
  @ApiQuery({ name: 'desde', required: false, type: String, description: 'Fecha inicio (ISO)' })
  @ApiQuery({ name: 'hasta', required: false, type: String, description: 'Fecha fin (ISO)' })
  findAll(
    @Query() pagination: PaginationDto,
    @Query('usuarioId') usuarioId?: string,
    @Query('expedienteId') expedienteId?: string,
    @Query('accion') accion?: string,
    @Query('resultado') resultado?: string,
    @Query('desde') desde?: string,
    @Query('hasta') hasta?: string,
  ) {
    return this.auditoriaService.findAll({
      skip: pagination.skip,
      take: pagination.take,
      usuarioId,
      expedienteId,
      accion,
      resultado,
      desde: desde ? new Date(desde) : undefined,
      hasta: hasta ? new Date(hasta) : undefined,
    });
  }
}
