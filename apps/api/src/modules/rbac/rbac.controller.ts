import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { RbacService } from './rbac.service';
import { CreateRolDto } from './dto/create-rol.dto';
import { SetPermisosDto } from './dto/set-permisos.dto';

@ApiTags('RBAC')
@ApiBearerAuth()
@Controller('rbac')
export class RbacController {
  constructor(private readonly rbacService: RbacService) {}

  @Post('roles')
  @ApiOperation({ summary: 'Crear rol' })
  createRol(@Body() dto: CreateRolDto) {
    return this.rbacService.createRol(dto);
  }

  @Get('roles')
  @ApiOperation({ summary: 'Listar roles con permisos' })
  findAllRoles() {
    return this.rbacService.findAllRoles();
  }

  @Get('roles/:id')
  @ApiOperation({ summary: 'Obtener rol por ID con permisos' })
  @ApiParam({ name: 'id', type: String })
  findRolById(@Param('id', ParseUUIDPipe) id: string) {
    return this.rbacService.findRolById(id);
  }

  @Get('permisos')
  @ApiOperation({ summary: 'Listar todos los permisos' })
  findAllPermisos() {
    return this.rbacService.findAllPermisos();
  }

  @Put('roles/:id/permisos')
  @ApiOperation({ summary: 'Asignar permisos a un rol' })
  @ApiParam({ name: 'id', type: String })
  setPermisosToRol(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: SetPermisosDto,
  ) {
    return this.rbacService.setPermisosToRol(id, dto);
  }

  @Get('usuarios/:id/permisos')
  @ApiOperation({ summary: 'Obtener permisos efectivos de un usuario' })
  @ApiParam({ name: 'id', type: String })
  getPermisosByUsuarioId(@Param('id', ParseUUIDPipe) id: string) {
    return this.rbacService.getPermisosByUsuarioId(id);
  }
}
