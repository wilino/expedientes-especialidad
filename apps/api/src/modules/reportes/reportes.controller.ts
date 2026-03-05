import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ApiStandardErrorResponses } from '../../shared/swagger';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { PermissionCodes } from '../rbac/constants/permission-codes.constants';
import { ReportesService } from './reportes.service';
import {
  ReporteActividadQueryDto,
  ReporteActividadResponseDto,
  ReporteEstadosResponseDto,
} from './dto';

@ApiTags('Reportes')
@ApiBearerAuth()
@ApiStandardErrorResponses()
@Permissions(PermissionCodes.AUDIT_READ)
@Controller('reportes')
export class ReportesController {
  constructor(private readonly reportesService: ReportesService) {}

  @Get('estados')
  @ApiOperation({ summary: 'Reporte de expedientes por estado' })
  @ApiOkResponse({
    description: 'Resumen de expedientes agrupados por estado',
    type: ReporteEstadosResponseDto,
  })
  getEstados() {
    return this.reportesService.getReporteEstados();
  }

  @Get('actividad')
  @ApiOperation({ summary: 'Reporte de actividad operativa y auditoría' })
  @ApiOkResponse({
    description: 'Resumen de actividad por rango de fechas',
    type: ReporteActividadResponseDto,
  })
  getActividad(@Query() query: ReporteActividadQueryDto) {
    const desde = query.desde ? new Date(query.desde) : undefined;
    const hasta = query.hasta ? new Date(query.hasta) : undefined;

    if (desde && Number.isNaN(desde.getTime())) {
      throw new BadRequestException('Parametro "desde" invalido');
    }

    if (hasta && Number.isNaN(hasta.getTime())) {
      throw new BadRequestException('Parametro "hasta" invalido');
    }

    if (desde && hasta && desde > hasta) {
      throw new BadRequestException(
        'El parametro "desde" no puede ser mayor que "hasta"',
      );
    }

    return this.reportesService.getReporteActividad({ desde, hasta });
  }
}
