import { PrismaModule } from '@infrastructure/prisma/prisma.module';
import { AuditLogsModule } from '@modules/audit-logs/audit-logs.module';
import { AuthModule } from '@modules/auth/auth.module';
import { HealthModule } from '@modules/health/health.module';
import { SystemModule } from '@modules/system/system.module';
import { UsersModule } from '@modules/users/users.module';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TaskModule } from './modules/task/task.module';

@Module({
  imports: [
    PrismaModule,
    HealthModule,
    SystemModule,
    AuthModule,
    UsersModule,
    AuditLogsModule,
    TaskModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
