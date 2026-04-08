import { JwtAuthGuard } from '@common/auth/jwt-auth.guard';
import { Module } from '@nestjs/common';
import { AuditLogsController } from './audit-logs.controller';
import { AuditLogsService } from './audit-logs.service';

@Module({
  controllers: [AuditLogsController],
  providers: [AuditLogsService, JwtAuthGuard],
  exports: [AuditLogsService],
})
export class AuditLogsModule {}
