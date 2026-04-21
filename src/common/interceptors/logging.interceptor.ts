import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Request } from 'express';
import { Observable, tap } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest<Request>();
    const { method, originalUrl } = req;
    const start = Date.now();

    this.logger.log(`→ ${method} ${originalUrl}`);

    return next.handle().pipe(
      tap({
        next: () => {
          const res = context
            .switchToHttp()
            .getResponse<{ statusCode: number }>();
          this.logger.log(
            `✓ ${method} ${originalUrl} ${res.statusCode} (${Date.now() - start}ms)`,
          );
        },
        error: (err: { status?: number; message?: string }) => {
          this.logger.error(
            `✗ ${method} ${originalUrl} ${err.status ?? 500} (${Date.now() - start}ms) - ${err.message ?? 'error'}`,
          );
        },
      }),
    );
  }
}
