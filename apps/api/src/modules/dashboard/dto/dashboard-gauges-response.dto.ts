import { ApiProperty } from '@nestjs/swagger';

export class DashboardGaugeItemDto {
  @ApiProperty({ example: 'resolutionRate' })
  key!: string;

  @ApiProperty({ example: 'Tasa de resolución' })
  label!: string;

  @ApiProperty({ example: 78.3 })
  value!: number;

  @ApiProperty({ example: 47 })
  numerator!: number;

  @ApiProperty({ example: 60 })
  denominator!: number;
}

export class DashboardGaugePeriodDto {
  @ApiProperty({ example: 30 })
  windowDays!: number;

  @ApiProperty({ example: '2026-02-08T00:00:00.000Z' })
  currentFrom!: string;

  @ApiProperty({ example: '2026-03-09T23:59:59.999Z' })
  currentTo!: string;
}

export class DashboardGaugesResponseDto {
  @ApiProperty({ example: '2026-03-09T19:10:00.000Z' })
  generatedAt!: string;

  @ApiProperty({ type: DashboardGaugePeriodDto })
  period!: DashboardGaugePeriodDto;

  @ApiProperty({ type: [DashboardGaugeItemDto] })
  gauges!: DashboardGaugeItemDto[];
}
