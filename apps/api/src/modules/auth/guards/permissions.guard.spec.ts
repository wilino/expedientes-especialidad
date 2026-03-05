import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { PermissionsGuard } from './permissions.guard';

describe('PermissionsGuard', () => {
  const createContext = (user?: { permissions: string[] }) =>
    ({
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
    }) as never;

  const createGuard = (options: {
    isPublic?: boolean;
    permissions?: string[];
  }) => {
    const reflector = {
      getAllAndOverride: jest.fn((key: string) => {
        if (key === IS_PUBLIC_KEY) return options.isPublic ?? false;
        if (key === PERMISSIONS_KEY) return options.permissions ?? [];
        return undefined;
      }),
    } as unknown as Reflector;

    return new PermissionsGuard(reflector);
  };

  it('allows public routes', () => {
    const guard = createGuard({ isPublic: true, permissions: ['USER_MANAGE'] });
    expect(guard.canActivate(createContext())).toBe(true);
  });

  it('allows authenticated route without permission requirements', () => {
    const guard = createGuard({ permissions: [] });
    expect(
      guard.canActivate(createContext({ permissions: ['EXPEDIENTE_READ'] })),
    ).toBe(true);
  });

  it('throws 401 when route requires permissions and user is missing', () => {
    const guard = createGuard({ permissions: ['USER_MANAGE'] });
    expect(() => guard.canActivate(createContext())).toThrow(
      UnauthorizedException,
    );
  });

  it('throws 403 when user does not have required permissions', () => {
    const guard = createGuard({ permissions: ['RBAC_MANAGE'] });
    expect(() =>
      guard.canActivate(createContext({ permissions: ['EXPEDIENTE_READ'] })),
    ).toThrow(ForbiddenException);
  });

  it('allows when user has all required permissions', () => {
    const guard = createGuard({
      permissions: ['EXPEDIENTE_READ', 'ACTUACION_READ'],
    });

    expect(
      guard.canActivate(
        createContext({
          permissions: ['EXPEDIENTE_READ', 'ACTUACION_READ', 'AUDIT_READ'],
        }),
      ),
    ).toBe(true);
  });
});
