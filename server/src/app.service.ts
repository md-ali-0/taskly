import { appConfig } from '@common/config/app.config';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getOverview() {
    return {
      name: appConfig.appName,
      status: 'bootstrap-ready',
      currentPhase: 1,
      apiPrefix: `/${appConfig.apiPrefix}`,
      healthEndpoint: '/health',
    };
  }
}
