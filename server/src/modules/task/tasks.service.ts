import { PrismaService } from '@infrastructure/prisma/prisma.service';
import { AuditLogsService } from '@modules/audit-logs/audit-logs.service';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AuditAction, Prisma, TaskStatus } from '@prisma/client';
import { AssignTaskDto } from './dto/assign-task.dto';
import { CreateTaskDto } from './dto/create-task.dto';
import { QueryTasksDto } from './dto/query-tasks.dto';
import { taskSelect, type TaskDto } from './dto/task.dto';
import { UpdateTaskStatusDto } from './dto/update-task-status.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  async getAllTasks(query: QueryTasksDto) {
    const limit = Math.min(query.limit ?? 10, 100);
    const search = query.search?.trim();

    const where: Prisma.TaskWhereInput = {
      deletedAt: null,
    };

    if (query.status) {
      where.status = query.status;
    }

    if (query.assignedUserId) {
      where.assignedUserId = query.assignedUserId;
    }

    if (query.createdById) {
      where.createdById = query.createdById;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const cursorFilter = this.buildCursorFilter(query.cursor);

    if (cursorFilter) {
      const existingAnd = where.AND
        ? Array.isArray(where.AND)
          ? where.AND
          : [where.AND]
        : [];

      where.AND = [...existingAnd, cursorFilter];
    }

    const tasks = await this.prisma.task.findMany({
      where,
      take: limit + 1,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      select: taskSelect,
    });

    const hasMore = tasks.length > limit;
    const data = hasMore ? tasks.slice(0, limit) : tasks;
    const lastTask = data.at(-1);

    return {
      data,
      meta: {
        limit,
        hasMore,
        nextCursor: hasMore && lastTask ? this.encodeCursor(lastTask) : null,
      },
    };
  }

  async getMyTasks(userId: string, query: QueryTasksDto) {
    return this.getAllTasks({
      ...query,
      assignedUserId: userId,
    });
  }

  async createTask(
    payload: CreateTaskDto,
    creatorId: string,
  ): Promise<TaskDto> {
    const title = payload.title.trim();

    if (!title) {
      throw new BadRequestException('Task title is required');
    }

    await this.ensureActiveUserExists(creatorId, 'Task creator not found');

    if (payload.assignedUserId) {
      await this.ensureActiveUserExists(
        payload.assignedUserId,
        'Assigned user not found',
      );
    }

    const createdTask = await this.prisma.task.create({
      data: {
        title,
        description: payload.description?.trim() || null,
        status: payload.status ?? TaskStatus.PENDING,
        assignedUserId: payload.assignedUserId ?? null,
        createdById: creatorId,
      },
      select: taskSelect,
    });

    await this.auditLogsService.createLog({
      actorId: creatorId,
      action: AuditAction.TASK_CREATED,
      entityId: createdTask.id,
      summary: `Task "${createdTask.title}" was created`,
      before: null,
      after: this.auditLogsService.toJson(createdTask),
    });

    return createdTask;
  }

  async getTaskById(taskId: string): Promise<TaskDto> {
    return this.findTaskOrThrow(taskId);
  }

  async deleteTask(
    taskId: string,
    actorId: string,
  ): Promise<{ message: string }> {
    const task = await this.findTaskOrThrow(taskId);

    await this.prisma.task.update({
      where: { id: taskId },
      data: { deletedAt: new Date() },
    });

    await this.auditLogsService.createLog({
      actorId,
      action: AuditAction.TASK_DELETED,
      entityId: taskId,
      summary: `Task "${task.title}" was deleted`,
      before: this.auditLogsService.toJson(task),
      after: null,
    });

    return { message: 'Task deleted successfully' };
  }

  async updateTask(
    taskId: string,
    payload: UpdateTaskDto,
    actorId: string,
  ): Promise<TaskDto> {
    const existingTask = await this.findTaskOrThrow(taskId);

    const data: Prisma.TaskUpdateInput = {};

    if (payload.title !== undefined) {
      const title = payload.title.trim();
      if (!title) {
        throw new BadRequestException('Task title cannot be empty');
      }
      data.title = title;
    }

    if (payload.description !== undefined) {
      data.description = payload.description?.trim() || null;
    }

    if (payload.status !== undefined) {
      data.status = payload.status;
    }

    if (payload.assignedUserId !== undefined) {
      if (payload.assignedUserId) {
        await this.ensureActiveUserExists(
          payload.assignedUserId,
          'Assigned user not found',
        );
        data.assignedUser = {
          connect: { id: payload.assignedUserId },
        };
      } else {
        data.assignedUser = {
          disconnect: true,
        };
      }
    }

    const updatedTask = await this.prisma.task.update({
      where: { id: taskId },
      data,
      select: taskSelect,
    });

    await this.auditLogsService.createLog({
      actorId,
      action: AuditAction.TASK_UPDATED,
      entityId: updatedTask.id,
      summary: `Task "${updatedTask.title}" was updated`,
      before: this.auditLogsService.toJson(existingTask),
      after: this.auditLogsService.toJson(updatedTask),
    });

    return updatedTask;
  }

  async updateTaskStatus(
    taskId: string,
    payload: UpdateTaskStatusDto,
    actorId: string,
    actorRole?: string,
  ): Promise<TaskDto> {
    const task = await this.findTaskOrThrow(taskId);

    if (
      actorRole !== 'ADMIN' &&
      task.assignedUserId !== actorId
    ) {
      throw new ForbiddenException(
        'You can only update the status of your assigned tasks',
      );
    }

    const updatedTask = await this.prisma.task.update({
      where: { id: taskId },
      data: { status: payload.status },
      select: taskSelect,
    });

    await this.auditLogsService.createLog({
      actorId,
      action: AuditAction.TASK_STATUS_CHANGED,
      entityId: updatedTask.id,
      summary: `Task "${updatedTask.title}" status changed from ${task.status} to ${updatedTask.status}`,
      before: this.auditLogsService.toJson({
        status: task.status,
      }),
      after: this.auditLogsService.toJson({
        status: updatedTask.status,
      }),
    });

    return updatedTask;
  }

  async assignTask(
    taskId: string,
    payload: AssignTaskDto,
    actorId: string,
  ): Promise<TaskDto> {
    const task = await this.findTaskOrThrow(taskId);

    if (payload.assignedUserId) {
      await this.ensureActiveUserExists(
        payload.assignedUserId,
        'Assigned user not found',
      );
    }

    const updatedTask = await this.prisma.task.update({
      where: { id: taskId },
      data: { assignedUserId: payload.assignedUserId ?? null },
      select: taskSelect,
    });

    await this.auditLogsService.createLog({
      actorId,
      action: AuditAction.TASK_ASSIGNED,
      entityId: updatedTask.id,
      summary: payload.assignedUserId
        ? `Task "${updatedTask.title}" was assigned`
        : `Task "${updatedTask.title}" was unassigned`,
      before: this.auditLogsService.toJson({
        assignedUserId: task.assignedUserId,
        assignedUser: task.assignedUser,
      }),
      after: this.auditLogsService.toJson({
        assignedUserId: updatedTask.assignedUserId,
        assignedUser: updatedTask.assignedUser,
      }),
    });

    return updatedTask;
  }

  private async ensureActiveUserExists(
    userId: string,
    message: string,
  ): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, deletedAt: true },
    });

    if (!user || user.deletedAt) {
      throw new NotFoundException(message);
    }
  }

  private async ensureTaskExists(taskId: string): Promise<void> {
    const task = await this.prisma.task.findFirst({
      where: { id: taskId, deletedAt: null },
      select: { id: true },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }
  }

  private async findTaskOrThrow(taskId: string): Promise<TaskDto> {
    const task = await this.prisma.task.findFirst({
      where: { id: taskId, deletedAt: null },
      select: taskSelect,
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return task;
  }

  private encodeCursor(task: Pick<TaskDto, 'id' | 'createdAt'>): string {
    return Buffer.from(
      JSON.stringify({
        id: task.id,
        createdAt: task.createdAt.toISOString(),
      }),
      'utf8',
    ).toString('base64url');
  }

  private buildCursorFilter(
    cursor: string | undefined,
  ): Prisma.TaskWhereInput | null {
    if (!cursor) {
      return null;
    }

    try {
      const decoded = JSON.parse(
        Buffer.from(cursor, 'base64url').toString('utf8'),
      ) as {
        id?: string;
        createdAt?: string;
      };

      if (!decoded.id || !decoded.createdAt) {
        throw new Error('Invalid cursor payload');
      }

      const createdAt = new Date(decoded.createdAt);

      if (Number.isNaN(createdAt.getTime())) {
        throw new Error('Invalid cursor timestamp');
      }

      return {
        OR: [
          { createdAt: { lt: createdAt } },
          {
            AND: [{ createdAt }, { id: { lt: decoded.id } }],
          },
        ],
      };
    } catch {
      throw new BadRequestException('Invalid cursor');
    }
  }
}
