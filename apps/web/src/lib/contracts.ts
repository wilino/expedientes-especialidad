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

export type NotificacionTipo = 'VENCIMIENTO' | 'ALERTA' | 'EXITO' | 'INFO';

export type RecursoTipo =
  | 'EXPEDIENTE'
  | 'ACTUACION'
  | 'DOCUMENTO'
  | 'AUDITORIA'
  | 'SISTEMA';

export type RecordatorioPrioridad = 'URGENTE' | 'NORMAL' | 'BAJA';

export type DashboardTrendDirection = 'up' | 'down' | 'flat';

export interface DashboardSummaryResponse {
  generatedAt: string;
  period: {
    windowDays: number;
    currentFrom: string;
    currentTo: string;
    previousFrom: string;
    previousTo: string;
  };
  kpis: Array<{
    key: string;
    label: string;
    value: number;
    currentWindowValue: number;
    previousWindowValue: number;
    trendPercent: number;
    trendDirection: DashboardTrendDirection;
  }>;
  remindersToday: number;
  unreadNotifications: number;
  expedientesByEstado: Array<{
    estado: EstadoExpediente;
    total: number;
  }>;
}

export interface DashboardGaugesResponse {
  generatedAt: string;
  period: {
    windowDays: number;
    currentFrom: string;
    currentTo: string;
  };
  gauges: Array<{
    key: 'resolutionRate' | 'deadlineCompliance' | 'documentIntegrity' | 'auditCoverage';
    label: string;
    value: number;
    numerator: number;
    denominator: number;
  }>;
}

export interface NotificationItem {
  id: string;
  tipo: NotificacionTipo;
  titulo: string;
  mensaje: string | null;
  recursoTipo: RecursoTipo | null;
  recursoId: string | null;
  leida: boolean;
  createdAt: string;
  readOnly: boolean;
  source: 'persisted' | 'fallback';
}

export interface NotificationsListResponse {
  data: NotificationItem[];
  unreadCount: number;
}

export interface ReminderItem {
  id: string;
  titulo: string;
  descripcion: string | null;
  fechaHora: string;
  prioridad: RecordatorioPrioridad;
  completado: boolean;
  recursoTipo: RecursoTipo | null;
  recursoId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RemindersListResponse {
  data: ReminderItem[];
}

export interface ActivityRecentResponse {
  data: Array<{
    id: string;
    accion: string;
    recurso: string;
    resultado: string;
    timestamp: string;
    usuario: { id: string; nombre: string } | null;
    expediente: { id: string; codigo: string } | null;
  }>;
}
