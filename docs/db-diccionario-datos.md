# Diccionario de datos

## `usuario`
| Campo | Tipo | Restricciones | Descripcion |
|---|---|---|---|
| `id` | UUID/String | PK | Identificador unico de usuario |
| `nombre` | String | NOT NULL | Nombre completo |
| `correo` | String | UNIQUE, NOT NULL | Correo de acceso |
| `password` | String | NOT NULL | Hash de contrasena |
| `estado` | Boolean | DEFAULT `true` | Usuario activo/inactivo |
| `token_version` | Int | DEFAULT `0` | Version de sesion para revocacion |
| `created_at` | DateTime | NOT NULL | Fecha de creacion |
| `updated_at` | DateTime | NOT NULL | Fecha de actualizacion |

## `rol`
| Campo | Tipo | Restricciones | Descripcion |
|---|---|---|---|
| `id` | UUID/String | PK | Identificador unico de rol |
| `nombre` | String | UNIQUE, NOT NULL | Nombre de rol |
| `descripcion` | String | NULL | Descripcion funcional |
| `created_at` | DateTime | NOT NULL | Fecha de creacion |

## `permiso`
| Campo | Tipo | Restricciones | Descripcion |
|---|---|---|---|
| `id` | UUID/String | PK | Identificador unico de permiso |
| `codigo` | String | UNIQUE, NOT NULL | Codigo canonical (`EXPEDIENTE_READ`, etc.) |
| `descripcion` | String | NULL | Descripcion funcional |
| `created_at` | DateTime | NOT NULL | Fecha de creacion |

## `usuario_rol`
| Campo | Tipo | Restricciones | Descripcion |
|---|---|---|---|
| `usuario_id` | UUID/String | PK compuesta, FK -> `usuario.id` | Usuario asignado |
| `rol_id` | UUID/String | PK compuesta, FK -> `rol.id` | Rol asignado |

## `rol_permiso`
| Campo | Tipo | Restricciones | Descripcion |
|---|---|---|---|
| `rol_id` | UUID/String | PK compuesta, FK -> `rol.id` | Rol |
| `permiso_id` | UUID/String | PK compuesta, FK -> `permiso.id` | Permiso |

## `expediente`
| Campo | Tipo | Restricciones | Descripcion |
|---|---|---|---|
| `id` | UUID/String | PK | Identificador unico |
| `codigo` | String | UNIQUE, INDEX | Codigo de expediente |
| `caratula` | String | NOT NULL | Descripcion principal |
| `estado` | Enum | DEFAULT `ABIERTO`, INDEX | Estado de tramite |
| `fecha_apertura` | DateTime | NOT NULL | Fecha de apertura |
| `creador_id` | UUID/String | FK -> `usuario.id` | Usuario creador |
| `created_at` | DateTime | NOT NULL | Fecha de creacion |
| `updated_at` | DateTime | NOT NULL | Fecha de actualizacion |

## `actuacion`
| Campo | Tipo | Restricciones | Descripcion |
|---|---|---|---|
| `id` | UUID/String | PK | Identificador unico |
| `expediente_id` | UUID/String | FK -> `expediente.id` | Expediente asociado |
| `usuario_id` | UUID/String | FK -> `usuario.id` | Usuario autor |
| `tipo` | String | NOT NULL | Tipo de actuacion |
| `descripcion` | String | NOT NULL | Descripcion |
| `resultado` | String | NULL | Resultado de la actuacion |
| `fecha` | DateTime | NOT NULL | Fecha funcional |
| `created_at` | DateTime | NOT NULL | Fecha de registro |

## `documento`
| Campo | Tipo | Restricciones | Descripcion |
|---|---|---|---|
| `id` | UUID/String | PK | Identificador unico |
| `expediente_id` | UUID/String | FK -> `expediente.id` | Expediente asociado |
| `usuario_id` | UUID/String | FK -> `usuario.id` | Usuario que subio |
| `nombre` | String | NOT NULL | Nombre original |
| `tipo` | String | NOT NULL | MIME type |
| `uri` | String | NOT NULL | Ruta/URI de almacenamiento |
| `hash` | String | NOT NULL | Hash SHA-256 del archivo |
| `fecha` | DateTime | NOT NULL | Fecha funcional |
| `created_at` | DateTime | NOT NULL | Fecha de registro |

## `audit_log`
| Campo | Tipo | Restricciones | Descripcion |
|---|---|---|---|
| `id` | UUID/String | PK | Identificador unico de evento |
| `usuario_id` | UUID/String | FK -> `usuario.id`, INDEX | Usuario ejecutor |
| `expediente_id` | UUID/String | FK -> `expediente.id`, INDEX | Expediente relacionado |
| `accion` | String | NOT NULL | Accion ejecutada |
| `recurso` | String | NOT NULL | Recurso afectado |
| `resultado` | String | NOT NULL | `EXITO`, `DENEGADO`, `ERROR` |
| `ip` | String | NULL | IP origen |
| `payload` | JSON | NULL | Payload saneado |
| `timestamp` | DateTime | INDEX, NOT NULL | Momento del evento |
