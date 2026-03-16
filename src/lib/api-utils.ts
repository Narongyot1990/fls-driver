import { NextRequest, NextResponse } from 'next/server';
import dbConnect from './mongodb';
import { requireAuth } from './api-auth';
import { ZodError } from 'zod';
import { ApiError } from './api-errors';
import type { TokenPayload } from './jwt-auth';

type HandlerContext = {
  payload: TokenPayload | null;
  req: NextRequest;
};

type ApiHandlerOptions = {
  requireAuth?: boolean;
  allowedRoles?: TokenPayload['role'][];
};

export function apiHandler(
  handler: (ctx: HandlerContext) => Promise<NextResponse>,
  options: ApiHandlerOptions = { requireAuth: true }
) {
  return async (req: NextRequest) => {
    try {
      // 1. Database Connection
      await dbConnect();

      // 2. Authentication & Authorization
      let payload = null;
      if (options.requireAuth) {
        const authResult = requireAuth(req);
        if ('error' in authResult) return authResult.error;
        
        payload = authResult.payload;

        // Role Check
        if (options.allowedRoles && !options.allowedRoles.includes(payload.role)) {
          return NextResponse.json(
            { error: `Forbidden: Allowed roles are ${options.allowedRoles.join(', ')}` },
            { status: 403 }
          );
        }
      }

      // 3. Execute Handler
      return await handler({ payload, req });

    } catch (error: unknown) {
      console.error('[API_ERROR]', error);

      if (error instanceof ZodError) {
        return NextResponse.json({
          success: false,
          error: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: error.issues.map(issue => ({ path: issue.path, message: issue.message }))
        }, { status: 400 });
      }

      if (error instanceof ApiError) {
        return NextResponse.json({
          success: false,
          error: error.message,
          code: error.code,
          details: error.details
        }, { status: error.status });
      }

      return NextResponse.json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
        code: 'INTERNAL_SERVER_ERROR'
      }, { status: 500 });
    }
  };
}
