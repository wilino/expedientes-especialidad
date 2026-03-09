import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
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
import { UsersService } from './users.service';
import {
  CreateUserDto,
  UpdateUserDto,
  UserAdminResponseDto,
  UsersListResponseDto,
} from './dto';
import { PaginationDto } from '../../shared/dto/pagination.dto';
import { ApiStandardErrorResponses } from '../../shared/swagger';
import { ErrorResponseDto } from '../../shared/dto';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { PermissionCodes } from '../rbac/constants/permission-codes.constants';

@ApiTags('Usuarios')
@ApiBearerAuth()
@ApiStandardErrorResponses()
@Permissions(PermissionCodes.USER_MANAGE)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Crear usuario' })
  @ApiCreatedResponse({
    description: 'Usuario creado correctamente',
    type: UserAdminResponseDto,
  })
  @ApiConflictResponse({
    description: 'Correo ya registrado',
    type: ErrorResponseDto,
  })
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar usuarios' })
  @ApiOkResponse({
    description: 'Listado paginado de usuarios',
    type: UsersListResponseDto,
  })
  findAll(@Query() pagination: PaginationDto) {
    return this.usersService.findAll(pagination.skip, pagination.take);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener usuario por ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({
    description: 'Usuario encontrado',
    type: UserAdminResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Usuario no encontrado',
    type: ErrorResponseDto,
  })
  findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.findByIdAdmin(id);
  }

  @Get(':id/roles')
  @ApiOperation({ summary: 'Obtener usuario con roles y permisos' })
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({
    description: 'Usuario con roles y permisos',
    type: UserAdminResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Usuario no encontrado',
    type: ErrorResponseDto,
  })
  findByIdWithRoles(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.findByIdWithRolesAdmin(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar usuario' })
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({
    description: 'Usuario actualizado',
    type: UserAdminResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Usuario no encontrado',
    type: ErrorResponseDto,
  })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto);
  }

  @Patch(':id/toggle-estado')
  @ApiOperation({ summary: 'Activar/desactivar usuario' })
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({
    description: 'Estado actualizado',
    type: UserAdminResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Usuario no encontrado',
    type: ErrorResponseDto,
  })
  toggleEstado(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.toggleEstado(id);
  }

  @Post(':id/roles/:rolId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Asignar rol a usuario' })
  @ApiParam({ name: 'id', type: String })
  @ApiParam({ name: 'rolId', type: String })
  @ApiNoContentResponse({ description: 'Rol asignado al usuario' })
  assignRole(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('rolId', ParseUUIDPipe) rolId: string,
  ) {
    return this.usersService.assignRole(id, rolId);
  }

  @Post(':id/roles/:rolId/remove')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover rol de usuario' })
  @ApiParam({ name: 'id', type: String })
  @ApiParam({ name: 'rolId', type: String })
  @ApiNoContentResponse({ description: 'Rol removido del usuario' })
  removeRole(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('rolId', ParseUUIDPipe) rolId: string,
  ) {
    return this.usersService.removeRole(id, rolId);
  }
}
