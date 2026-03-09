import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { DashboardRepository } from './dashboard.repository';
import { DASHBOARD_REPOSITORY } from './dashboard.repository.port';

@Module({
  controllers: [DashboardController],
  providers: [
    DashboardService,
    DashboardRepository,
    { provide: DASHBOARD_REPOSITORY, useExisting: DashboardRepository },
  ],
  exports: [DashboardService],
})
export class DashboardModule {}
