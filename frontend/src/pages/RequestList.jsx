import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import requestService from '../services/requestService';
import RequestCard from '../components/Requests/RequestCard';
import RequestFilters from '../components/Requests/RequestFilters';
import Pagination from '../components/Requests/Pagination';
import LoadingSpinner from '../components/LoadingSpinner';

export const RequestList = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [prioritySort, setPrioritySort] = useState('NONE');

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      // Load 100 requests to filter/sort client-side for high interactive fidelity
      const data = await requestService.listRequests(0, 100);
      setRequests(data || []);
    } catch (err) {
      console.error('Failed to load requests:', err);
      setError(err.message || 'Failed to retrieve approval requests.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleDeleteRequest = async (id) => {
    if (!window.confirm('Are you sure you want to delete this approval request?')) return;
    try {
      await requestService.deleteRequest(id);
      fetchRequests();
    } catch (err) {
      console.error('Failed to delete request:', err);
      alert(err.message || 'Failed to delete request.');
    }
  };

  // Process data client-side (search, filter, sort)
  const getProcessedRequests = () => {
    let list = [...requests];

    // Search by title
    if (searchQuery) {
      list = list.filter((req) =>
        req.title?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'ALL') {
      list = list.filter(
        (req) => req.status?.toUpperCase() === statusFilter.toUpperCase()
      );
    }

    // Priority sort
    if (prioritySort !== 'NONE') {
      const priorityWeights = { HIGH: 3, MEDIUM: 2, LOW: 1 };
      list.sort((a, b) => {
        const weightA = priorityWeights[a.priority?.toUpperCase()] || 0;
        const weightB = priorityWeights[b.priority?.toUpperCase()] || 0;
        return prioritySort === 'DESC' ? weightB - weightA : weightA - weightB;
      });
    }

    return list;
  };

  const processedRequests = getProcessedRequests();

  // Paginated chunk
  const totalItems = processedRequests.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRequests = processedRequests.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  if (loading) {
    return <LoadingSpinner fullPage={true} />;
  }

  return (
    <div className="request-list-page" aria-label="Requests Catalogue">
      <header className="page-header-row">
        <h1 className="page-title">Approval Requests</h1>
        <button 
          onClick={() => navigate('/requests/new')}
          className="action-btn-primary"
        >
          Create Request
        </button>
      </header>

      {error && <div className="error-banner">{error}</div>}

      <RequestFilters
        searchQuery={searchQuery}
        statusFilter={statusFilter}
        prioritySort={prioritySort}
        onSearchChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
        onStatusChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
        onPriorityChange={(e) => { setPrioritySort(e.target.value); setCurrentPage(1); }}
      />

      {paginatedRequests.length > 0 ? (
        <>
          <div className="requests-grid">
            {paginatedRequests.map((req) => (
              <RequestCard 
                key={req.id} 
                request={req} 
                onDelete={handleDeleteRequest} 
              />
            ))}
          </div>
          <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </>
      ) : (
        <div className="empty-state-card">
          No approval requests match your search criteria.
        </div>
      )}
    </div>
  );
};

export default RequestList;