import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser, Permissions } from '../auth';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { PermissionCodes } from '../rbac/constants/permission-codes.constants';
import { ApiStandardErrorResponses } from '../../shared/swagger';
import {
  DashboardGaugesResponseDto,
  DashboardQueryDto,
  DashboardSummaryResponseDto,
} from './dto';
import { DashboardService } from './dashboard.service';

@ApiTags('Dashboard')
@ApiBearerAuth()
@ApiStandardErrorResponses()
@Permissions(PermissionCodes.DASHBOARD_READ)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Resumen operativo del dashboard' })
  @ApiOkResponse({
    description: 'KPI principales, tendencias y resumen de estado',
    type: DashboardSummaryResponseDto,
  })
  getSummary(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: DashboardQueryDto,
  ) {
    return this.dashboardService.getSummary(user, query.windowDays ?? 30);
  }

  @Get('gauges')
  @ApiOperation({ summary: 'Métricas de gauges operativos del dashboard' })
  @ApiOkResponse({
    description: 'Métricas normalizadas para visualización en tacómetros',
    type: DashboardGaugesResponseDto,
  })
  getGauges(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: DashboardQueryDto,
  ) {
    return this.dashboardService.getGauges(user, query.windowDays ?? 30);
  }
}
