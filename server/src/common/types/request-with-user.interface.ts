import type { Request } from 'express';
import type { AuthenticatedUser } from '@common/auth/jwt-payload.interface';

export interface RequestWithUser extends Request {
  user?: AuthenticatedUser;
}
