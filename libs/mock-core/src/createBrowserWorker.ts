import { setupWorker } from 'msw/browser';
import type { RequestHandler } from 'msw';

/**
 * Create (but do not start) a browser worker with app-provided handlers.
 * Usage in app: const worker = createBrowserWorker(...handlers)
 */
export function createBrowserWorker(...handlers: RequestHandler[]) {
  return setupWorker(...handlers);
}
