import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import requestService from '../services/requestService';
import RequestForm from '../components/Requests/RequestForm';
import LoadingSpinner from '../components/LoadingSpinner';

export const RequestManagement = ({ isEdit = false }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchRequest = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await requestService.getRequest(id);
      if (data.status?.toUpperCase() !== 'PENDING') {
        throw new Error(`Cannot edit a request that is already ${data.status}.`);
      }
      setRequest(data);
    } catch (err) {
      console.error('Failed to load request for editing:', err);
      setError(err.message || 'Failed to retrieve request details.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (isEdit && id) fetchRequest();
  }, [isEdit, id, fetchRequest]);

  const handleSubmit = async (payload) => {
    if (isEdit) {
      await requestService.updateRequest(id, payload);
    } else {
      await requestService.createRequest(payload);
    }
    navigate('/requester');
  };

  const handleCancel = () => navigate(-1);

  if (loading) return <LoadingSpinner fullPage={true} />;

  return (
    <div className="request-mgmt-page" aria-label="Request Creator Management">
      {/* Page header */}
      <div className="page-header-row">
        <button onClick={handleCancel} className="back-nav-btn" aria-label="Go back">
          ← Cancel
        </button>
        <h1 className="page-title">
          {isEdit ? 'Edit Approval Request' : 'New Approval Request'}
        </h1>
      </div>

      <div className="request-mgmt-main">
        {error && <div className="error-banner" style={{ marginBottom: '1rem' }}>{error}</div>}

        <div className="form-card">
          <RequestForm
            initialData={isEdit ? request : null}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            submitLabel={isEdit ? 'Save Changes' : 'Submit Request'}
          />
        </div>
      </div>
    </div>
  );
};

export default RequestManagement;