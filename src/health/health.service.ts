import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async getHealthStatus() {
    const checks = await Promise.allSettled([
      this.checkDatabase(),
    ]);

    const results = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      checks: {
        database: this.formatCheckResult(checks[0], 'Database'),
      },
    };

    const hasUnhealthyChecks = Object.values(results.checks).some(
      (check: any) => check.status === 'unhealthy'
    );

    if (hasUnhealthyChecks) {
      results.status = 'unhealthy';
    }

    return results;
  }

  async getReadinessStatus() {
    const checks = await Promise.allSettled([
      this.checkDatabase(),
    ]);

    const results = {
      status: 'ready',
      timestamp: new Date().toISOString(),
      checks: {
        database: this.formatCheckResult(checks[0], 'Database'),
      },
    };

    const hasUnreadyChecks = Object.values(results.checks).some(
      (check: any) => check.status === 'unhealthy'
    );

    if (hasUnreadyChecks) {
      results.status = 'not ready';
    }

    return results;
  }

  async getLivenessStatus() {
    return {
      status: 'alive',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    };
  }

  private async checkDatabase() {
    try {
      await this.dataSource.query('SELECT 1');
      return { status: 'healthy', message: 'Database connection successful' };
    } catch (error) {
      this.logger.error('Database health check failed:', error);
      return { status: 'unhealthy', message: 'Database connection failed', error: error.message };
    }
  }

  private formatCheckResult(result: PromiseSettledResult<any>, serviceName: string) {
    if (result.status === 'fulfilled') {
      return result.value;
    } else {
      return {
        status: 'unhealthy',
        message: `${serviceName} check failed`,
        error: result.reason?.message || 'Unknown error',
      };
    }
  }
}
