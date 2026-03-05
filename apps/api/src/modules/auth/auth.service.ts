import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { StringValue } from 'ms';
import { UsersService } from '../users';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { UserWithRoles } from '../users/users.repository.port';
import { AuthMeDto, AuthResponseDto, AuthTokensDto, LoginDto } from './dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(dto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.usersService.findByCorreoWithRoles(dto.correo);

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (!user.estado) {
      throw new UnauthorizedException('Usuario inactivo');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const tokens = await this.generateTokens(user);
    return {
      ...tokens,
      user: this.toAuthMe(user),
    };
  }

  async refresh(refreshToken: string): Promise<AuthResponseDto> {
    let payload: JwtPayload;
    try {
      payload = await this.jwtService.verifyAsync<JwtPayload>(refreshToken, {
        secret: this.getRefreshSecret(),
      });
    } catch {
      throw new UnauthorizedException('Refresh token inválido o expirado');
    }

    if (payload.type !== 'refresh') {
      throw new UnauthorizedException('Token inválido para refresh');
    }

    const user = await this.usersService.findByIdWithRoles(payload.sub);
    if (!user || !user.estado) {
      throw new UnauthorizedException('Usuario inválido o inactivo');
    }

    const tokenVersion = payload.tokenVersion ?? 0;
    if (tokenVersion !== user.tokenVersion) {
      throw new UnauthorizedException('Refresh token revocado');
    }

    const tokens = await this.generateTokens(user);
    return {
      ...tokens,
      user: this.toAuthMe(user),
    };
  }

  async me(userId: string): Promise<AuthMeDto> {
    const user = await this.usersService.findByIdWithRoles(userId);
    return this.toAuthMe(user);
  }

  async logout(userId: string): Promise<{ message: string }> {
    await this.usersService.invalidateSessions(userId);
    return { message: 'Sesión cerrada correctamente' };
  }

  private toAuthMe(user: UserWithRoles): AuthMeDto {
    const roles = user.roles.map((ur) => ur.rol.nombre);
    const permisos = [
      ...new Set(
        user.roles.flatMap((ur) =>
          ur.rol.permisos.map((rp) => rp.permiso.codigo),
        ),
      ),
    ];

    return {
      id: user.id,
      nombre: user.nombre,
      correo: user.correo,
      estado: user.estado,
      roles,
      permisos,
    };
  }

  private async generateTokens(user: UserWithRoles): Promise<AuthTokensDto> {
    const accessExpiration = this.getAccessExpiration();
    const refreshExpiration = this.getRefreshExpiration();

    const accessPayload: JwtPayload = {
      sub: user.id,
      correo: user.correo,
      type: 'access',
      tokenVersion: user.tokenVersion,
      permissions: this.toAuthMe(user).permisos,
    };

    const refreshPayload: JwtPayload = {
      sub: user.id,
      correo: user.correo,
      type: 'refresh',
      tokenVersion: user.tokenVersion,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(accessPayload, {
        secret: this.getAccessSecret(),
        expiresIn: accessExpiration,
      }),
      this.jwtService.signAsync(refreshPayload, {
        secret: this.getRefreshSecret(),
        expiresIn: refreshExpiration,
      }),
    ]);

    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      accessTokenExpiresIn: String(accessExpiration),
      refreshTokenExpiresIn: String(refreshExpiration),
    };
  }

  private getAccessSecret(): string {
    const secret = this.configService.get<string>('JWT_SECRET');
    if (!secret) {
      throw new InternalServerErrorException('JWT_SECRET no está configurado');
    }
    return secret;
  }

  private getRefreshSecret(): string {
    return (
      this.configService.get<string>('JWT_REFRESH_SECRET') ??
      this.getAccessSecret()
    );
  }

  private getAccessExpiration(): number | StringValue {
    return (
      (this.configService.get<string>('JWT_EXPIRATION') as StringValue) ?? '15m'
    );
  }

  private getRefreshExpiration(): number | StringValue {
    return (
      (this.configService.get<string>(
        'JWT_REFRESH_EXPIRATION',
      ) as StringValue) ?? '7d'
    );
  }
}
