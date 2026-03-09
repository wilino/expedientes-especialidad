import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { createPrismaAdapterFromDatabaseUrl } from '../src/prisma/prisma-adapter.factory';

const prisma = new PrismaClient({
  adapter: createPrismaAdapterFromDatabaseUrl(),
});

// ── Catálogo de permisos (Apéndice A del plan) ──────────

const PERMISOS = [
  { codigo: 'DASHBOARD_READ', descripcion: 'Ver dashboard operativo' },
  { codigo: 'ACTIVIDAD_READ', descripcion: 'Consultar actividad reciente' },
  { codigo: 'NOTIFICACION_READ', descripcion: 'Ver notificaciones' },
  {
    codigo: 'NOTIFICACION_UPDATE',
    descripcion: 'Marcar notificaciones como leídas',
  },
  { codigo: 'RECORDATORIO_READ', descripcion: 'Ver recordatorios' },
  { codigo: 'RECORDATORIO_CREATE', descripcion: 'Crear recordatorios' },
  { codigo: 'RECORDATORIO_UPDATE', descripcion: 'Editar recordatorios' },
  { codigo: 'EXPEDIENTE_READ', descripcion: 'Ver expedientes' },
  { codigo: 'EXPEDIENTE_CREATE', descripcion: 'Crear expedientes' },
  { codigo: 'EXPEDIENTE_UPDATE', descripcion: 'Editar expedientes' },
  { codigo: 'EXPEDIENTE_DELETE', descripcion: 'Eliminar expedientes' },
  { codigo: 'EXPEDIENTE_CHANGE_STATE', descripcion: 'Cambiar estado de expedientes' },
  { codigo: 'ACTUACION_CREATE', descripcion: 'Registrar actuaciones' },
  { codigo: 'ACTUACION_READ', descripcion: 'Ver actuaciones' },
  { codigo: 'ACTUACION_UPDATE', descripcion: 'Editar actuaciones' },
  { codigo: 'ACTUACION_DELETE', descripcion: 'Eliminar actuaciones' },
  { codigo: 'DOCUMENTO_UPLOAD', descripcion: 'Subir documentos' },
  { codigo: 'DOCUMENTO_READ', descripcion: 'Ver documentos' },
  { codigo: 'DOCUMENTO_DOWNLOAD', descripcion: 'Descargar documentos' },
  { codigo: 'AUDIT_READ', descripcion: 'Consultar bitácora de auditoría' },
  { codigo: 'RBAC_MANAGE', descripcion: 'Administrar roles y permisos' },
  { codigo: 'USER_MANAGE', descripcion: 'Administrar usuarios' },
] as const;

// ── Roles por defecto con sus permisos asignados ────────

const ROLES: { nombre: string; descripcion: string; permisos: string[] }[] = [
  {
    nombre: 'admin',
    descripcion: 'Administrador del sistema — acceso total',
    permisos: PERMISOS.map((p) => p.codigo),
  },
  {
    nombre: 'abogado',
    descripcion: 'Abogado — gestiona expedientes y actuaciones',
    permisos: [
      'DASHBOARD_READ',
      'ACTIVIDAD_READ',
      'NOTIFICACION_READ',
      'NOTIFICACION_UPDATE',
      'RECORDATORIO_READ',
      'RECORDATORIO_CREATE',
      'RECORDATORIO_UPDATE',
      'EXPEDIENTE_READ',
      'EXPEDIENTE_CREATE',
      'EXPEDIENTE_UPDATE',
      'EXPEDIENTE_CHANGE_STATE',
      'ACTUACION_CREATE',
      'ACTUACION_READ',
      'ACTUACION_UPDATE',
      'ACTUACION_DELETE',
      'DOCUMENTO_UPLOAD',
      'DOCUMENTO_READ',
      'DOCUMENTO_DOWNLOAD',
      'AUDIT_READ',
    ],
  },
  {
    nombre: 'asistente',
    descripcion: 'Asistente — lectura y registro de actuaciones',
    permisos: [
      'DASHBOARD_READ',
      'ACTIVIDAD_READ',
      'NOTIFICACION_READ',
      'NOTIFICACION_UPDATE',
      'RECORDATORIO_READ',
      'RECORDATORIO_CREATE',
      'RECORDATORIO_UPDATE',
      'EXPEDIENTE_READ',
      'ACTUACION_CREATE',
      'ACTUACION_READ',
      'DOCUMENTO_READ',
      'DOCUMENTO_DOWNLOAD',
    ],
  },
];

// ── Usuario administrador por defecto ───────────────────

const ADMIN_USER = {
  nombre: 'Administrador',
  correo: 'admin@expedientes.local',
  password: 'Admin@2026',
};

// ── Ejecución del seed ──────────────────────────────────

async function main() {
  console.log('🌱  Iniciando seed…');

  // 1. Crear permisos (upsert para idempotencia)
  const permisoMap = new Map<string, string>();

  for (const p of PERMISOS) {
    const permiso = await prisma.permiso.upsert({
      where: { codigo: p.codigo },
      update: { descripcion: p.descripcion },
      create: p,
    });
    permisoMap.set(permiso.codigo, permiso.id);
  }

  console.log(`   ✔ ${PERMISOS.length} permisos creados/actualizados`);

  // 2. Crear roles y asignar permisos
  for (const r of ROLES) {
    const rol = await prisma.rol.upsert({
      where: { nombre: r.nombre },
      update: { descripcion: r.descripcion },
      create: { nombre: r.nombre, descripcion: r.descripcion },
    });

    // Limpiar asignaciones previas y recrear
    await prisma.rolPermiso.deleteMany({ where: { rolId: rol.id } });
    await prisma.rolPermiso.createMany({
      data: r.permisos.map((codigo) => ({
        rolId: rol.id,
        permisoId: permisoMap.get(codigo)!,
      })),
    });

    console.log(`   ✔ Rol "${r.nombre}" → ${r.permisos.length} permisos`);
  }

  // 3. Crear usuario admin si no existe
  const existing = await prisma.usuario.findUnique({
    where: { correo: ADMIN_USER.correo },
  });

  if (!existing) {
    const hashedPassword = await bcrypt.hash(ADMIN_USER.password, 12);
    const adminRol = await prisma.rol.findUnique({ where: { nombre: 'admin' } });

    const user = await prisma.usuario.create({
      data: {
        nombre: ADMIN_USER.nombre,
        correo: ADMIN_USER.correo,
        password: hashedPassword,
      },
    });

    if (adminRol) {
      await prisma.usuarioRol.create({
        data: { usuarioId: user.id, rolId: adminRol.id },
      });
    }

    console.log(`   ✔ Usuario admin creado: ${ADMIN_USER.correo}`);
  } else {
    console.log(`   ℹ Usuario admin ya existe: ${ADMIN_USER.correo}`);
  }

  console.log('🌱  Seed completado.');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
