import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ErrorResponseDto } from '../../shared/dto';
import { ApiStandardErrorResponses } from '../../shared/swagger';
import { CurrentUser } from './decorators/current-user.decorator';
import { Public } from './decorators/public.decorator';
import { AuthenticatedUser } from './interfaces/authenticated-user.interface';
import { AuthService } from './auth.service';
import { AuthMeDto, AuthResponseDto, LoginDto, RefreshTokenDto } from './dto';

@ApiTags('Auth')
@ApiStandardErrorResponses()
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @ApiOperation({ summary: 'Iniciar sesión' })
  @ApiOkResponse({
    description: 'Login exitoso',
    type: AuthResponseDto,
  })
  @ApiTooManyRequestsResponse({
    description: 'Demasiados intentos de login',
    type: ErrorResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Credenciales inválidas',
    type: ErrorResponseDto,
  })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Public()
  @Post('refresh')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  @ApiOperation({ summary: 'Refrescar tokens de sesión' })
  @ApiOkResponse({
    description: 'Tokens renovados',
    type: AuthResponseDto,
  })
  @ApiTooManyRequestsResponse({
    description: 'Demasiadas solicitudes de refresh',
    type: ErrorResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Refresh token inválido o expirado',
    type: ErrorResponseDto,
  })
  refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refresh(dto.refreshToken);
  }

  @ApiBearerAuth()
  @Get('me')
  @ApiOperation({ summary: 'Obtener usuario autenticado' })
  @ApiOkResponse({
    description: 'Perfil del usuario autenticado',
    type: AuthMeDto,
  })
  me(@CurrentUser() user: AuthenticatedUser) {
    return this.authService.me(user.id);
  }

  @ApiBearerAuth()
  @Post('logout')
  @ApiOperation({ summary: 'Cerrar sesión actual' })
  @ApiOkResponse({
    description: 'Sesión cerrada',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Sesión cerrada correctamente' },
      },
    },
  })
  logout(@CurrentUser() user: AuthenticatedUser) {
    return this.authService.logout(user.id);
  }
}
