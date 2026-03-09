import { PermissionCodes, type PermissionCode } from './permission-codes';

export interface AccessRule {
  permissions: readonly PermissionCode[];
  requireAll: boolean;
}

export const AccessRules = {
  expedientes: {
    permissions: [PermissionCodes.EXPEDIENTE_READ],
    requireAll: true,
  },
  actuaciones: {
    permissions: [PermissionCodes.ACTUACION_READ],
    requireAll: true,
  },
  documentos: {
    permissions: [PermissionCodes.DOCUMENTO_READ],
    requireAll: true,
  },
  auditoria: {
    permissions: [PermissionCodes.AUDIT_READ],
    requireAll: true,
  },
  reportes: {
    permissions: [PermissionCodes.AUDIT_READ],
    requireAll: true,
  },
  adminUsers: {
    permissions: [PermissionCodes.USER_MANAGE, PermissionCodes.RBAC_MANAGE],
    requireAll: true,
  },
  adminRoles: {
    permissions: [PermissionCodes.RBAC_MANAGE],
    requireAll: true,
  },
} satisfies Record<string, AccessRule>;

export type AccessRuleKey = keyof typeof AccessRules;
