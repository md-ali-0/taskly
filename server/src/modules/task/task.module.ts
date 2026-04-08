import { Module } from '@nestjs/common';
import { JwtAuthGuard } from '@common/auth/jwt-auth.guard';
import { AuditLogsModule } from '@modules/audit-logs/audit-logs.module';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';

@Module({
  imports: [AuditLogsModule],
  controllers: [TasksController],
  providers: [TasksService, JwtAuthGuard],
  exports: [TasksService],
})
export class TaskModule {}
