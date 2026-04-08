import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '@common/auth/current-user.decorator';
import { JwtAuthGuard } from '@common/auth/jwt-auth.guard';
import { Roles } from '@common/auth/roles.decorator';
import { RolesGuard } from '@common/auth/roles.guard';
import { Role } from '@prisma/client';
import type { AuthenticatedUser } from '@common/auth/jwt-payload.interface';
import { UsersService } from './users.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { QueryUsersDto } from './dto/query-users.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  getProfile(@CurrentUser() user: AuthenticatedUser) {
    return this.usersService.getCurrentUserProfile(user.userId);
  }

  @Put('me')
  updateProfile(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: UpdateProfileDto,
  ) {
    return this.usersService.updateUserProfile(user.userId, body);
  }

  @Patch('me/deactivate')
  deactivateProfile(@CurrentUser() user: AuthenticatedUser) {
    return this.usersService.deactivateUser(user.userId, user.userId);
  }

  @Patch('me/change-password')
  changePassword(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: ChangePasswordDto,
  ) {
    return this.usersService.changePassword(
      user.userId,
      body.oldPassword,
      body.newPassword,
    );
  }

  @Post()
  @Roles(Role.ADMIN)
  create(@Body() body: CreateUserDto) {
    return this.usersService.create(body);
  }

  @Get()
  @Roles(Role.ADMIN)
  getAllUsers(@Query() query: QueryUsersDto) {
    return this.usersService.getAllUsers(query);
  }

  @Get(':id')
  @Roles(Role.ADMIN)
  getById(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Put(':id')
  @Roles(Role.ADMIN)
  update(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: UpdateUserDto,
  ) {
    return this.usersService.update(id, body, user.userId);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  patch(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: UpdateUserDto,
  ) {
    return this.usersService.update(id, body, user.userId);
  }

  @Patch(':id/activate')
  @Roles(Role.ADMIN)
  activateUser(@Param('id') id: string) {
    return this.usersService.activateUser(id);
  }

  @Patch(':id/deactivate')
  @Roles(Role.ADMIN)
  deactivateUser(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.usersService.deactivateUser(id, user.userId);
  }

  @Delete(':id/soft')
  @Roles(Role.ADMIN)
  async softDelete(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    await this.usersService.softDeleteByAdmin(id, user.userId);
    return {
      message: 'User soft deleted successfully',
    };
  }

  @Patch(':id/restore')
  @Roles(Role.ADMIN)
  restore(@Param('id') id: string) {
    return this.usersService.restore(id);
  }

  @Delete(':id/hard')
  @Roles(Role.ADMIN)
  async hardDelete(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    await this.usersService.hardDeleteByAdmin(id, user.userId);
    return {
      message: 'User deleted permanently',
    };
  }
}
