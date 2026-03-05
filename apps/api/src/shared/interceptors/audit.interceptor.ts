import {
  CallHandler,
  ExecutionContext,
  HttpException,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Request } from 'express';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { AuditoriaService, AuditEntry } from '../../modules/auditoria';
import { AuthenticatedUser } from '../../modules/auth';

interface AuditRequest extends Request {
  user?: AuthenticatedUser;
}

type AuditEntryBase = Omit<AuditEntry, 'resultado'>;

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly auditoriaService: AuditoriaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest<AuditRequest>();
    const userId = request.user?.id;

    if (!userId) {
      return next.handle();
    }

    const baseEntry = this.buildBaseEntry(request, userId);

    return next.handle().pipe(
      tap(() => {
        this.registrar({
          ...baseEntry,
          resultado: 'EXITO',
        });
      }),
      catchError((error: unknown) => {
        this.registrar({
          ...baseEntry,
          resultado: this.isDenied(error) ? 'DENEGADO' : 'ERROR',
        });
        return throwError(() => error);
      }),
    );
  }

  private buildBaseEntry(
    request: AuditRequest,
    usuarioId: string,
  ): AuditEntryBase {
    const routePath = this.resolveRoutePath(request);
    const normalizedPath = routePath.startsWith('/')
      ? routePath
      : `/${routePath}`;

    return {
      usuarioId,
      expedienteId: this.extractExpedienteId(request, normalizedPath),
      accion: `${request.method.toUpperCase()} ${normalizedPath}`,
      recurso: this.extractResource(normalizedPath),
      ip: request.ip,
      payload: this.buildPayload(request),
    };
  }

  private resolveRoutePath(request: AuditRequest): string {
    const route = request.route as { path?: unknown } | undefined;
    if (typeof route?.path === 'string') {
      return route.path;
    }
    return request.path;
  }

  private extractExpedienteId(
    request: AuditRequest,
    normalizedPath: string,
  ): string | undefined {
    const expedienteId = request.params?.expedienteId;
    if (typeof expedienteId === 'string') {
      return expedienteId;
    }

    if (
      normalizedPath.startsWith('/expedientes/:id') &&
      typeof request.params?.id === 'string'
    ) {
      return request.params.id;
    }

    return undefined;
  }

  private extractResource(path: string): string {
    const [resource] = path.replace(/^\/+/, '').split('/');
    return resource || 'unknown';
  }

  private buildPayload(request: AuditRequest): Prisma.InputJsonObject {
    return {
      params: this.sanitizeRecord(this.toRecord(request.params)),
      query: this.sanitizeRecord(this.toRecord(request.query)),
      body: this.sanitizeRecord(this.toRecord(request.body)),
    };
  }

  private sanitizeRecord(
    input: Record<string, unknown>,
  ): Prisma.InputJsonObject {
    const hiddenKeys = new Set([
      'password',
      'refreshToken',
      'accessToken',
      'token',
      'file',
    ]);

    return Object.fromEntries(
      Object.entries(input).map(([key, value]) => {
        const safeValue = hiddenKeys.has(key)
          ? '[REDACTED]'
          : Buffer.isBuffer(value)
            ? '[BINARY]'
            : value;

        return [key, this.toJsonValue(safeValue)];
      }),
    ) as Prisma.InputJsonObject;
  }

  private toRecord(value: unknown): Record<string, unknown> {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return {};
    }
    return value as Record<string, unknown>;
  }

  private toJsonValue(value: unknown): Prisma.InputJsonValue | null {
    if (
      value === null ||
      typeof value === 'string' ||
      typeof value === 'number' ||
      typeof value === 'boolean'
    ) {
      return value;
    }

    if (value instanceof Date) {
      return value.toISOString();
    }

    if (Array.isArray(value)) {
      return value.map((item) => this.toJsonValue(item));
    }

    if (value && typeof value === 'object') {
      return this.sanitizeRecord(this.toRecord(value));
    }

    if (typeof value === 'undefined') {
      return null;
    }

    return '[UNSUPPORTED]';
  }

  private isDenied(error: unknown): boolean {
    if (!(error instanceof HttpException)) {
      return false;
    }

    const status = error.getStatus();
    return status === 401 || status === 403;
  }

  private registrar(entry: AuditEntry): void {
    void this.auditoriaService.registrar(entry).catch(() => undefined);
  }
}
