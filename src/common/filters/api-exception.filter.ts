import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(ApiExceptionFilter.name);

  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const { httpAdapter } = this.httpAdapterHost;

    const context = host.switchToHttp();
    const request = context.getRequest();
    const response = context.getResponse();

    const isHttpException = exception instanceof HttpException;

    const statusCode = isHttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse = isHttpException ? exception.getResponse() : null;

    const messages =
      typeof exceptionResponse === 'object' &&
      exceptionResponse !== null &&
      'message' in exceptionResponse
        ? exceptionResponse.message
        : exceptionResponse;

    const isValidationError = Array.isArray(messages);

    if (!isHttpException) {
      this.logger.error(exception);
    }

    httpAdapter.reply(
      response,
      {
        success: false,
        statusCode,

        message: isValidationError
          ? 'Validation failed'
          : typeof messages === 'string'
            ? messages
            : 'Internal server error',

        ...(isValidationError ? { errors: messages } : {}),

        path: httpAdapter.getRequestUrl(request),
      },
      statusCode,
    );
  }
}
