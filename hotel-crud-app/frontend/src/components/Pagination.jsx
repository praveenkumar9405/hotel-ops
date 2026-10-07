import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ pagination, onPageChange }) => {
  const { totalItems = 0, totalPages = 1, currentPage = 1, limit = 6 } = pagination;

  if (totalPages <= 1 && totalItems <= limit) {
    return null;
  }

  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * limit + 1;
  const endItem = Math.min(currentPage * limit, totalItems);

  // Compute page numbers with ellipsis
  const getPageNumbers = () => {
    const pages = [];
    const delta = 1;

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        pages.push(i);
      } else if (
        (i === currentPage - delta - 1 && i > 1) ||
        (i === currentPage + delta + 1 && i < totalPages)
      ) {
        pages.push('...');
      }
    }

    return pages.filter((page, index, arr) => {
      return page !== '...' || arr[index - 1] !== '...';
    });
  };

  const pages = getPageNumbers();

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-6 bg-white border border-slate-200/80 rounded-xl shadow-subtle mt-8">
      <div className="text-xs text-slate-500">
        Showing <span className="font-semibold text-slate-800">{startItem}</span> to{' '}
        <span className="font-semibold text-slate-800">{endItem}</span> of{' '}
        <span className="font-semibold text-slate-800">{totalItems}</span> properties
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="inline-flex items-center justify-center p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title="Previous Page"
        >
          <ChevronLeft size={16} />
        </button>

        {pages.map((p, idx) => {
          if (p === '...') {
            return (
              <span key={`ellipsis-${idx}`} className="px-2 text-xs text-slate-400 select-none">
                ...
              </span>
            );
          }

          const isActive = p === currentPage;

          return (
            <button
              key={`page-${p}`}
              type="button"
              onClick={() => onPageChange(p)}
              className={`min-w-[34px] h-[34px] flex items-center justify-center text-xs font-semibold rounded-lg transition-all ${
                isActive
                  ? 'bg-[#1266F1] text-white shadow-sm shadow-blue-500/20'
                  : 'text-slate-700 hover:bg-slate-100 border border-transparent'
              }`}
            >
              {p}
            </button>
          );
        })}

        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="inline-flex items-center justify-center p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title="Next Page"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
