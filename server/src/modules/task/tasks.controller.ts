import { CurrentUser } from '@common/auth/current-user.decorator';
import { JwtAuthGuard } from '@common/auth/jwt-auth.guard';
import { Roles } from '@common/auth/roles.decorator';
import { RolesGuard } from '@common/auth/roles.guard';
import type { AuthenticatedUser } from '@common/auth/jwt-payload.interface';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { AssignTaskDto } from './dto/assign-task.dto';
import { CreateTaskDto } from './dto/create-task.dto';
import { QueryTasksDto } from './dto/query-tasks.dto';
import type { TaskDto } from './dto/task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { UpdateTaskStatusDto } from './dto/update-task-status.dto';
import { TasksService } from './tasks.service';

@Controller('tasks')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  @Roles(Role.ADMIN)
  getAll(@Query() query: QueryTasksDto) {
    return this.tasksService.getAllTasks(query);
  }

  @Get('my-tasks')
  getMyTasks(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: QueryTasksDto,
  ) {
    return this.tasksService.getMyTasks(user.userId, query);
  }

  @Post()
  @Roles(Role.ADMIN)
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: CreateTaskDto,
  ): Promise<TaskDto> {
    return this.tasksService.createTask(body, user.userId);
  }

  @Patch(':id/assign')
  @Roles(Role.ADMIN)
  assign(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: AssignTaskDto,
  ) {
    return this.tasksService.assignTask(id, body, user.userId);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  update(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: UpdateTaskDto,
  ) {
    return this.tasksService.updateTask(id, body, user.userId);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: UpdateTaskStatusDto,
  ) {
    return this.tasksService.updateTaskStatus(id, body, user.userId, user.role);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.tasksService.deleteTask(id, user.userId);
  }
}
