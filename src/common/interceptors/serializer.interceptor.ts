import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { from, Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Serializable } from '@common/serializers/base.serializer';

@Injectable()
export class SerializerInterceptor implements NestInterceptor {
  private async serializeResponse(
    response: Response,
  ): Promise<Record<string, any>> {
    const serializedProperties = await Promise.all(
      Object.keys(response).map(async (key) => {
        const value = response[key];

        if (!(value instanceof Serializable)) {
          return {
            key,
            value,
          };
        }

        const serializedValue = await value.serialize();

        return {
          key,
          value: serializedValue,
        };
      }),
    );

    return serializedProperties.reduce((result, { key, value }) => {
      result[key] = value;

      return result;
    }, {});
  }

  public intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<any> {
    return next.handle().pipe(
      switchMap((response) => {
        if (typeof response !== 'object' || response === null) {
          return of(response);
        }

        return from(this.serializeResponse(response));
      }),
    );
  }
}
