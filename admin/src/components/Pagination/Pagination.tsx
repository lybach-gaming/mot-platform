import { useMemo } from 'react';
import {
  Pagination as BasePagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from './PaginationBase';

interface PaginationProps {
  page?: number; // 1-based
  total?: number; // total pages
  onPageChange?: (page: number) => void; // 1-based
}

export function Pagination({
  page = 1,
  total = 1,
  onPageChange,
}: PaginationProps) {
  const canGoPrevious = page > 1;
  const canGoNext = page < total;

  const handlePageChange = (newPage: number) => {
    if (newPage !== page) {
      onPageChange?.(newPage);
    }
  };

  const content = useMemo(() => {
    if (total <= 4) {
      return Array.from({ length: total }, (_, i) => i + 1).map((p) => (
        <PaginationItem key={p}>
          <PaginationLink
            isActive={p === page}
            onClick={() => handlePageChange(p)}
          >
            {p}
          </PaginationLink>
        </PaginationItem>
      ));
    }

    let startPage = Math.max(1, page - 1);
    const endPage = Math.min(total, startPage + 2);

    if (endPage - startPage < 2) {
      startPage = Math.max(1, endPage - 2);
    }

    const pages = [];

    if (startPage > 1) {
      pages.push(
        <PaginationItem key="first">
          <PaginationLink onClick={() => handlePageChange(1)}>1</PaginationLink>
        </PaginationItem>
      );
      if (startPage > 2) {
        pages.push(
          <PaginationItem key="ellipsis-start">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <PaginationItem key={i}>
          <PaginationLink
            isActive={i === page}
            onClick={() => handlePageChange(i)}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }

    if (endPage < total) {
      if (endPage < total - 1) {
        pages.push(
          <PaginationItem key="ellipsis-end">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }
      pages.push(
        <PaginationItem key="last">
          <PaginationLink
            isActive={page === total}
            onClick={() => handlePageChange(total)}
          >
            {total}
          </PaginationLink>
        </PaginationItem>
      );
    }

    return pages;
  }, [page, total]);

  if (total <= 1) return null;

  return (
    <BasePagination className="bg-white px-4 py-3">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            onClick={() => handlePageChange(page - 1)}
            isActive={canGoPrevious}
          />
        </PaginationItem>
        {content}
        <PaginationItem>
          <PaginationNext
            onClick={() => handlePageChange(page + 1)}
            isActive={canGoNext}
          />
        </PaginationItem>
      </PaginationContent>
    </BasePagination>
  );
}
