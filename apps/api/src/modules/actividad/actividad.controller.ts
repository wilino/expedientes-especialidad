import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ApiStandardErrorResponses } from '../../shared/swagger';
import { Permissions } from '../auth';
import { PermissionCodes } from '../rbac/constants/permission-codes.constants';
import { ActividadService } from './actividad.service';
import {
  ActividadRecienteResponseDto,
  FindActividadRecienteQueryDto,
} from './dto';

@ApiTags('Actividad')
@ApiBearerAuth()
@ApiStandardErrorResponses()
@Controller('actividad')
export class ActividadController {
  constructor(private readonly actividadService: ActividadService) {}

  @Get('reciente')
  @Permissions(PermissionCodes.ACTIVIDAD_READ)
  @ApiOperation({ summary: 'Listar actividad reciente para el timeline' })
  @ApiOkResponse({
    description: 'Últimos eventos de actividad registrados en auditoría',
    type: ActividadRecienteResponseDto,
  })
  findRecent(@Query() query: FindActividadRecienteQueryDto) {
    return this.actividadService.findRecent(query.limit ?? 10);
  }
}
