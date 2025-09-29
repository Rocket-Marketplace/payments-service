import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { HealthService } from './health.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({ summary: 'Get service health status' })
  @ApiResponse({ status: 200, description: 'Health status retrieved successfully' })
  async getHealth() {
    return this.healthService.getHealthStatus();
  }

  @Get('ready')
  @ApiOperation({ summary: 'Get service readiness status' })
  @ApiResponse({ status: 200, description: 'Readiness status retrieved successfully' })
  async getReadiness() {
    return this.healthService.getReadinessStatus();
  }

  @Get('live')
  @ApiOperation({ summary: 'Get service liveness status' })
  @ApiResponse({ status: 200, description: 'Liveness status retrieved successfully' })
  async getLiveness() {
    return this.healthService.getLivenessStatus();
  }
}
