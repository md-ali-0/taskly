import { PrismaService } from '@infrastructure/prisma/prisma.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import {
  AuditAction,
  AuditEntityType,
  Prisma,
  type AuditLog,
} from '@prisma/client';
import { auditLogSelect } from './dto/audit-log.dto';
import { QueryAuditLogsDto } from './dto/query-audit-logs.dto';

type CreateAuditLogInput = {
  actorId?: string | null;
  action: AuditAction;
  entityType?: AuditEntityType;
  entityId: string;
  summary?: string | null;
  before?: Prisma.InputJsonValue | null;
  after?: Prisma.InputJsonValue | null;
};

@Injectable()
export class AuditLogsService {
  constructor(private readonly prisma: PrismaService) {}

  async getAuditLogs(query: QueryAuditLogsDto) {
    const limit = Math.min(query.limit ?? 10, 100);
    const where: Prisma.AuditLogWhereInput = {};

    if (query.action) {
      where.action = query.action;
    }

    if (query.entityType) {
      where.entityType = query.entityType;
    }

    if (query.entityId) {
      where.entityId = query.entityId;
    }

    if (query.actorId) {
      where.actorId = query.actorId;
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

    const logs = await this.prisma.auditLog.findMany({
      where,
      take: limit + 1,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      select: auditLogSelect,
    });

    const hasMore = logs.length > limit;
    const data = hasMore ? logs.slice(0, limit) : logs;
    const lastLog = data.at(-1);

    return {
      data,
      meta: {
        limit,
        hasMore,
        nextCursor: hasMore && lastLog ? this.encodeCursor(lastLog) : null,
      },
    };
  }

  async createLog(input: CreateAuditLogInput): Promise<AuditLog> {
    return this.prisma.auditLog.create({
      data: {
        actorId: input.actorId ?? null,
        action: input.action,
        entityType: input.entityType ?? AuditEntityType.TASK,
        entityId: input.entityId,
        summary: input.summary ?? null,
        before: input.before ?? Prisma.JsonNull,
        after: input.after ?? Prisma.JsonNull,
      },
    });
  }

  toJson(value: unknown): Prisma.InputJsonValue | null {
    if (value === undefined) {
      return null;
    }

    return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
  }

  private encodeCursor(log: Pick<AuditLog, 'id' | 'createdAt'>): string {
    return Buffer.from(
      JSON.stringify({
        id: log.id,
        createdAt: log.createdAt.toISOString(),
      }),
      'utf8',
    ).toString('base64url');
  }

  private buildCursorFilter(
    cursor: string | undefined,
  ): Prisma.AuditLogWhereInput | null {
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
