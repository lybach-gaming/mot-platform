'use client';

import { useEffect } from 'react';
import type { RequestHandler } from 'msw';
import { createBrowserWorker } from './createBrowserWorker.js';

type Window = Record<string, unknown>;
declare const window: Window & typeof globalThis;

/**
 * Universal MSW initializer for Next.js (App Router or Pages Router).
 *
 * Each app just imports <Mocker handlers={myHandlers}/> and adds it once
 * in layout.tsx or _app.tsx.
 */
export function Mocker({
  handlers,
  serviceWorkerUrl = '/mockServiceWorker.js',
  enable = process.env.NEXT_PUBLIC_API_MOCKING === 'true',
}: {
  handlers: RequestHandler[];
  serviceWorkerUrl?: string;
  enable?: boolean;
}) {
  useEffect(() => {
    if (!enable || typeof window === 'undefined') return;
    if ((window as any).__MSW_STARTED__) return;

    (async () => {
      const worker = createBrowserWorker(...handlers);
      await worker.start({
        onUnhandledRequest: 'bypass',
        serviceWorker: { url: serviceWorkerUrl },
      });
      (window as any).__MSW_STARTED__ = true;
      if (process.env.NEXT_PUBLIC_LOG_MSW === 'true') {
        // eslint-disable-next-line no-console
        console.log('[MSW] Browser worker started');
      }
    })();
  }, [enable, handlers, serviceWorkerUrl]);

  return null;
}
