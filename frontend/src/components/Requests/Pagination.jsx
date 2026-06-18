import React from 'react';

export const Pagination = ({ currentPage, totalItems, itemsPerPage, onPageChange }) => {
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <nav className="pagination-nav" aria-label="Pagination Navigation">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="pagination-btn arrow-btn"
        aria-label="Go to previous page"
      >
        &larr; Prev
      </button>

      <div className="pagination-numbers">
        {getPageNumbers().map((pageNum) => (
          <button
            key={pageNum}
            onClick={() => onPageChange(pageNum)}
            className={`pagination-btn num-btn ${currentPage === pageNum ? 'active' : ''}`}
            aria-label={`Go to page ${pageNum}`}
            aria-current={currentPage === pageNum ? 'page' : undefined}
          >
            {pageNum}
          </button>
        ))}
      </div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="pagination-btn arrow-btn"
        aria-label="Go to next page"
      >
        Next &rarr;
      </button>
    </nav>
  );
};

export default Pagination;
