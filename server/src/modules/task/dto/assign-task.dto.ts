import { IsOptional, IsString, MinLength } from 'class-validator';

export class AssignTaskDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  assignedUserId?: string | null;
}
