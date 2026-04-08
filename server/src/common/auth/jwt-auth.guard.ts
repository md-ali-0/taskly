import { PrismaService } from '@infrastructure/prisma/prisma.service';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { RequestWithUser } from '@common/types/request-with-user.interface';
import { verifyAccessToken } from './jwt.util';

function getCookieValue(cookieHeader: string | undefined, key: string) {
  if (!cookieHeader) {
    return null;
  }

  const cookies = cookieHeader.split(';').map((entry) => entry.trim());
  const match = cookies.find((cookie) => cookie.startsWith(`${key}=`));
  return match ? decodeURIComponent(match.slice(key.length + 1)) : null;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const authorization = request.headers.authorization;
    const bearerToken = authorization?.startsWith('Bearer ')
      ? authorization.slice('Bearer '.length)
      : null;
    const cookieToken = getCookieValue(request.headers.cookie, 'accessToken');
    const token = bearerToken ?? cookieToken;

    if (!token) {
      throw new UnauthorizedException('Authentication token is missing');
    }

    const payload = verifyAccessToken(token);
    const user = await this.prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        deletedAt: true,
      },
    });

    if (!user || user.deletedAt) {
      throw new UnauthorizedException('User not found');
    }

    request.user = {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      roles: [user.role],
      status: user.status,
    };

    return true;
  }
}
