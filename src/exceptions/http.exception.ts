import { HttpStatusCode } from '@/constants';

export abstract class HttpException extends Error {
  statusCode: HttpStatusCode;

  constructor(message: string, statusCode: HttpStatusCode) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.constructor.name;
    Error.captureStackTrace?.(this, this.constructor);
  }
}

export class BadRequestException extends HttpException {
  constructor(message = 'Bad Request') {
    super(message, HttpStatusCode.BAD_REQUEST);
  }
}

export class UnauthorizedException extends HttpException {
  constructor(message = 'Unauthorized') {
    super(message, HttpStatusCode.UNAUTHORIZED);
  }
}

export class ForbiddenException extends HttpException {
  constructor(message = 'Forbidden') {
    super(message, HttpStatusCode.FORBIDDEN);
  }
}

export class NotFoundException extends HttpException {
  constructor(message = 'Not Found') {
    super(message, HttpStatusCode.NOT_FOUND);
  }
}

export class InternalServerErrorException extends HttpException {
  constructor(message = 'Internal Server Error') {
    super(message, HttpStatusCode.INTERNAL_SERVER_ERROR);
  }
}
