import React from 'react';

export const RequestFilters = ({
  searchQuery,
  statusFilter,
  prioritySort,
  onSearchChange,
  onStatusChange,
  onPriorityChange,
}) => {
  return (
    <div className="filters-container" role="search" aria-label="Filter Requests">
      <div className="filter-item search-box-wrapper">
        <label htmlFor="search-input" className="filter-label">Search Title</label>
        <div className="input-with-icon">
          <input
            id="search-input"
            type="text"
            placeholder="Search by title..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="filter-input search-input"
            aria-label="Search approval requests by title"
          />
        </div>
      </div>

      <div className="filter-item select-wrapper">
        <label htmlFor="status-select" className="filter-label">Filter by Status</label>
        <select
          id="status-select"
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value)}
          className="filter-select"
          aria-label="Filter requests by status"
        >
          <option value="ALL">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      <div className="filter-item select-wrapper">
        <label htmlFor="priority-select" className="filter-label">Sort by Priority</label>
        <select
          id="priority-select"
          value={prioritySort}
          onChange={(e) => onPriorityChange(e.target.value)}
          className="filter-select"
          aria-label="Sort requests by priority"
        >
          <option value="NONE">No Sorting</option>
          <option value="HIGH_FIRST">High Priority First</option>
          <option value="LOW_FIRST">Low Priority First</option>
        </select>
      </div>
    </div>
  );
};

export default RequestFilters;