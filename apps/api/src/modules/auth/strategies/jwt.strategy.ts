import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../../users';
import { AuthenticatedUser } from '../interfaces/authenticated-user.interface';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    const secret = configService.get<string>('JWT_SECRET');

    if (!secret) {
      throw new Error('JWT_SECRET no está configurado');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
    if (payload.type !== 'access') {
      throw new UnauthorizedException('Token de acceso inválido');
    }

    const user = await this.usersService.findByIdWithRolesOrNull(payload.sub);
    if (!user || !user.estado) {
      throw new UnauthorizedException('Usuario inválido o inactivo');
    }

    const tokenVersion = payload.tokenVersion ?? 0;
    if (tokenVersion !== user.tokenVersion) {
      throw new UnauthorizedException('Token de acceso revocado');
    }

    const permissions = [
      ...new Set(
        user.roles.flatMap((ur) =>
          ur.rol.permisos.map((rp) => rp.permiso.codigo),
        ),
      ),
    ];

    return {
      id: user.id,
      correo: user.correo,
      permissions,
    };
  }
}
