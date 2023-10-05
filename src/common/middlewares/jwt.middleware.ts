import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtMiddleware implements NestMiddleware {
  constructor(private readonly jwtService: JwtService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const token = req.headers['authorization'];

    if (!token) {
      return res
        .status(401)
        .json({ message: 'Authorization token is missing.' });
    }

    try {
      // Verify and decode the JWT token
      const decoded = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET, // Replace with your JWT secret
      });

      // Attach the user data from the token to the request object
      req['user'] = decoded;
      next();
    } catch (error) {
      return res.status(401).json({ message: 'Invalid token.' });
    }
  }
}
