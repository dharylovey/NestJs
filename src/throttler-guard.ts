import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { Request } from 'express';

@Injectable()
export class ThrottlerProxyGuard extends ThrottlerGuard {
  protected async getTracker(req: Request): Promise<string> {
    const realIp = req.headers['x-real-ip'] as string;
    const forwardedFor = req.headers['x-forwarded-for'] as string;

    if (realIp) {
      return realIp;
    }

    if (forwardedFor) {
      return forwardedFor.split(',')[0].trim();
    }

    return req.ip?.length ? req.ip : super.getTracker(req);
  }
}
