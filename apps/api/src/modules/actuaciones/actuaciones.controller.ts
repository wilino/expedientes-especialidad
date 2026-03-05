import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  Body,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiNoContentResponse,
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ActuacionesService } from './actuaciones.service';
import { CreateActuacionDto } from './dto/create-actuacion.dto';
import { UpdateActuacionDto } from './dto/update-actuacion.dto';
import { PaginationDto } from '../../shared/dto/pagination.dto';
import { ApiStandardErrorResponses } from '../../shared/swagger';
import { ErrorResponseDto } from '../../shared/dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { PermissionCodes } from '../rbac/constants/permission-codes.constants';

@ApiTags('Actuaciones')
@ApiBearerAuth()
@ApiStandardErrorResponses()
@Controller('expedientes/:expedienteId/actuaciones')
export class ActuacionesController {
  constructor(private readonly actuacionesService: ActuacionesService) {}

  @Post()
  @Permissions(PermissionCodes.ACTUACION_CREATE)
  @ApiOperation({ summary: 'Registrar actuación en un expediente' })
  @ApiParam({ name: 'expedienteId', type: String })
  @ApiCreatedResponse({ description: 'Actuación registrada correctamente' })
  @ApiNotFoundResponse({
    description: 'Expediente no encontrado',
    type: ErrorResponseDto,
  })
  create(
    @Param('expedienteId', ParseUUIDPipe) expedienteId: string,
    @Body() dto: CreateActuacionDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.actuacionesService.create(expedienteId, user.id, dto);
  }

  @Get()
  @Permissions(PermissionCodes.ACTUACION_READ)
  @ApiOperation({ summary: 'Listar actuaciones de un expediente' })
  @ApiParam({ name: 'expedienteId', type: String })
  @ApiOkResponse({ description: 'Listado paginado de actuaciones' })
  @ApiNotFoundResponse({
    description: 'Expediente no encontrado',
    type: ErrorResponseDto,
  })
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

  @Patch(':id')
  @Permissions(PermissionCodes.ACTUACION_UPDATE)
  @ApiOperation({ summary: 'Actualizar actuación por ID' })
  @ApiParam({ name: 'expedienteId', type: String })
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({ description: 'Actuación actualizada correctamente' })
  @ApiNotFoundResponse({
    description: 'Actuación o expediente no encontrado',
    type: ErrorResponseDto,
  })
  update(
    @Param('expedienteId', ParseUUIDPipe) expedienteId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateActuacionDto,
  ) {
    return this.actuacionesService.update(expedienteId, id, dto);
  }

  @Delete(':id')
  @Permissions(PermissionCodes.ACTUACION_DELETE)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar actuación por ID' })
  @ApiParam({ name: 'expedienteId', type: String })
  @ApiParam({ name: 'id', type: String })
  @ApiNoContentResponse({ description: 'Actuación eliminada correctamente' })
  @ApiNotFoundResponse({
    description: 'Actuación o expediente no encontrado',
    type: ErrorResponseDto,
  })
  async remove(
    @Param('expedienteId', ParseUUIDPipe) expedienteId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    await this.actuacionesService.remove(expedienteId, id);
  }
}
