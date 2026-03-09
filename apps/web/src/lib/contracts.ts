export interface PaginatedResponse<T> {
  data: T[];
  total: number;
}

export type EstadoExpediente = 'ABIERTO' | 'EN_TRAMITE' | 'CERRADO' | 'ARCHIVADO';

export interface ExpedienteItem {
  id: string;
  codigo: string;
  caratula: string;
  estado: EstadoExpediente;
  fechaApertura: string;
  creador?: { id: string; nombre: string };
  _count?: { actuaciones: number; documentos: number };
}

export interface ExpedienteDetail {
  id: string;
  codigo: string;
  caratula: string;
  estado: EstadoExpediente;
  fechaApertura: string;
  createdAt: string;
  updatedAt: string;
  creador: { id: string; nombre: string; correo: string };
  _count: { actuaciones: number; documentos: number };
}

export interface ActuacionItem {
  id: string;
  expedienteId: string;
  usuarioId: string;
  tipo: string;
  descripcion: string;
  resultado?: string | null;
  fecha: string;
  usuario?: {
    id: string;
    nombre: string;
  };
}

export interface DocumentoItem {
  id: string;
  expedienteId: string;
  usuarioId: string;
  nombre: string;
  tipo: string;
  uri: string;
  hash: string;
  fecha: string;
}

export interface AuditLogItem {
  id: string;
  accion: string;
  recurso: string;
  resultado: string;
  timestamp: string;
  usuario?: {
    id: string;
    nombre: string;
    correo: string;
  };
}

export interface UserItem {
  id: string;
  nombre: string;
  correo: string;
  estado: boolean;
}

export interface RolItem {
  id: string;
  nombre: string;
  descripcion?: string | null;
}

export interface AdminRoleSummary {
  id: string;
  nombre: string;
  descripcion?: string | null;
}

export interface AdminUserItem {
  id: string;
  nombre: string;
  correo: string;
  estado: boolean;
  createdAt: string;
  updatedAt: string;
  roles: AdminRoleSummary[];
  permisos?: string[];
}

export interface AdminUsersResponse {
  data: AdminUserItem[];
  total: number;
}

export interface AdminPermissionItem {
  id: string;
  codigo: string;
  descripcion?: string | null;
}

export interface AdminRolePermissionLink {
  permisoId: string;
  permiso: AdminPermissionItem;
}

export interface AdminRoleItem {
  id: string;
  nombre: string;
  descripcion?: string | null;
  permisos: AdminRolePermissionLink[];
  _count?: {
    usuarios: number;
  };
}

export interface ReporteEstados {
  totalExpedientes: number;
  porEstado: Array<{
    estado: string;
    total: number;
  }>;
}

export interface ReporteActividad {
  periodo: {
    desde: string | null;
    hasta: string | null;
  };
  totales: {
    expedientesCreados: number;
    actuacionesRegistradas: number;
    documentosSubidos: number;
    eventosAuditoria: number;
  };
  eventosPorResultado: Array<{
    resultado: string;
    total: number;
  }>;
}
