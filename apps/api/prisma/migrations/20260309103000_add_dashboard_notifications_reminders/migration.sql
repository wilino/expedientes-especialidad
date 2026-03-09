-- CreateTable
CREATE TABLE `notificaciones` (
    `id` VARCHAR(191) NOT NULL,
    `usuario_id` VARCHAR(191) NOT NULL,
    `tipo` ENUM('VENCIMIENTO', 'ALERTA', 'EXITO', 'INFO') NOT NULL,
    `titulo` VARCHAR(191) NOT NULL,
    `mensaje` VARCHAR(191) NULL,
    `recurso_id` VARCHAR(191) NULL,
    `recurso_tipo` ENUM('EXPEDIENTE', 'ACTUACION', 'DOCUMENTO', 'AUDITORIA', 'SISTEMA') NULL,
    `leida` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `notificaciones_usuario_id_leida_idx`(`usuario_id`, `leida`),
    INDEX `notificaciones_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `recordatorios` (
    `id` VARCHAR(191) NOT NULL,
    `usuario_id` VARCHAR(191) NOT NULL,
    `titulo` VARCHAR(191) NOT NULL,
    `descripcion` VARCHAR(191) NULL,
    `fecha_hora` DATETIME(3) NOT NULL,
    `prioridad` ENUM('URGENTE', 'NORMAL', 'BAJA') NOT NULL DEFAULT 'NORMAL',
    `completado` BOOLEAN NOT NULL DEFAULT false,
    `recurso_id` VARCHAR(191) NULL,
    `recurso_tipo` ENUM('EXPEDIENTE', 'ACTUACION', 'DOCUMENTO', 'AUDITORIA', 'SISTEMA') NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `recordatorios_usuario_id_fecha_hora_idx`(`usuario_id`, `fecha_hora`),
    INDEX `recordatorios_usuario_id_completado_idx`(`usuario_id`, `completado`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `notificaciones` ADD CONSTRAINT `notificaciones_usuario_id_fkey` FOREIGN KEY (`usuario_id`) REFERENCES `usuario`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `recordatorios` ADD CONSTRAINT `recordatorios_usuario_id_fkey` FOREIGN KEY (`usuario_id`) REFERENCES `usuario`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
