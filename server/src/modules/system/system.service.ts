import { Injectable } from '@nestjs/common';

@Injectable()
export class SystemService {
  getSystemOverview() {
    return {
      service: 'taskly-server',
      status: 'ready',
      structure: {
        common: ['auth', 'config', 'constants', 'http', 'types'],
        modules: ['health', 'system', 'auth', 'users'],
        infrastructure: ['prisma'],
      },
      focus: ['authentication', 'user management', 'tasks', 'audit logs'],
    };
  }
}
