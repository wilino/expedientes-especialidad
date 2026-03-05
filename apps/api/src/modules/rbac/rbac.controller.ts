import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { RbacService } from './rbac.service';
import { CreateRolDto } from './dto/create-rol.dto';
import { SetPermisosDto } from './dto/set-permisos.dto';
import { ApiStandardErrorResponses } from '../../shared/swagger';
import { ErrorResponseDto } from '../../shared/dto';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { PermissionCodes } from './constants/permission-codes.constants';

@ApiTags('RBAC')
@ApiBearerAuth()
@ApiStandardErrorResponses()
@Permissions(PermissionCodes.RBAC_MANAGE)
@Controller('rbac')
export class RbacController {
  constructor(private readonly rbacService: RbacService) {}

  @Post('roles')
  @ApiOperation({ summary: 'Crear rol' })
  @ApiCreatedResponse({ description: 'Rol creado correctamente' })
  @ApiConflictResponse({
    description: 'El rol ya existe',
    type: ErrorResponseDto,
  })
  createRol(@Body() dto: CreateRolDto) {
    return this.rbacService.createRol(dto);
  }

  @Get('roles')
  @ApiOperation({ summary: 'Listar roles con permisos' })
  @ApiOkResponse({ description: 'Listado de roles con permisos' })
  findAllRoles() {
    return this.rbacService.findAllRoles();
  }

  @Get('roles/:id')
  @ApiOperation({ summary: 'Obtener rol por ID con permisos' })
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({ description: 'Rol encontrado' })
  @ApiNotFoundResponse({
    description: 'Rol no encontrado',
    type: ErrorResponseDto,
  })
  findRolById(@Param('id', ParseUUIDPipe) id: string) {
    return this.rbacService.findRolById(id);
  }

  @Get('permisos')
  @ApiOperation({ summary: 'Listar todos los permisos' })
  @ApiOkResponse({ description: 'Listado de permisos' })
  findAllPermisos() {
    return this.rbacService.findAllPermisos();
  }

  @Put('roles/:id/permisos')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Asignar permisos a un rol' })
  @ApiParam({ name: 'id', type: String })
  @ApiNoContentResponse({ description: 'Permisos asignados al rol' })
  @ApiNotFoundResponse({
    description: 'Rol no encontrado',
    type: ErrorResponseDto,
  })
  setPermisosToRol(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: SetPermisosDto,
  ) {
    return this.rbacService.setPermisosToRol(id, dto);
  }

  @Get('usuarios/:id/permisos')
  @ApiOperation({ summary: 'Obtener permisos efectivos de un usuario' })
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({ description: 'Permisos efectivos del usuario' })
  getPermisosByUsuarioId(@Param('id', ParseUUIDPipe) id: string) {
    return this.rbacService.getPermisosByUsuarioId(id);
  }
}
