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
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ExpedientesService } from './expedientes.service';
import { CreateExpedienteDto } from './dto/create-expediente.dto';
import { UpdateExpedienteDto } from './dto/update-expediente.dto';
import { CambiarEstadoDto } from './dto/cambiar-estado.dto';
import { FindExpedientesQueryDto } from './dto/find-expedientes-query.dto';
import { ApiStandardErrorResponses } from '../../shared/swagger';
import { ErrorResponseDto } from '../../shared/dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { PermissionCodes } from '../rbac/constants/permission-codes.constants';

@ApiTags('Expedientes')
@ApiBearerAuth()
@ApiStandardErrorResponses()
@Controller('expedientes')
export class ExpedientesController {
  constructor(private readonly expedientesService: ExpedientesService) {}

  @Post()
  @Permissions(PermissionCodes.EXPEDIENTE_CREATE)
  @ApiOperation({ summary: 'Crear expediente' })
  @ApiCreatedResponse({ description: 'Expediente creado correctamente' })
  @ApiConflictResponse({
    description: 'Código de expediente duplicado',
    type: ErrorResponseDto,
  })
  create(
    @Body() dto: CreateExpedienteDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.expedientesService.create(dto, user.id);
  }

  @Get()
  @Permissions(PermissionCodes.EXPEDIENTE_READ)
  @ApiOperation({ summary: 'Listar expedientes con filtros' })
  @ApiOkResponse({ description: 'Listado paginado de expedientes' })
  findAll(@Query() query: FindExpedientesQueryDto) {
    return this.expedientesService.findAll({
      skip: query.skip,
      take: query.take,
      estado: query.estado,
      q: query.q,
      desde: query.desde ? new Date(query.desde) : undefined,
      hasta: query.hasta ? new Date(query.hasta) : undefined,
    });
  }

  @Get(':id')
  @Permissions(PermissionCodes.EXPEDIENTE_READ)
  @ApiOperation({ summary: 'Obtener expediente por ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({ description: 'Expediente encontrado' })
  @ApiNotFoundResponse({
    description: 'Expediente no encontrado',
    type: ErrorResponseDto,
  })
  findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.expedientesService.findById(id);
  }

  @Patch(':id')
  @Permissions(PermissionCodes.EXPEDIENTE_UPDATE)
  @ApiOperation({ summary: 'Actualizar expediente' })
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({ description: 'Expediente actualizado' })
  @ApiNotFoundResponse({
    description: 'Expediente no encontrado',
    type: ErrorResponseDto,
  })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateExpedienteDto,
  ) {
    return this.expedientesService.update(id, dto);
  }

  @Patch(':id/estado')
  @Permissions(PermissionCodes.EXPEDIENTE_CHANGE_STATE)
  @ApiOperation({ summary: 'Cambiar estado del expediente' })
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({ description: 'Estado actualizado correctamente' })
  @ApiNotFoundResponse({
    description: 'Expediente no encontrado',
    type: ErrorResponseDto,
  })
  cambiarEstado(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CambiarEstadoDto,
  ) {
    return this.expedientesService.cambiarEstado(id, dto.estado);
  }
}
