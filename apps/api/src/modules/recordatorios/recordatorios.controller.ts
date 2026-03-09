import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
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
  CreateRecordatorioDto,
  FindRecordatoriosQueryDto,
  RecordatorioItemDto,
  RecordatoriosListResponseDto,
  UpdateRecordatorioDto,
} from './dto';
import { RecordatoriosService } from './recordatorios.service';

@ApiTags('Recordatorios')
@ApiBearerAuth()
@ApiStandardErrorResponses()
@Controller('recordatorios')
export class RecordatoriosController {
  constructor(private readonly recordatoriosService: RecordatoriosService) {}

  @Get()
  @Permissions(PermissionCodes.RECORDATORIO_READ)
  @ApiOperation({ summary: 'Listar recordatorios del usuario autenticado' })
  @ApiOkResponse({
    description: 'Listado de recordatorios filtrables por rango',
    type: RecordatoriosListResponseDto,
  })
  findByUsuario(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: FindRecordatoriosQueryDto,
  ) {
    return this.recordatoriosService.findByUsuario(user, {
      from: query.from,
      to: query.to,
      take: query.take,
    });
  }

  @Post()
  @Permissions(PermissionCodes.RECORDATORIO_CREATE)
  @ApiOperation({ summary: 'Crear recordatorio para el usuario autenticado' })
  @ApiCreatedResponse({
    description: 'Recordatorio creado correctamente',
    type: RecordatorioItemDto,
  })
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateRecordatorioDto,
  ) {
    return this.recordatoriosService.create(user, dto);
  }

  @Patch(':id')
  @Permissions(PermissionCodes.RECORDATORIO_UPDATE)
  @ApiOperation({ summary: 'Actualizar recordatorio del usuario autenticado' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiOkResponse({
    description: 'Recordatorio actualizado correctamente',
    type: RecordatorioItemDto,
  })
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateRecordatorioDto,
  ) {
    return this.recordatoriosService.update(user, id, dto);
  }
}
