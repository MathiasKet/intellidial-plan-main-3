export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public errors?: Record<string, any>,
    stack: string = ''
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  static badRequest(message: string, errors?: Record<string, any>) {
    return new ApiError(400, message, errors);
  }

  static unauthorized(message = 'Unauthorized') {
    return new ApiError(401, message);
  }

  static forbidden(message = 'Forbidden') {
    return new ApiError(403, message);
  }

  static notFound(message = 'Not Found') {
    return new ApiError(404, message);
  }

  static conflict(message: string, errors?: Record<string, any>) {
    return new ApiError(409, message, errors);
  }

  static internal(message = 'Internal Server Error') {
    return new ApiError(500, message);
  }

  static notImplemented(message = 'Not Implemented') {
    return new ApiError(501, message);
  }
}
