import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';
import { PasswordUtil } from '@common/auth/password.util';
import { USER_STATUSES } from '@common/constants/user-status';
import { PrismaService } from '@infrastructure/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { QueryUsersDto } from './dto/query-users.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateUserDto } from './dto/update-user.dto';

const userSelect = {
  id: true,
  email: true,
  name: true,
  phone: true,
  status: true,
  emailVerified: true,
  deletedAt: true,
  createdAt: true,
  updatedAt: true,
  role: true,
} as const;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllUsers(query: QueryUsersDto) {
    const page = query.page ?? 1;
    const limit = Math.min(query.limit ?? 10, 100);
    const skip = (Math.max(page, 1) - 1) * limit;
    const search = query.search?.trim();

    const where: Prisma.UserWhereInput = {
      deletedAt: null,
    };

    if (query.role && Object.values(Role).includes(query.role)) {
      where.role = query.role;
    }

    if (query.status && USER_STATUSES.includes(query.status)) {
      where.status = query.status;
    }

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: userSelect,
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users.map((user) => this.mapUser(user)),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: userSelect,
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.mapUser(user);
  }

  async create(data: CreateUserDto) {
    if (!data.email || !data.password) {
      throw new BadRequestException('Email and password are required');
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email },
      select: { id: true },
    });

    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }

    const passwordHash = await PasswordUtil.hashPassword(data.password);
    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        name: data.name,
        role: data.role ?? Role.USER,
        status: 'ACTIVE',
      },
      select: userSelect,
    });

    return this.mapUser(user);
  }

  async update(id: string, data: UpdateUserDto, actorId?: string) {
    const updateData: Prisma.UserUpdateInput = {};

    if (typeof data.email === 'string') updateData.email = data.email;
    if (typeof data.name === 'string' || data.name === null)
      updateData.name = data.name;
    if (typeof data.phone === 'string' || data.phone === null)
      updateData.phone = data.phone;
    if (typeof data.status === 'string') updateData.status = data.status;
    if (
      typeof data.role === 'string' &&
      Object.values(Role).includes(data.role)
    ) {
      this.ensureSelfManagementSafety(
        actorId,
        id,
        data.role,
        updateData.status as string | undefined,
      );
      updateData.role = data.role;
    }
    if (typeof data.password === 'string' && data.password.length > 0) {
      updateData.passwordHash = await PasswordUtil.hashPassword(data.password);
    }
    const user = await this.prisma.user.update({
      where: { id },
      data: updateData,
      select: userSelect,
    });

    return this.mapUser(user);
  }

  async activateUser(id: string) {
    const user = await this.prisma.user.update({
      where: { id },
      data: { status: 'ACTIVE', deletedAt: null },
      select: userSelect,
    });

    return this.mapUser(user);
  }

  async deactivateUser(id: string, actorId?: string) {
    this.ensureSelfManagementSafety(actorId, id, undefined, 'INACTIVE');

    const user = await this.prisma.user.update({
      where: { id },
      data: { status: 'INACTIVE' },
      select: userSelect,
    });

    return this.mapUser(user);
  }

  async getCurrentUserProfile(userId: string) {
    return this.findById(userId);
  }

  async updateUserProfile(userId: string, data: UpdateProfileDto) {
    const allowedData = {
      name: data.name,
      phone: data.phone,
    };

    return this.update(userId, allowedData);
  }

  async changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string,
  ) {
    if (!oldPassword || !newPassword) {
      throw new BadRequestException('Both old and new passwords are required');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, passwordHash: true, role: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const passwordMatches = await PasswordUtil.comparePassword(
      oldPassword,
      user.passwordHash,
    );

    if (!passwordMatches) {
      throw new ForbiddenException('Old password is incorrect');
    }

    const passwordHash = await PasswordUtil.hashPassword(newPassword);
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
      select: { id: true, role: true },
    });

    return {
      id: updatedUser.id,
      role: updatedUser.role,
      roles: [updatedUser.role],
    };
  }

  async softDeleteByAdmin(id: string, actorId: string) {
    this.ensureSelfManagementSafety(actorId, id, undefined, 'INACTIVE');

    await this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date(), status: 'INACTIVE' },
    });
  }

  async restore(id: string) {
    const user = await this.prisma.user.update({
      where: { id },
      data: { deletedAt: null, status: 'ACTIVE' },
      select: userSelect,
    });

    return this.mapUser(user);
  }

  async hardDeleteByAdmin(id: string, actorId: string) {
    this.ensureSelfManagementSafety(actorId, id, undefined, 'INACTIVE');
    await this.prisma.user.delete({ where: { id } });
  }

  private mapUser(user: {
    id: string;
    email: string;
    name: string | null;
    phone: string | null;
    status: string;
    emailVerified: boolean;
    deletedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    role: Role;
  }) {
    return {
      ...user,
      roles: [user.role],
    };
  }

  private ensureSelfManagementSafety(
    actorId: string | undefined,
    targetUserId: string,
    nextRole?: Role,
    nextStatus?: string,
  ) {
    if (!actorId || actorId !== targetUserId) {
      return;
    }

    if (nextRole && nextRole !== Role.ADMIN) {
      throw new BadRequestException('Admin cannot remove their own admin role');
    }

    if (nextStatus && nextStatus !== 'ACTIVE') {
      throw new BadRequestException(
        'Admin cannot deactivate their own account',
      );
    }
  }
}
