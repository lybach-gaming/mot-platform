import { usePathname } from 'next/navigation';

export function useActivePath(): string {
  const pathname = usePathname();

  const stripQueryAndHash = (path: string) => path.split(/[?#]/)[0];

  return stripQueryAndHash(pathname);
}
