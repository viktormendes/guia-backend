/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Controller, Get } from '@nestjs/common';
import { HelpAnalyticsService } from './help-analytics.service';
import { HelpDashboardDto } from './dto/help-dashboard.dto';
import { Public } from 'src/common/decorators/public.decorator';

@Public()
@Controller('help/analytics')
export class HelpAnalyticsController {
  constructor(private readonly helpAnalyticsService: HelpAnalyticsService) {}

  @Get('dashboard')
  async getDashboard(): Promise<HelpDashboardDto> {
    return await this.helpAnalyticsService.getDashboard();
  }
}
