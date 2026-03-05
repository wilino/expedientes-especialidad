import { Module } from '@nestjs/common';
import { RbacController } from './rbac.controller';
import { RbacService } from './rbac.service';
import { RbacRepository } from './rbac.repository';
import { RBAC_REPOSITORY } from './rbac.repository.port';

@Module({
  controllers: [RbacController],
  providers: [
    RbacService,
    RbacRepository,
    { provide: RBAC_REPOSITORY, useExisting: RbacRepository },
  ],
  exports: [RbacService],
})
export class RbacModule {}
