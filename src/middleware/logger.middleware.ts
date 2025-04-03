import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    console.log('Request...', {
      status: res.statusCode,
      method: req.method,
      url: req.url,
      ip: req.ip,
    });
    next();
  }
}
