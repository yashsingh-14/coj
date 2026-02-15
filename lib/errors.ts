// Custom Error Classes for Better Error Handling

export class AppError extends Error {
    constructor(
        public message: string,
        public statusCode: number = 500,
        public userMessage: string = "Something went wrong",
        public isOperational: boolean = true
    ) {
        super(message);
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}

export class ValidationError extends AppError {
    constructor(message: string, userMessage?: string) {
        super(
            message,
            400,
            userMessage || "Invalid input provided",
            true
        );
    }
}

export class AuthenticationError extends AppError {
    constructor(message: string = "Authentication failed") {
        super(
            message,
            401,
            "Please log in to continue",
            true
        );
    }
}

export class AuthorizationError extends AppError {
    constructor(message: string = "Not authorized") {
        super(
            message,
            403,
            "You don't have permission to perform this action",
            true
        );
    }
}

export class NotFoundError extends AppError {
    constructor(resource: string = "Resource") {
        super(
            `${resource} not found`,
            404,
            `${resource} not found`,
            true
        );
    }
}

export class RateLimitError extends AppError {
    constructor(resetTime?: string) {
        const userMsg = resetTime
            ? `Too many requests. Please try again after ${resetTime}`
            : "Too many requests. Please try again later";

        super(
            "Rate limit exceeded",
            429,
            userMsg,
            true
        );
    }
}

export class DatabaseError extends AppError {
    constructor(message: string = "Database operation failed") {
        super(
            message,
            500,
            "A database error occurred. Please try again",
            false
        );
    }
}

export class ExternalAPIError extends AppError {
    constructor(service: string, message?: string) {
        super(
            message || `${service} API failed`,
            502,
            `External service (${service}) is temporarily unavailable`,
            false
        );
    }
}

// Error Handler Utility
export function handleError(error: unknown) {
    if (error instanceof AppError) {
        return {
            message: error.message,
            userMessage: error.userMessage,
            statusCode: error.statusCode,
            isOperational: error.isOperational
        };
    }

    // Unknown errors
    console.error('Unexpected error:', error);
    return {
        message: error instanceof Error ? error.message : 'Unknown error',
        userMessage: 'An unexpected error occurred',
        statusCode: 500,
        isOperational: false
    };
}
