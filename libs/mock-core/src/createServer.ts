import { setupServer } from 'msw/node';
import type { RequestHandler } from 'msw';

/**
 * Create a Node/SSR mock server for Next.js instrumentation & tests.
 */
export function createServer(...handlers: RequestHandler[]) {
  return setupServer(...handlers);
}
