import { Request, Response, NextFunction } from 'express';
import JWT from 'jsonwebtoken';
import { config } from '@root/config';
import { UnauthorizedError } from '@global/helpers/error-handler';
import { AuthPayload } from '@auth/interfaces/auth.interface';

export class AuthMiddleware {
  public verifyUser(req: Request, _res: Response, next: NextFunction): void {
    if (!req.session?.jwt) throw new UnauthorizedError('Token is not available. Please login.');

    try {
      const payload: AuthPayload = JWT.verify(req.session.jwt, config.JWT_TOKEN!) as AuthPayload;
      req.currentUser = payload;
    } catch (error) {
      throw new UnauthorizedError('Token is not valid. Please login.');
    }

    next();
  }

  public checkAuthentication(req: Request, _res: Response, next: NextFunction): void {
    if (!req.currentUser) throw new UnauthorizedError('Authentication is required. Please login.');
    next();
  }
}

export const authMiddleware: AuthMiddleware = new AuthMiddleware();
