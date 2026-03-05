export interface PaginatedResponse<T> {
  data: T[];
  total: number;
}

export interface ExpedienteItem {
  id: string;
  codigo: string;
  caratula: string;
  estado: string;
  fechaApertura: string;
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
