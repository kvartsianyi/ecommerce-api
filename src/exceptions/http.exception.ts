import { HttpStatusCode } from '@/constants';

export type ExeptionDetails = Record<string, unknown> | Record<string, unknown>[];

export abstract class HttpException extends Error {
  statusCode: HttpStatusCode;
  details?: ExeptionDetails;

  constructor(message: string, statusCode: HttpStatusCode, details?: ExeptionDetails) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.constructor.name;
    this.details = details;
    Error.captureStackTrace?.(this, this.constructor);
  }
}

export class BadRequestException extends HttpException {
  constructor(message = 'Bad Request', details?: ExeptionDetails) {
    super(message, HttpStatusCode.BAD_REQUEST, details);
  }
}

export class UnauthorizedException extends HttpException {
  constructor(message = 'Unauthorized', details?: ExeptionDetails) {
    super(message, HttpStatusCode.UNAUTHORIZED, details);
  }
}

export class ForbiddenException extends HttpException {
  constructor(message = 'Forbidden', details?: ExeptionDetails) {
    super(message, HttpStatusCode.FORBIDDEN, details);
  }
}

export class NotFoundException extends HttpException {
  constructor(message = 'Not Found', details?: ExeptionDetails) {
    super(message, HttpStatusCode.NOT_FOUND, details);
  }
}

export class InternalServerErrorException extends HttpException {
  constructor(message = 'Internal Server Error', details?: ExeptionDetails) {
    super(message, HttpStatusCode.INTERNAL_SERVER_ERROR, details);
  }
}
