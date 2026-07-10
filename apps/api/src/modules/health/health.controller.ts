import { Controller, Get } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AiService } from '../ai/ai.service';

@Controller('health')
export class HealthController {
  constructor(
    private readonly dataSource: DataSource,
    private readonly aiService: AiService,
  ) {}

  @Get()
  async getHealth() {
    let database: 'ok' | 'error' = 'error';

    try {
      await this.dataSource.query('SELECT 1');
      database = 'ok';
    } catch {
      database = 'error';
    }

    return {
      status: database === 'ok' ? 'ok' : 'degraded',
      service: 'aomlegacy-api',
      database,
      ai: this.aiService.getHealth().status,
      timestamp: new Date().toISOString(),
    };
  }
}
