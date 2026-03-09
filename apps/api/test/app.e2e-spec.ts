import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import * as bcrypt from 'bcrypt';
import { rm } from 'node:fs/promises';
import path from 'node:path';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma';
import { configureHttpApp } from './../src/config/http-app.config';

describe('API (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

  const E2E_PASSWORD = 'E2ePass@2026';
  const ADMIN_EMAIL = 'e2e-admin@expedientes.local';
  const ASSISTANT_EMAIL = 'e2e-asistente@expedientes.local';
  const ADMIN_ROLE_NAME = 'e2e_admin';
  const ASSISTANT_ROLE_NAME = 'e2e_asistente';
  const STORAGE_PATH = path.join(process.cwd(), 'uploads-e2e');

  let adminToken = '';
  let assistantToken = '';
  const createdExpedienteIds: string[] = [];
  const createdRoleIds: string[] = [];
  const createdUserIds: string[] = [];

  beforeAll(async () => {
    process.env.DOCUMENTS_STORAGE_DRIVER = 'local';
    process.env.DOCUMENTS_STORAGE_PATH = STORAGE_PATH;

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configureHttpApp(app);
    await app.init();

    prisma = app.get(PrismaService);

    await seedE2eUsers();
    adminToken = await login(ADMIN_EMAIL);
    assistantToken = await login(ASSISTANT_EMAIL);
  });

  afterAll(async () => {
    await cleanupE2eUsers();
    await app.close();
  });

  it('/api/health (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/health')
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('status', 'ok');
        expect(res.body).toHaveProperty('timestamp');
      });
  });

  it('/api/users (GET) without token returns 401', () => {
    return request(app.getHttpServer()).get('/api/users').expect(401);
  });

  it('/api/users (GET) with assistant token returns 403', () => {
    return request(app.getHttpServer())
      .get('/api/users')
      .set('Authorization', `Bearer ${assistantToken}`)
      .expect(403);
  });

  it('/api/users (GET) with admin token returns 200', () => {
    return request(app.getHttpServer())
      .get('/api/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
  });

  it('/api/reportes/estados (GET) with assistant token returns 403', () => {
    return request(app.getHttpServer())
      .get('/api/reportes/estados')
      .set('Authorization', `Bearer ${assistantToken}`)
      .expect(403);
  });

  it('/api/reportes/estados (GET) with admin token returns 200', () => {
    return request(app.getHttpServer())
      .get('/api/reportes/estados')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('totalExpedientes');
        expect(res.body).toHaveProperty('porEstado');
      });
  });

  it('/api/dashboard/summary (GET) without token returns 401', () => {
    return request(app.getHttpServer())
      .get('/api/dashboard/summary')
      .expect(401);
  });

  it('/api/dashboard/summary (GET) with assistant token returns 200', () => {
    return request(app.getHttpServer())
      .get('/api/dashboard/summary')
      .set('Authorization', `Bearer ${assistantToken}`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('kpis');
        expect(res.body).toHaveProperty('remindersToday');
        expect(res.body).toHaveProperty('unreadNotifications');
      });
  });

  it('/api/dashboard/gauges (GET) with admin token returns 200', () => {
    return request(app.getHttpServer())
      .get('/api/dashboard/gauges')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200)
      .expect((res) => {
        const body = toRecord(res.body);
        expect(body).toHaveProperty('gauges');
        expect(Array.isArray(body.gauges)).toBe(true);
      });
  });

  it('/api/actividad/reciente (GET) with assistant token returns 403', () => {
    return request(app.getHttpServer())
      .get('/api/actividad/reciente')
      .set('Authorization', `Bearer ${assistantToken}`)
      .expect(403);
  });

  it('/api/actividad/reciente (GET) with admin token returns 200', () => {
    return request(app.getHttpServer())
      .get('/api/actividad/reciente?limit=5')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200)
      .expect((res) => {
        const body = toRecord(res.body);
        expect(body).toHaveProperty('data');
        expect(Array.isArray(body.data)).toBe(true);
      });
  });

  it('/api/notificaciones flow returns 200/201', async () => {
    const adminUser = await prisma.usuario.findUnique({
      where: { correo: ADMIN_EMAIL },
      select: { id: true },
    });

    if (!adminUser) {
      throw new Error('No se encontró usuario admin e2e');
    }

    await prisma.notificacion.create({
      data: {
        usuarioId: adminUser.id,
        tipo: 'ALERTA',
        titulo: 'Alerta e2e',
        mensaje: 'Notificación de prueba',
      },
    });

    const listBeforeRead = await request(app.getHttpServer())
      .get('/api/notificaciones?take=10')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    const payload = toRecord(listBeforeRead.body);
    const data = toObjectArray(payload.data);
    expect(data.length).toBeGreaterThan(0);

    const itemToRead =
      data.find((item) => item.source === 'persisted') ?? data[0];
    const notificationId = asString(itemToRead.id, 'notification id');

    const markReadResponse = await request(app.getHttpServer())
      .post(`/api/notificaciones/${notificationId}/read`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(201);

    expect(markReadResponse.body).toHaveProperty('unreadCount');
  });

  it('/api/recordatorios flow returns 201/200/200', async () => {
    const createResponse = await request(app.getHttpServer())
      .post('/api/recordatorios')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        titulo: 'Recordatorio e2e',
        descripcion: 'Seguimiento de expediente',
        fechaHora: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        prioridad: 'URGENTE',
      })
      .expect(201);

    const created = toRecord(createResponse.body);
    const recordatorioId = asString(created.id, 'recordatorio id');

    await request(app.getHttpServer())
      .get('/api/recordatorios?take=20')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200)
      .expect((res) => {
        const body = toRecord(res.body);
        expect(body).toHaveProperty('data');
        expect(Array.isArray(body.data)).toBe(true);
      });

    await request(app.getHttpServer())
      .patch(`/api/recordatorios/${recordatorioId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ completado: true })
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('completado', true);
      });
  });

  it('/api/recordatorios (POST) with assistant token returns 403', () => {
    return request(app.getHttpServer())
      .post('/api/recordatorios')
      .set('Authorization', `Bearer ${assistantToken}`)
      .send({
        titulo: 'Recordatorio sin permiso',
        fechaHora: new Date().toISOString(),
      })
      .expect(403);
  });

  it('/api/auth login + refresh + me returns 201/201/200', async () => {
    const loginResponse = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        correo: ASSISTANT_EMAIL,
        password: E2E_PASSWORD,
      })
      .expect(201);

    const loginBody = toRecord(loginResponse.body);
    const accessToken = asString(loginBody.accessToken, 'accessToken');
    const refreshToken = asString(loginBody.refreshToken, 'refreshToken');

    await request(app.getHttpServer())
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)
      .expect((res) => {
        const authMe = toRecord(res.body);
        expect(authMe.correo).toBe(ASSISTANT_EMAIL);
        expect(Array.isArray(authMe.roles)).toBe(true);
      });

    const refreshResponse = await request(app.getHttpServer())
      .post('/api/auth/refresh')
      .send({ refreshToken })
      .expect(201);

    const refreshedBody = toRecord(refreshResponse.body);
    const refreshedAccessToken = asString(
      refreshedBody.accessToken,
      'accessToken refreshed',
    );

    await request(app.getHttpServer())
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${refreshedAccessToken}`)
      .expect(200);
  });

  it('/api/rbac + users management flow returns 201/204/200', async () => {
    const roleName = `e2e_revisor_${Date.now()}`;
    const userEmail = `e2e-reviewer-${Date.now()}@expedientes.local`;

    const roleCreateResponse = await request(app.getHttpServer())
      .post('/api/rbac/roles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        nombre: roleName,
        descripcion: 'Rol creado por suite e2e',
      })
      .expect(201);

    const roleBody = toRecord(roleCreateResponse.body);
    const roleId = asString(roleBody.id, 'id de rol');
    createdRoleIds.push(roleId);

    const permisosResponse = await request(app.getHttpServer())
      .get('/api/rbac/permisos')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    const permisos = toObjectArray(permisosResponse.body);
    const permisoExpedienteRead = permisos.find(
      (permiso) => permiso.codigo === 'EXPEDIENTE_READ',
    );

    if (
      !permisoExpedienteRead ||
      typeof permisoExpedienteRead.id !== 'string'
    ) {
      throw new Error('No se encontró permiso EXPEDIENTE_READ en e2e');
    }

    await request(app.getHttpServer())
      .put(`/api/rbac/roles/${roleId}/permisos`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ permisoIds: [permisoExpedienteRead.id] })
      .expect(204);

    await request(app.getHttpServer())
      .get(`/api/rbac/roles/${roleId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200)
      .expect((res) => {
        const role = toRecord(res.body);
        const rolePermisos = toObjectArray(role.permisos);
        expect(rolePermisos.length).toBe(1);
      });

    const userCreateResponse = await request(app.getHttpServer())
      .post('/api/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        nombre: 'E2E Reviewer',
        correo: userEmail,
        password: E2E_PASSWORD,
      })
      .expect(201);

    const userBody = toRecord(userCreateResponse.body);
    const userId = asString(userBody.id, 'id de usuario');
    createdUserIds.push(userId);

    await request(app.getHttpServer())
      .post(`/api/users/${userId}/roles/${roleId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(204);

    await request(app.getHttpServer())
      .get(`/api/users/${userId}/roles`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200)
      .expect((res) => {
        const userWithRoles = toRecord(res.body);
        const roles = toObjectArray(userWithRoles.roles);
        const hasRole = roles.some((role) => {
          const roleInfo =
            typeof role.rol === 'object' && role.rol !== null
              ? toRecord(role.rol)
              : toRecord(role);
          return roleInfo.nombre === roleName;
        });
        expect(hasRole).toBe(true);
      });

    await request(app.getHttpServer())
      .get(`/api/rbac/usuarios/${userId}/permisos`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body).toContain('EXPEDIENTE_READ');
      });

    await request(app.getHttpServer())
      .post(`/api/users/${userId}/roles/${roleId}/remove`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(204);

    await request(app.getHttpServer())
      .patch(`/api/users/${userId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ nombre: 'E2E Reviewer Updated' })
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('nombre', 'E2E Reviewer Updated');
      });

    await request(app.getHttpServer())
      .patch(`/api/users/${userId}/toggle-estado`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('estado', false);
      });
  });

  it('/api/expedientes state + actuaciones + auditoria flow returns 201/200', async () => {
    const codigo = `E2E-FLOW-${Date.now()}`;
    const caratula = 'Expediente flujo e2e de trazabilidad';

    const expedienteResponse = await request(app.getHttpServer())
      .post('/api/expedientes')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ codigo, caratula })
      .expect(201);

    const expedienteBody = toRecord(expedienteResponse.body);
    const expedienteId = asString(expedienteBody.id, 'id de expediente');
    createdExpedienteIds.push(expedienteId);

    await request(app.getHttpServer())
      .patch(`/api/expedientes/${expedienteId}/estado`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ estado: 'EN_TRAMITE' })
      .expect(200);

    await request(app.getHttpServer())
      .post(`/api/expedientes/${expedienteId}/actuaciones`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        tipo: 'NOTA',
        descripcion: 'Actuación e2e de trazabilidad',
        resultado: 'REGISTRADO',
      })
      .expect(201);

    const actuacionesResponse = await request(app.getHttpServer())
      .get(`/api/expedientes/${expedienteId}/actuaciones`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    const actuacionesBody = toRecord(actuacionesResponse.body);
    expect(typeof actuacionesBody.total).toBe('number');
    expect((actuacionesBody.total as number) >= 1).toBe(true);

    await assertAuditEntriesForExpediente(expedienteId, 2);
  });

  it('/api/expedientes update + invalid transition returns 200/400', async () => {
    const expedienteResponse = await request(app.getHttpServer())
      .post('/api/expedientes')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        codigo: `E2E-UPDATE-${Date.now()}`,
        caratula: 'Expediente para update e2e',
      })
      .expect(201);

    const expedienteBody = toRecord(expedienteResponse.body);
    const expedienteId = asString(expedienteBody.id, 'id de expediente');
    createdExpedienteIds.push(expedienteId);

    await request(app.getHttpServer())
      .patch(`/api/expedientes/${expedienteId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ caratula: 'Expediente actualizado e2e' })
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty(
          'caratula',
          'Expediente actualizado e2e',
        );
      });

    await request(app.getHttpServer())
      .patch(`/api/expedientes/${expedienteId}/estado`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ estado: 'ARCHIVADO' })
      .expect(400);
  });

  it('/api/actuaciones (POST) with assistant token returns 403', async () => {
    const expedienteResponse = await request(app.getHttpServer())
      .post('/api/expedientes')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        codigo: `E2E-DENY-ACT-${Date.now()}`,
        caratula: 'Expediente para rechazo de actuación',
      })
      .expect(201);

    const expedienteBody = toRecord(expedienteResponse.body);
    const expedienteId = asString(expedienteBody.id, 'id de expediente');
    createdExpedienteIds.push(expedienteId);

    await request(app.getHttpServer())
      .post(`/api/expedientes/${expedienteId}/actuaciones`)
      .set('Authorization', `Bearer ${assistantToken}`)
      .send({
        tipo: 'NOTA',
        descripcion: 'Intento sin permiso',
      })
      .expect(403);
  });

  it('/api/actuaciones update + delete returns 200/204', async () => {
    const expedienteResponse = await request(app.getHttpServer())
      .post('/api/expedientes')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        codigo: `E2E-ACT-CRUD-${Date.now()}`,
        caratula: 'Expediente para CRUD de actuaciones',
      })
      .expect(201);

    const expedienteBody = toRecord(expedienteResponse.body);
    const expedienteId = asString(expedienteBody.id, 'id de expediente');
    createdExpedienteIds.push(expedienteId);

    const createActuacionResponse = await request(app.getHttpServer())
      .post(`/api/expedientes/${expedienteId}/actuaciones`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        tipo: 'NOTA',
        descripcion: 'Actuación para update/delete',
        resultado: 'PENDIENTE',
      })
      .expect(201);

    const actuacionBody = toRecord(createActuacionResponse.body);
    const actuacionId = asString(actuacionBody.id, 'id de actuación');

    await request(app.getHttpServer())
      .patch(`/api/expedientes/${expedienteId}/actuaciones/${actuacionId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ resultado: 'ACTUALIZADO' })
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('resultado', 'ACTUALIZADO');
      });

    await request(app.getHttpServer())
      .delete(`/api/expedientes/${expedienteId}/actuaciones/${actuacionId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(204);
  });

  it('/api/auth/logout revokes refresh token', async () => {
    const logoutUser = await prisma.usuario.create({
      data: {
        nombre: 'E2E Logout User',
        correo: `e2e-logout-${Date.now()}@expedientes.local`,
        password: await bcrypt.hash(E2E_PASSWORD, 10),
        estado: true,
      },
    });
    createdUserIds.push(logoutUser.id);

    const loginResponse = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        correo: logoutUser.correo,
        password: E2E_PASSWORD,
      })
      .expect(201);

    const loginBody = toRecord(loginResponse.body);
    const accessToken = asString(
      loginBody.accessToken,
      'accessToken de login para logout',
    );
    const refreshToken = asString(
      loginBody.refreshToken,
      'refreshToken de login para logout',
    );

    await request(app.getHttpServer())
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(201);

    await request(app.getHttpServer())
      .post('/api/auth/refresh')
      .send({ refreshToken })
      .expect(401);
  });

  it('/api/documentos upload and download flow returns 201/200', async () => {
    const codigo = `E2E-${Date.now()}`;
    const caratula = 'Expediente de prueba upload-download';
    const contenidoArchivo = 'Contenido e2e para descarga';

    const expedienteResponse = await request(app.getHttpServer())
      .post('/api/expedientes')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ codigo, caratula })
      .expect(201);

    const expedienteBody = toRecord(expedienteResponse.body);
    const expedienteId = asString(expedienteBody.id, 'id de expediente');
    createdExpedienteIds.push(expedienteId);

    const uploadResponse = await request(app.getHttpServer())
      .post(`/api/expedientes/${expedienteId}/documentos`)
      .set('Authorization', `Bearer ${adminToken}`)
      .attach('file', Buffer.from(contenidoArchivo, 'utf8'), {
        filename: 'e2e.txt',
        contentType: 'text/plain',
      })
      .expect(201);

    const uploadBody = toRecord(uploadResponse.body);
    const documentoId = asString(uploadBody.id, 'id de documento');

    await request(app.getHttpServer())
      .get(`/api/expedientes/${expedienteId}/documentos?take=20`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('total');
      });

    await request(app.getHttpServer())
      .get(`/api/expedientes/${expedienteId}/documentos/${documentoId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('id', documentoId);
      });

    const downloadResponse = await request(app.getHttpServer())
      .get(
        `/api/expedientes/${expedienteId}/documentos/${documentoId}/download`,
      )
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(downloadResponse.headers['content-type']).toContain('text/plain');
    expect(downloadResponse.headers['content-disposition']).toContain(
      'e2e.txt',
    );
    expect(downloadResponse.text).toBe(contenidoArchivo);
  });

  it('/api/documentos (POST) with assistant token returns 403', async () => {
    const expedienteResponse = await request(app.getHttpServer())
      .post('/api/expedientes')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        codigo: `E2E-DENY-DOC-${Date.now()}`,
        caratula: 'Expediente para rechazo de documento',
      })
      .expect(201);

    const expedienteBody = toRecord(expedienteResponse.body);
    const expedienteId = asString(expedienteBody.id, 'id de expediente');
    createdExpedienteIds.push(expedienteId);

    await request(app.getHttpServer())
      .post(`/api/expedientes/${expedienteId}/documentos`)
      .set('Authorization', `Bearer ${assistantToken}`)
      .attach('file', Buffer.from('sin permiso', 'utf8'), {
        filename: 'sin-permiso.txt',
        contentType: 'text/plain',
      })
      .expect(403);
  });

  it('/api/reportes/actividad validates ranges and invalid date', async () => {
    await request(app.getHttpServer())
      .get(
        '/api/reportes/actividad?desde=2026-03-01T00:00:00.000Z&hasta=2026-03-05T23:59:59.999Z',
      )
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('totales');
        expect(res.body).toHaveProperty('eventosPorResultado');
      });

    await request(app.getHttpServer())
      .get('/api/reportes/actividad?desde=fecha-invalida')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(400);
  });

  async function login(correo: string): Promise<string> {
    const response = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        correo,
        password: E2E_PASSWORD,
      })
      .expect(201);

    const body = toRecord(response.body);
    const token = body.accessToken;

    if (typeof token !== 'string') {
      throw new Error('Token de acceso no encontrado en respuesta de login');
    }

    return token;
  }

  async function assertAuditEntriesForExpediente(
    expedienteId: string,
    minTotal: number,
  ): Promise<void> {
    for (let attempt = 0; attempt < 10; attempt += 1) {
      const response = await request(app.getHttpServer())
        .get(`/api/auditoria?expedienteId=${expedienteId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const body = toRecord(response.body);
      const total = typeof body.total === 'number' ? body.total : 0;
      if (total >= minTotal) {
        return;
      }

      await new Promise((resolve) => setTimeout(resolve, 80));
    }

    throw new Error(
      `No se alcanzó el mínimo de eventos de auditoría (${minTotal}) para expediente ${expedienteId}`,
    );
  }

  function toRecord(value: unknown): Record<string, unknown> {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return {};
    }
    return value as Record<string, unknown>;
  }

  function toObjectArray(value: unknown): Record<string, unknown>[] {
    if (!Array.isArray(value)) {
      return [];
    }

    return value.filter((item) => item && typeof item === 'object') as Record<
      string,
      unknown
    >[];
  }

  function asString(value: unknown, fieldName: string): string {
    if (typeof value !== 'string' || value.length === 0) {
      throw new Error(`Campo "${fieldName}" inválido en respuesta`);
    }
    return value;
  }

  async function seedE2eUsers(): Promise<void> {
    const hashedPassword = await bcrypt.hash(E2E_PASSWORD, 10);

    const [
      permisoDashboardRead,
      permisoActividadRead,
      permisoNotificacionRead,
      permisoNotificacionUpdate,
      permisoRecordatorioRead,
      permisoRecordatorioCreate,
      permisoRecordatorioUpdate,
      permisoUserManage,
      permisoExpedienteRead,
      permisoExpedienteCreate,
      permisoExpedienteUpdate,
      permisoExpedienteChangeState,
      permisoActuacionCreate,
      permisoActuacionRead,
      permisoActuacionUpdate,
      permisoActuacionDelete,
      permisoDocumentoUpload,
      permisoDocumentoRead,
      permisoDocumentoDownload,
      permisoAuditRead,
      permisoRbacManage,
    ] = await Promise.all([
      prisma.permiso.upsert({
        where: { codigo: 'DASHBOARD_READ' },
        update: { descripcion: 'Ver dashboard operativo' },
        create: {
          codigo: 'DASHBOARD_READ',
          descripcion: 'Ver dashboard operativo',
        },
      }),
      prisma.permiso.upsert({
        where: { codigo: 'ACTIVIDAD_READ' },
        update: { descripcion: 'Consultar actividad reciente' },
        create: {
          codigo: 'ACTIVIDAD_READ',
          descripcion: 'Consultar actividad reciente',
        },
      }),
      prisma.permiso.upsert({
        where: { codigo: 'NOTIFICACION_READ' },
        update: { descripcion: 'Ver notificaciones' },
        create: {
          codigo: 'NOTIFICACION_READ',
          descripcion: 'Ver notificaciones',
        },
      }),
      prisma.permiso.upsert({
        where: { codigo: 'NOTIFICACION_UPDATE' },
        update: { descripcion: 'Marcar notificaciones como leídas' },
        create: {
          codigo: 'NOTIFICACION_UPDATE',
          descripcion: 'Marcar notificaciones como leídas',
        },
      }),
      prisma.permiso.upsert({
        where: { codigo: 'RECORDATORIO_READ' },
        update: { descripcion: 'Ver recordatorios' },
        create: {
          codigo: 'RECORDATORIO_READ',
          descripcion: 'Ver recordatorios',
        },
      }),
      prisma.permiso.upsert({
        where: { codigo: 'RECORDATORIO_CREATE' },
        update: { descripcion: 'Crear recordatorios' },
        create: {
          codigo: 'RECORDATORIO_CREATE',
          descripcion: 'Crear recordatorios',
        },
      }),
      prisma.permiso.upsert({
        where: { codigo: 'RECORDATORIO_UPDATE' },
        update: { descripcion: 'Editar recordatorios' },
        create: {
          codigo: 'RECORDATORIO_UPDATE',
          descripcion: 'Editar recordatorios',
        },
      }),
      prisma.permiso.upsert({
        where: { codigo: 'USER_MANAGE' },
        update: { descripcion: 'Administrar usuarios' },
        create: {
          codigo: 'USER_MANAGE',
          descripcion: 'Administrar usuarios',
        },
      }),
      prisma.permiso.upsert({
        where: { codigo: 'EXPEDIENTE_READ' },
        update: { descripcion: 'Ver expedientes' },
        create: {
          codigo: 'EXPEDIENTE_READ',
          descripcion: 'Ver expedientes',
        },
      }),
      prisma.permiso.upsert({
        where: { codigo: 'EXPEDIENTE_CREATE' },
        update: { descripcion: 'Crear expedientes' },
        create: {
          codigo: 'EXPEDIENTE_CREATE',
          descripcion: 'Crear expedientes',
        },
      }),
      prisma.permiso.upsert({
        where: { codigo: 'EXPEDIENTE_UPDATE' },
        update: { descripcion: 'Actualizar expedientes' },
        create: {
          codigo: 'EXPEDIENTE_UPDATE',
          descripcion: 'Actualizar expedientes',
        },
      }),
      prisma.permiso.upsert({
        where: { codigo: 'EXPEDIENTE_CHANGE_STATE' },
        update: { descripcion: 'Cambiar estado de expedientes' },
        create: {
          codigo: 'EXPEDIENTE_CHANGE_STATE',
          descripcion: 'Cambiar estado de expedientes',
        },
      }),
      prisma.permiso.upsert({
        where: { codigo: 'ACTUACION_CREATE' },
        update: { descripcion: 'Registrar actuaciones' },
        create: {
          codigo: 'ACTUACION_CREATE',
          descripcion: 'Registrar actuaciones',
        },
      }),
      prisma.permiso.upsert({
        where: { codigo: 'ACTUACION_READ' },
        update: { descripcion: 'Consultar actuaciones' },
        create: {
          codigo: 'ACTUACION_READ',
          descripcion: 'Consultar actuaciones',
        },
      }),
      prisma.permiso.upsert({
        where: { codigo: 'ACTUACION_UPDATE' },
        update: { descripcion: 'Actualizar actuaciones' },
        create: {
          codigo: 'ACTUACION_UPDATE',
          descripcion: 'Actualizar actuaciones',
        },
      }),
      prisma.permiso.upsert({
        where: { codigo: 'ACTUACION_DELETE' },
        update: { descripcion: 'Eliminar actuaciones' },
        create: {
          codigo: 'ACTUACION_DELETE',
          descripcion: 'Eliminar actuaciones',
        },
      }),
      prisma.permiso.upsert({
        where: { codigo: 'DOCUMENTO_UPLOAD' },
        update: { descripcion: 'Subir documentos' },
        create: {
          codigo: 'DOCUMENTO_UPLOAD',
          descripcion: 'Subir documentos',
        },
      }),
      prisma.permiso.upsert({
        where: { codigo: 'DOCUMENTO_READ' },
        update: { descripcion: 'Ver documentos' },
        create: {
          codigo: 'DOCUMENTO_READ',
          descripcion: 'Ver documentos',
        },
      }),
      prisma.permiso.upsert({
        where: { codigo: 'DOCUMENTO_DOWNLOAD' },
        update: { descripcion: 'Descargar documentos' },
        create: {
          codigo: 'DOCUMENTO_DOWNLOAD',
          descripcion: 'Descargar documentos',
        },
      }),
      prisma.permiso.upsert({
        where: { codigo: 'AUDIT_READ' },
        update: { descripcion: 'Consultar bitacora de auditoria' },
        create: {
          codigo: 'AUDIT_READ',
          descripcion: 'Consultar bitacora de auditoria',
        },
      }),
      prisma.permiso.upsert({
        where: { codigo: 'RBAC_MANAGE' },
        update: { descripcion: 'Administrar roles y permisos' },
        create: {
          codigo: 'RBAC_MANAGE',
          descripcion: 'Administrar roles y permisos',
        },
      }),
    ]);

    const [adminRole, assistantRole] = await Promise.all([
      prisma.rol.upsert({
        where: { nombre: ADMIN_ROLE_NAME },
        update: {
          descripcion: 'Rol administrativo para pruebas e2e',
        },
        create: {
          nombre: ADMIN_ROLE_NAME,
          descripcion: 'Rol administrativo para pruebas e2e',
        },
      }),
      prisma.rol.upsert({
        where: { nombre: ASSISTANT_ROLE_NAME },
        update: {
          descripcion: 'Rol asistente para pruebas e2e',
        },
        create: {
          nombre: ASSISTANT_ROLE_NAME,
          descripcion: 'Rol asistente para pruebas e2e',
        },
      }),
    ]);

    await prisma.rolPermiso.deleteMany({
      where: { rolId: { in: [adminRole.id, assistantRole.id] } },
    });

    await prisma.rolPermiso.createMany({
      data: [
        { rolId: adminRole.id, permisoId: permisoDashboardRead.id },
        { rolId: adminRole.id, permisoId: permisoActividadRead.id },
        { rolId: adminRole.id, permisoId: permisoNotificacionRead.id },
        { rolId: adminRole.id, permisoId: permisoNotificacionUpdate.id },
        { rolId: adminRole.id, permisoId: permisoRecordatorioRead.id },
        { rolId: adminRole.id, permisoId: permisoRecordatorioCreate.id },
        { rolId: adminRole.id, permisoId: permisoRecordatorioUpdate.id },
        { rolId: adminRole.id, permisoId: permisoUserManage.id },
        { rolId: adminRole.id, permisoId: permisoExpedienteRead.id },
        { rolId: adminRole.id, permisoId: permisoExpedienteCreate.id },
        { rolId: adminRole.id, permisoId: permisoExpedienteUpdate.id },
        { rolId: adminRole.id, permisoId: permisoExpedienteChangeState.id },
        { rolId: adminRole.id, permisoId: permisoActuacionCreate.id },
        { rolId: adminRole.id, permisoId: permisoActuacionRead.id },
        { rolId: adminRole.id, permisoId: permisoActuacionUpdate.id },
        { rolId: adminRole.id, permisoId: permisoActuacionDelete.id },
        { rolId: adminRole.id, permisoId: permisoDocumentoUpload.id },
        { rolId: adminRole.id, permisoId: permisoDocumentoRead.id },
        { rolId: adminRole.id, permisoId: permisoDocumentoDownload.id },
        { rolId: adminRole.id, permisoId: permisoAuditRead.id },
        { rolId: adminRole.id, permisoId: permisoRbacManage.id },
        { rolId: assistantRole.id, permisoId: permisoDashboardRead.id },
        { rolId: assistantRole.id, permisoId: permisoExpedienteRead.id },
      ],
      skipDuplicates: true,
    });

    const [adminUser, assistantUser] = await Promise.all([
      prisma.usuario.upsert({
        where: { correo: ADMIN_EMAIL },
        update: {
          nombre: 'E2E Admin',
          password: hashedPassword,
          estado: true,
        },
        create: {
          nombre: 'E2E Admin',
          correo: ADMIN_EMAIL,
          password: hashedPassword,
          estado: true,
        },
      }),
      prisma.usuario.upsert({
        where: { correo: ASSISTANT_EMAIL },
        update: {
          nombre: 'E2E Asistente',
          password: hashedPassword,
          estado: true,
        },
        create: {
          nombre: 'E2E Asistente',
          correo: ASSISTANT_EMAIL,
          password: hashedPassword,
          estado: true,
        },
      }),
    ]);

    await Promise.all([
      prisma.usuarioRol.upsert({
        where: {
          usuarioId_rolId: {
            usuarioId: adminUser.id,
            rolId: adminRole.id,
          },
        },
        update: {},
        create: {
          usuarioId: adminUser.id,
          rolId: adminRole.id,
        },
      }),
      prisma.usuarioRol.upsert({
        where: {
          usuarioId_rolId: {
            usuarioId: assistantUser.id,
            rolId: assistantRole.id,
          },
        },
        update: {},
        create: {
          usuarioId: assistantUser.id,
          rolId: assistantRole.id,
        },
      }),
    ]);
  }

  async function cleanupE2eUsers(): Promise<void> {
    if (createdExpedienteIds.length > 0) {
      await prisma.auditLog.deleteMany({
        where: { expedienteId: { in: createdExpedienteIds } },
      });
      await prisma.expediente.deleteMany({
        where: { id: { in: createdExpedienteIds } },
      });
    }

    const users = await prisma.usuario.findMany({
      where: { correo: { startsWith: 'e2e-' } },
      select: { id: true },
    });

    const userIds = users.map((user) => user.id);

    if (userIds.length > 0) {
      await prisma.usuarioRol.deleteMany({
        where: { usuarioId: { in: userIds } },
      });
      await prisma.notificacion.deleteMany({
        where: { usuarioId: { in: userIds } },
      });
      await prisma.recordatorio.deleteMany({
        where: { usuarioId: { in: userIds } },
      });
      await prisma.auditLog.deleteMany({
        where: { usuarioId: { in: userIds } },
      });
      await prisma.usuario.deleteMany({
        where: { id: { in: userIds } },
      });
    }

    const roleIds = Array.from(
      new Set([
        ...createdRoleIds,
        ...(await prisma.rol
          .findMany({
            where: { nombre: { startsWith: 'e2e_' } },
            select: { id: true },
          })
          .then((roles) => roles.map((role) => role.id))),
      ]),
    );

    if (roleIds.length > 0) {
      await prisma.rolPermiso.deleteMany({
        where: { rolId: { in: roleIds } },
      });
      await prisma.rol.deleteMany({
        where: { id: { in: roleIds } },
      });
    }

    if (createdUserIds.length > 0) {
      await prisma.usuarioRol.deleteMany({
        where: { usuarioId: { in: createdUserIds } },
      });
      await prisma.notificacion.deleteMany({
        where: { usuarioId: { in: createdUserIds } },
      });
      await prisma.recordatorio.deleteMany({
        where: { usuarioId: { in: createdUserIds } },
      });
      await prisma.auditLog.deleteMany({
        where: { usuarioId: { in: createdUserIds } },
      });
      await prisma.usuario.deleteMany({
        where: { id: { in: createdUserIds } },
      });
    }

    await rm(STORAGE_PATH, { recursive: true, force: true });
  }
});
