import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { ApiStandardErrorResponses } from '../../shared/swagger';
import { CurrentUser, Permissions } from '../auth';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { PermissionCodes } from '../rbac/constants/permission-codes.constants';
import {
  FindNotificacionesQueryDto,
  NotificacionReadResponseDto,
  NotificacionesListResponseDto,
} from './dto';
import { NotificacionesService } from './notificaciones.service';

@ApiTags('Notificaciones')
@ApiBearerAuth()
@ApiStandardErrorResponses()
@Controller('notificaciones')
export class NotificacionesController {
  constructor(private readonly notificacionesService: NotificacionesService) {}

  @Get()
  @Permissions(PermissionCodes.NOTIFICACION_READ)
  @ApiOperation({ summary: 'Listar notificaciones del usuario autenticado' })
  @ApiOkResponse({
    description: 'Listado de notificaciones (persistidas o fallback)',
    type: NotificacionesListResponseDto,
  })
  findByUsuario(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: FindNotificacionesQueryDto,
  ) {
    return this.notificacionesService.findByUsuario(user, query.take ?? 20);
  }

  @Post(':id/read')
  @Permissions(PermissionCodes.NOTIFICACION_UPDATE)
  @ApiOperation({ summary: 'Marcar notificación como leída' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiOkResponse({
    description: 'Cantidad de notificaciones no leídas actualizada',
    type: NotificacionReadResponseDto,
  })
  markAsRead(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.notificacionesService.markAsRead(user, id);
  }
}
