import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuditoriaService } from './auditoria.service';
import { ApiStandardErrorResponses } from '../../shared/swagger';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { PermissionCodes } from '../rbac/constants/permission-codes.constants';
import { FindAuditoriaQueryDto } from './dto';

@ApiTags('Auditoría')
@ApiBearerAuth()
@ApiStandardErrorResponses()
@Permissions(PermissionCodes.AUDIT_READ)
@Controller('auditoria')
export class AuditoriaController {
  constructor(private readonly auditoriaService: AuditoriaService) {}

  @Get()
  @ApiOperation({ summary: 'Consultar logs de auditoría' })
  @ApiOkResponse({ description: 'Listado paginado de eventos de auditoría' })
  findAll(@Query() query: FindAuditoriaQueryDto) {
    return this.auditoriaService.findAll({
      skip: query.skip,
      take: query.take,
      usuarioId: query.usuarioId,
      expedienteId: query.expedienteId,
      accion: query.accion,
      resultado: query.resultado,
      desde: query.desde ? new Date(query.desde) : undefined,
      hasta: query.hasta ? new Date(query.hasta) : undefined,
    });
  }
}
