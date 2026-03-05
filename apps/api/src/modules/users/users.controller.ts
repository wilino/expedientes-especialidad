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
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationDto } from '../../shared/dto/pagination.dto';

@ApiTags('Usuarios')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Crear usuario' })
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar usuarios' })
  findAll(@Query() pagination: PaginationDto) {
    return this.usersService.findAll(pagination.skip, pagination.take);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener usuario por ID' })
  @ApiParam({ name: 'id', type: String })
  findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.findById(id);
  }

  @Get(':id/roles')
  @ApiOperation({ summary: 'Obtener usuario con roles y permisos' })
  @ApiParam({ name: 'id', type: String })
  findByIdWithRoles(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.findByIdWithRoles(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar usuario' })
  @ApiParam({ name: 'id', type: String })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserDto,
  ) {
    return this.usersService.update(id, dto);
  }

  @Patch(':id/toggle-estado')
  @ApiOperation({ summary: 'Activar/desactivar usuario' })
  @ApiParam({ name: 'id', type: String })
  toggleEstado(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.toggleEstado(id);
  }

  @Post(':id/roles/:rolId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Asignar rol a usuario' })
  assignRole(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('rolId', ParseUUIDPipe) rolId: string,
  ) {
    return this.usersService.assignRole(id, rolId);
  }

  @Post(':id/roles/:rolId/remove')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover rol de usuario' })
  removeRole(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('rolId', ParseUUIDPipe) rolId: string,
  ) {
    return this.usersService.removeRole(id, rolId);
  }
}
