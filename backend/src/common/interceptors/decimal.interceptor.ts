import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Observable, map } from 'rxjs';

@Injectable()
export class DecimalInterceptor implements NestInterceptor {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(map((value) => this.converter(value)));
  }

  private converter(value: unknown): unknown {
    if (value instanceof Prisma.Decimal) return value.toNumber();
    if (Array.isArray(value)) return value.map((item) => this.converter(item));
    if (value && typeof value === 'object' && !(value instanceof Date)) {
      return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, this.converter(item)]));
    }
    return value;
  }
}
